import { v4 } from "uuid";
import { BuildViewConfig, TViewConfig, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import { queryLogBuilder } from "../query-log-builder";
import { pg } from "../db";
import { assetExtractor } from "../asset-extractor";
import fs from "fs/promises";
import { createReadStream } from "fs";
import csv from 'csv-parser';

type CSVStructure = {
    name: string,
    x: string,
    y: string,
    width: string,
    hight: string,
    target: string
}

async function execute() {

    const projectName = process.env.PROJECT;
    if (!projectName) {
        throw new Error('PROJECT environment variable is not set.');
    }
    const project = projectConfig[projectName as keyof typeof projectConfig];
    const assets = assetExtractor[projectName as keyof typeof assetExtractor];
    const floorPlanPath = `assets/${projectName}/${assets.retailFloorPlan}`;

    const floorPlanfiles = await fs.readdir(floorPlanPath, { withFileTypes: true });
    // layout2ds
    const imageEntries = floorPlanfiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => e.name);
    // markers
    const csvEntry = floorPlanfiles.filter(x => x.isFile() && x.name.endsWith('csv'))?.[0];


    const markerInputs: Array<CSVStructure> = [];
    createReadStream(`${floorPlanPath}/${csvEntry.name}`).pipe(csv()).on('data', (data) => markerInputs.push(data))
        .on('end', () => {
            console.log(markerInputs);
            // [
            //   { NAME: 'Daffy Duck', AGE: '24' },
            //   { NAME: 'Bugs Bunny', AGE: '22' }
            // ]
        });;



    return;

    const viewConfigData: Array<TViewConfig> = [{
        Id: v4(),
        Kind: ViewConfigKind.Floor,
        Code: 'grove_retail_grove-retail-mall',
        Title: 'Grove Retail Mall',
        Subtitle: 'Grove - Grove Beach Views',
        HasGallery: false,
        CdnBaseUrl: projectConfig.grove.CdnBaseUrl
    }];

    // const floorPlanImage = 

    const viewConfigs = BuildViewConfig(viewConfigData);
    const IDS = viewConfigs.map(vc => vc.Id);
    viewConfigs.map(x => {
        const layout2Ds = [{ "Code": "Layout-1", ParentId: x.Id }, { "Code": "Layout-2", ParentId: x.Id }];
        const layout2DsInsertSql = pg.table('layout2Ds').insert(layout2Ds).toQuery() + ';';
        queryLogBuilder.add(layout2DsInsertSql);
    })

}


export const retailFloor = {
    execute
}