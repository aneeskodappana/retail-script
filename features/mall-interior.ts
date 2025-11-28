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
        hotspotGroupData.push({
            Id: v4(),
            Name: viewConfigCode,
            HotspotGroupIndex: 0,
            DefaultHotspotIndex: 0,
            Layout3DId: layout3DUUid
        })


    })
    const viewConfigs = BuildViewConfig(viewConfigData);
    BuildLayout3D(layout3DData);
    BuildHotspotGroups(hotspotGroupData);
    
    writeLogFilesAndFlush('up', 'interior');


    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', viewConfigs.map(x => x.Id)).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'interior');




}

export const mallInterior = {
    execute
}