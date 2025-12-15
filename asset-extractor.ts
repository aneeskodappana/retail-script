import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import { AssetExtrator, CsvExtractResult, GroveCsvRow, HotspotRowData, ImageEntry, YasCsvRow } from "./global.type";




export const assetExtractor: AssetExtrator = {
    grove: {
        mallFloorPlan: 'mall-floorplan',
        mallInterior: 'mall-interior',
        processInteriorCsv: fileNameBasedCsvAssetExtractor
    },
    yas: {
        mallFloorPlan: 'mall-floorplan',
        mallInterior: 'mall-interior',
        processInteriorCsv: fileNameBasedCsvAssetExtractor
    }
}


async function fileNameBasedCsvAssetExtractor(interiorPath: string, imageEntries: ImageEntry[]): Promise<CsvExtractResult> {
    const sourceToFileName = new Map<string, string>();
    const csvDataBySource = new Map<string, YasCsvRow[]>();

    for (const entry of imageEntries) {
        const baseName = entry.fileName.replace('.webp', '');
        sourceToFileName.set(baseName, entry.fileName);

        const csvPath = path.join(interiorPath, `${baseName}.csv`);
        try {
            let csvContent = await fs.readFile(csvPath, 'utf-8');
            if (csvContent.charCodeAt(0) === 0xFEFF) {
                csvContent = csvContent.slice(1);
            }
            const csvRows = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true }) as YasCsvRow[];
            csvDataBySource.set(baseName, csvRows);
        } catch {
            csvDataBySource.set(baseName, []);
        }
    }

    const uniqueSources = [...sourceToFileName.keys()];

    const buildHotspotRows = (hotspotGroupIdMap: Map<string, string>, assetPath: string): HotspotRowData[] => {
        const rows: HotspotRowData[] = [];

        for (const [source, csvRows] of csvDataBySource) {
            const hotspotGroupId = hotspotGroupIdMap.get(source);
            if (!hotspotGroupId) continue;

            const sourceFileName = sourceToFileName.get(source);
            if (!sourceFileName) continue;

            rows.push({
                hotspotIndex: 0,
                targetViewConfigCode: source,
                mediaUrl: `/${assetPath}/${sourceFileName}`,
                hotspotGroupId,
                positionJson: '{"X":0,"Y":0,"Z":0}',
                offsetRotationJson: '{"X":0,"Y":0,"Z":0}'
            });

            csvRows.forEach((row, idx) => {
                const target = row.target.trim();
                const targetViewConfigCode = target;
                const positionJson = `{"X":${row.px},"Y":${row.py},"Z":${row.pz}}`;
                const offsetRotationJson = `{"X":${row.rx},"Y":${row.ry},"Z":${row.rz}}`

                rows.push({
                    hotspotIndex: idx + 1,
                    targetViewConfigCode,
                    hotspotGroupId,
                    positionJson,
                    offsetRotationJson
                });
            });
        }
        return rows;
    };

    return { sourceToFileName, uniqueSources, buildHotspotRows };
}