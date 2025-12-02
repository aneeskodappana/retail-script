import { v4 } from "uuid";
import { assetExtractor } from "../asset-extractor";
import { BuildViewConfig, TViewConfig, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import fs from "fs/promises";
import { writeLogFilesAndFlush } from "../util";
import { pg, tableNames } from "../db";
import { queryLogBuilder } from "../query-log-builder";
import { BuildLayout3D, TLayout3D } from "../objects/Layout3D";
import { BuildHotspotGroups, THotspotGroup } from "../objects/HotspotGroup";
import { BuildHotspots, THotspot } from "../objects/Hotspot";
import path from "path";
import { parse } from "csv-parse/sync";

type CsvRow = {
    source: string;
    hotspot_index: string;
    target: string;
    position_x: string;
    position_y: string;
    position_z: string;
};

async function execute() {
    const projectName = process.env.PROJECT;
    if (!projectName) {
        throw new Error('PROJECT environment variable is not set.');
    }
    const key = projectName as keyof typeof projectConfig;
    const project = projectConfig[key];
    const assets = assetExtractor[key];
    const interiorPath = `assets/${projectName}/${assets.mallInterior}`;

    const interiorFiles = await fs.readdir(interiorPath, { withFileTypes: true });
    const imageEntries = interiorFiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => ({
        fullPath: `${assets.mallInterior}/${e.name}`,
        fileName: e.name
    }));

    // Parse coords-suggested-format.csv
    const csvPath = path.join(interiorPath, 'coords-suggested-format.csv');
    let csvContent = await fs.readFile(csvPath, 'utf-8');
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }
    const csvRows = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true }) as CsvRow[];

    // Get unique sources from CSV
    const uniqueSources = [...new Set(csvRows.map(row => row.source.trim()))];

    // Build filename lookup: source identifier -> filename
    const sourceToFileName = new Map<string, string>();
    imageEntries.forEach(e => {
        const match = e.fileName.match(/P_(\d+\.\d+)_/);
        if (match) {
            sourceToFileName.set(match[1], e.fileName);
        }
    });

    const viewConfigData: Array<TViewConfig> = [];
    const layout3DData: Array<TLayout3D> = [];
    const hotspotGroupData: Array<THotspotGroup> = [];
    const hotspotData: Array<THotspot> = [];

    // Map to store hotspotGroupId by source identifier
    const hotspotGroupIdMap = new Map<string, string>();

    // Create ViewConfig, Layout3D, HotspotGroup for each unique source
    uniqueSources.forEach(source => {
        const fileName = sourceToFileName.get(source);
        if (!fileName) return;

        // const viewConfigCode = `${key}_mall_${fileName.replace('.', '_').replace('.webp', '')}`;
        const viewConfigCode = `${project.interior.Code}_${fileName.replace('.', '_').replace('.webp', '')}`; // <project>_retail_<code> => <code> used for marker navigateTo
        const viewConfigUUID = v4();

        viewConfigData.push({
            Id: viewConfigUUID,
            Kind: ViewConfigKind.Interior,
            Code: viewConfigCode,
            Title: projectConfig?.[key]?.mallInteriorTitle,
            Subtitle: '',
            HasGallery: false,
            CdnBaseUrl: projectConfig?.[key]?.CdnBaseUrl
        });

        const layout3DUUid = v4();
        layout3DData.push({
            Id: layout3DUUid,
            ViewConfigId: viewConfigUUID,
            ModelUrl: '',
            DefaultHotspotGroupIndex: 0,
        });

        const hotspotGroupId = v4();
        hotspotGroupData.push({
            Id: hotspotGroupId,
            Name: viewConfigCode,
            HotspotGroupIndex: 0,
            DefaultHotspotIndex: 0,
            Layout3DId: layout3DUUid
        });

        hotspotGroupIdMap.set(source, hotspotGroupId);
    });

    // Generate hotspots directly from CSV rows
    csvRows.forEach(row => {
        const source = row.source.trim();
        const target = row.target.trim();
        const hotspotIndex = parseInt(row.hotspot_index, 10);

        const hotspotGroupId = hotspotGroupIdMap.get(source);
        if (!hotspotGroupId) return;

        const sourceFileName = sourceToFileName.get(source);
        const targetFileName = sourceToFileName.get(target);
        if (!sourceFileName || !targetFileName) return;

        const mediaUrl = `/${assets.mallInterior}/${sourceFileName}`;
        const targetViewConfigCode = `${targetFileName.replace('.', '_').replace('.webp', '')}`;
        const positionJson = `{"X":${row.position_x},"Y":${row.position_y},"Z":${row.position_z}}`;

        hotspotData.push({
            Id: v4(),
            HotspotIndex: hotspotIndex,
            Name: targetViewConfigCode,
            MediaUrl: mediaUrl,
            HotspotGroupId: hotspotGroupId,
            PositionJson: positionJson
        });
    });

    const viewConfigs = BuildViewConfig(viewConfigData);
    BuildLayout3D(layout3DData);
    BuildHotspotGroups(hotspotGroupData);
    BuildHotspots(hotspotData);

    writeLogFilesAndFlush('up', 'interior-v2');

    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', viewConfigs.map(x => x.Id)).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'interior-v2');
}

export const mallInteriorV2 = {
    execute
};


/**
source,hotspot_index,target,position_x,position_y,position_z
1.11,0,1.11,0,0,0
1.11,1,1.19,-5946,-1861,160
1.11,2,1.25,-7946,-3257,160
1.11,3,1.27,-5956,-5594,160
1.19,0,1.19,0,0,0
1.19,1,1.11,210,3702,160
1.19,2,1.25,-2028,2147,160
1.19,3,1.27,1162,77,160
1.25,0,1.25,0,0,0
1.25,1,1.11,3412,-10870,160
1.25,2,1.19,2191,-12596,160
1.25,3,1.27,4188,-13999,160
1.27,0,1.27,0,0,0
1.27,1,1.11,1836,-4871,160
1.27,2,1.19,475,-5740,160
1.27,3,1.25,2655,-7571,160

 */