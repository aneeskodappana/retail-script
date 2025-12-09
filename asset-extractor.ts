import fs from "fs/promises";
import path from "path";
import { parse } from "csv-parse/sync";
import { AssetExtrator, CsvExtractResult, GroveCsvRow, HotspotRowData, ImageEntry, YasCsvRow } from "./global.type";




export const assetExtractor: AssetExtrator = {
    grove: {
        mallFloorPlan: 'mall-floorplan',
        mallInterior: 'mall-interior',
        processInteriorCsv: async function (interiorPath: string, imageEntries: ImageEntry[]): Promise<CsvExtractResult> {
            const csvPath = path.join(interiorPath, 'coords-suggested-format.csv');
            let csvContent = await fs.readFile(csvPath, 'utf-8');
            if (csvContent.charCodeAt(0) === 0xFEFF) {
                csvContent = csvContent.slice(1);
            }
            const csvRows = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true }) as GroveCsvRow[];

            const uniqueSources = [...new Set(csvRows.map(row => row.source.trim()))];

            const sourceToFileName = new Map<string, string>();
            imageEntries.forEach(e => {
                const match = e.fileName.match(/P_(\d+\.\d+)_/);
                if (match) {
                    sourceToFileName.set(match[1], e.fileName);
                }
            });

            const buildHotspotRows = (hotspotGroupIdMap: Map<string, string>, assetPath: string): HotspotRowData[] => {
                const rows: HotspotRowData[] = [];
                csvRows.forEach(row => {
                    const source = row.source.trim();
                    const target = row.target.trim();
                    const hotspotIndex = parseInt(row.hotspot_index, 10);

                    const hotspotGroupId = hotspotGroupIdMap.get(source);
                    if (!hotspotGroupId) return;

                    const sourceFileName = sourceToFileName.get(source);
                    const targetFileName = sourceToFileName.get(target);
                    if (!sourceFileName || !targetFileName) return;

                    const mediaUrl = `/${assetPath}/${sourceFileName}`;
                    const targetViewConfigCode = `${targetFileName.replace('.', '_').replace('.webp', '')}`;
                    const positionJson = `{"X":${row.position_x},"Y":${row.position_y},"Z":${row.position_z}}`;

                    rows.push({
                        hotspotIndex,
                        targetViewConfigCode,
                        mediaUrl,
                        hotspotGroupId,
                        positionJson
                    });
                });
                return rows;
            };

            return { sourceToFileName, uniqueSources, buildHotspotRows };
        }
    },
    yas: {
        mallFloorPlan: 'mall-floorplan',
        mallInterior: 'mall-interior',
        processInteriorCsv: async function (interiorPath: string, imageEntries: ImageEntry[]): Promise<CsvExtractResult> {
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
                        positionJson: '{"X":0,"Y":0,"Z":0}'
                    });

                    csvRows.forEach((row, idx) => {
                        const target = row.target.trim();
                        const targetViewConfigCode = target;
                        const positionJson = `{"X":${row.x},"Y":${row.y},"Z":${row.z}}`;

                        rows.push({
                            hotspotIndex: idx + 1,
                            targetViewConfigCode,
                            hotspotGroupId,
                            positionJson
                        });
                    });
                }
                return rows;
            };

            return { sourceToFileName, uniqueSources, buildHotspotRows };
        }
    }
}