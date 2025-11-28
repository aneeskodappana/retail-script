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

async function execute() {
    const projectName = process.env.PROJECT;
    if (!projectName) {
        throw new Error('PROJECT environment variable is not set.');
    }
    const key = projectName as keyof typeof projectConfig
    const project = projectConfig[key];
    const assets = assetExtractor[key];
    const floorPlanPath = `assets/${projectName}/${assets.mallInterior}`;

    const floorPlanFiles = await fs.readdir(floorPlanPath, { withFileTypes: true });
    // layout2ds
    const imageEntries = floorPlanFiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => ({
        fullPath: `${assets.mallFloorPlan}/${e.name}`,
        fileName: e.name
    }));

    const viewConfigData: Array<TViewConfig> = [];
    const layout3DData: Array<TLayout3D> = [];
    const hotspotGroupData: Array<THotspotGroup> = [];
    const hotspotData: Array<THotspot> = []

    // Parse coords.csv for hotspot positions
    const csvPath = path.join(floorPlanPath, 'coords.csv');
    let csvContent = await fs.readFile(csvPath, 'utf-8');
    // Remove BOM if present
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }
    const csvRows = parse(csvContent, { columns: true, skip_empty_lines: true, bom: true }) as Array<Record<string, string>>;

    // Extract all identifiers and sort them
    const allIdentifiers = csvRows.map(row => row.name?.trim()).filter(Boolean).sort((a, b) => parseFloat(a) - parseFloat(b));

    // Build a map: identifier -> { coordinates for other targets }
    const coordsMap = new Map<string, string[]>();
    csvRows.forEach(row => {
        if (!row.name) return;
        const coords: string[] = [];
        for (let i = 1; i <= 4; i++) {
            const coord = row[`Label Coordinates ${i}`];
            if (coord && coord.trim()) {
                coords.push(coord.trim());
            }
        }
        coordsMap.set(row.name.trim(), coords);
    });

    // Map to store hotspotGroupId by viewConfigCode
    const hotspotGroupIdMap = new Map<string, string>();

    imageEntries.forEach(e => {

        // view config first -> grove_grove-retail-mall-3
        // 1. ViewConfig
        const viewConfigCode = `${key}_mall_${e.fileName.replace('.', '_').replace('.webp', '')}`; // <project>_retail_<code> => <code> used for marker navigateTo
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
        // 1:1 viewConfig -> Layout3D 
        const layout3DUUid = v4();
        layout3DData.push({
            Id: layout3DUUid,
            ViewConfigId: viewConfigUUID,
            ModelUrl: '',
            DefaultHotspotGroupIndex: 0,
        });
        // 1:1  Layout3D -> HotspotGroup
        const hotspotGroupId = v4();
        hotspotGroupData.push({
            Id: hotspotGroupId,
            Name: viewConfigCode,
            HotspotGroupIndex: 0,
            DefaultHotspotIndex: 0,
            Layout3DId: layout3DUUid
        });
        hotspotGroupIdMap.set(viewConfigCode, hotspotGroupId);

    });

    // Generate hotspots for each source image
    imageEntries.forEach(e => {
        // Extract identifier from filename: P_1.27_TheGroveMall.webp -> 1.27
        const match = e.fileName.match(/P_(\d+\.\d+)_/);
        if (!match) return;
        const sourceId = match[1];

        const viewConfigCode = `${key}_mall_${e.fileName.replace('.', '_').replace('.webp', '')}`;
        const hotspotGroupId = hotspotGroupIdMap.get(viewConfigCode);
        if (!hotspotGroupId) return;

        const mediaUrl = `/${assets.mallInterior}/${e.fileName}`;
        const coords = coordsMap.get(sourceId) || [];

        // Get sorted targets (all identifiers except self)
        const targets = allIdentifiers.filter(id => id !== sourceId);

        // HotspotIndex 0: Self/default hotspot
        hotspotData.push({
            Id: v4(),
            HotspotIndex: 0,
            Name: viewConfigCode,
            MediaUrl: mediaUrl,
            HotspotGroupId: hotspotGroupId,
            PositionJson: '{"X":0,"Y":0,"Z":0}'
        });

        // HotspotIndex 1+: Navigation hotspots to other views
        coords.forEach((coord, idx) => {
            if (idx >= targets.length) return;
            const targetId = targets[idx];
            // Build target viewConfigCode from targetId
            const targetFileName = imageEntries.find(img => img.fileName.includes(`P_${targetId}_`))?.fileName;
            if (!targetFileName) return;
            const targetViewConfigCode = `${key}_mall_${targetFileName.replace('.', '_').replace('.webp', '')}`;

            // Parse coordinate string "X, Y, Z" -> PositionJson
            const [x, y, z] = coord.split(',').map(s => s.trim());
            const positionJson = `{"X":${x},"Y":${y},"Z":${z}}`;

            hotspotData.push({
                Id: v4(),
                HotspotIndex: idx + 1,
                Name: targetViewConfigCode,
                MediaUrl: mediaUrl,
                HotspotGroupId: hotspotGroupId,
                PositionJson: positionJson
            });
        });
    });

    const viewConfigs = BuildViewConfig(viewConfigData);
    BuildLayout3D(layout3DData);
    BuildHotspotGroups(hotspotGroupData);
    BuildHotspots(hotspotData);
    
    writeLogFilesAndFlush('up', 'interior');


    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', viewConfigs.map(x => x.Id)).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'interior');




}

export const mallInterior = {
    execute
}