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
import { BuildNavigations, TNavigation } from "../objects/Navigation";

async function execute() {
    const projectName = process.env.PROJECT;
    if (!projectName) {
        throw new Error('PROJECT environment variable is not set.');
    }
    const key = projectName as keyof typeof projectConfig;
    const project = projectConfig[key];
    const assets = assetExtractor[key];
    const interiorBasePath = `assets/${projectName}/${assets.mallInterior}`;

    const interiorDirContents = await fs.readdir(interiorBasePath, { withFileTypes: true });
    const floorFolders = interiorDirContents.filter(x => x.isDirectory()).map(d => d.name);

    const allViewConfigCodes: string[] = [];

    for (const floorFolder of floorFolders) {
        const floorInteriorPath = `${interiorBasePath}/${floorFolder}`;
        const floorAssetPath = `${assets.mallInterior}/${floorFolder}`;

        const interiorFiles = await fs.readdir(floorInteriorPath, { withFileTypes: true });
        const imageEntries = interiorFiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => ({
            fullPath: `${floorAssetPath}/${e.name}`,
            fileName: e.name
        }));

        if (imageEntries.length === 0) continue;

        const { sourceToFileName, uniqueSources, buildHotspotRows } = await assets.processInteriorCsv(floorInteriorPath, imageEntries);

        const viewConfigData: Array<TViewConfig> = [];
        const layout3DData: Array<TLayout3D> = [];
        const hotspotGroupData: Array<THotspotGroup> = [];
        const hotspotGroupIdMap = new Map<string, string>();

        uniqueSources.forEach((source: string) => {
            const fileName = sourceToFileName.get(source);
            if (!fileName) return;

            // @TODO: update view config code to not use spaces
            // also update the marker navigate to no use spaces
            const viewConfigCode = `${project.interior.Code}_${fileName.replace('.', '_').replace('.webp', '').replace('_webp', '')}`;
            const viewConfigUUID = v4();

            viewConfigData.push({
                Id: viewConfigUUID,
                Kind: ViewConfigKind.Interior,
                Code: viewConfigCode,
                Title: fileName.replace('.webp', '').replace('.jpg', ''),
                Subtitle: projectConfig?.[key]?.mallInteriorTitle,
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

        const hotspotRows = buildHotspotRows(hotspotGroupIdMap, floorAssetPath);
        const hotspotData: Array<THotspot> = hotspotRows.map(row => ({
            Id: v4(),
            HotspotIndex: row.hotspotIndex,
            Name: row.targetViewConfigCode.replace(".", '_'),
            MediaUrl: row.mediaUrl,
            HotspotGroupId: row.hotspotGroupId,
            PositionJson: row.positionJson,
            OffsetRotationJson: row.offsetRotationJson
        }));

        const viewConfigs = BuildViewConfig(viewConfigData);
        BuildLayout3D(layout3DData);
        BuildHotspotGroups(hotspotGroupData);
        BuildHotspots(hotspotData);

        allViewConfigCodes.push(...viewConfigs.map(vc => vc.Code));

        // Navigations for each ViewConfig within this floor
        for (let i = 0; i < viewConfigs.length; i++) {
            const currentViewConfig = viewConfigs[i];
            const navigations: TNavigation[] = viewConfigs.map((vc, j) => ({
                Id: v4(),
                DisplayName: vc.Title,
                DisplayOrder: j,
                IsPriority: i === j,
                NavigationUrl: `${project.interior.NavigationBaseUrl}/${vc.Title}`,
                ViewConfigId: currentViewConfig.Id,
                CardImageUrl: '',
                DisplaySubName: ''
            }));
            BuildNavigations(navigations);
        }
    }

    writeLogFilesAndFlush('up', 'interior');

    // clean up
    const selectSql = pg.table(tableNames.ViewConfigs).whereIn('Code', allViewConfigCodes).select('*').toQuery() + ';';
    queryLogBuilder.addDown(`-- Verification: ${selectSql}`);
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Code', allViewConfigCodes).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'interior');
}

export const mallInterior = {
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