import { v4 } from "uuid";
import { BuildViewConfig, TViewConfig, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import { queryLogBuilder } from "../query-log-builder";
import { pg, tableNames } from "../db";
import { assetExtractor } from "../asset-extractor";
import fs from "fs/promises";
import { getCSVContents, writeLogFilesAndFlush } from "../util";
import { BuildLayout2D, TLayout2D } from "../objects/Layout2D";
import { BuildMarker, TMarker } from "../objects/Marker";
import slugify from "slugify";

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
    const key = projectName as keyof typeof projectConfig
    const project = projectConfig[key];
    const assets = assetExtractor[key];
    const floorPlanPath = `assets/${projectName}/${assets.mallFloorPlan}`;

    const floorPlanFiles = await fs.readdir(floorPlanPath, { withFileTypes: true });
    // layout2ds
    const imageEntries = floorPlanFiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => `${assets.mallFloorPlan}/${e.name}`);
    // markers
    const csvEntry = floorPlanFiles.filter(x => x.isFile() && x.name.endsWith('csv'))?.[0];
    if (!csvEntry) {
        throw new Error('No CSV file found for retail floor markers.');
    }


    const markerInputs = await getCSVContents<CSVStructure>(`${floorPlanPath}/${csvEntry.name}`);

    // 1. ViewConfig
    const config = project.floorPlan;
    const viewConfigData: Array<TViewConfig> = [{
        Id: v4(),
        Kind: ViewConfigKind.Floor,
        Code: config.Code,
        Title: config.Title,
        Subtitle: config.Subtitle,
        HasGallery: false,
        CdnBaseUrl: project.CdnBaseUrl
    }];


    const [viewConfig] = BuildViewConfig(viewConfigData);

    // 2. Layout2D
    const layout2DData: Array<TLayout2D> = imageEntries.map(x => {
        return ({
            Id: v4(),
            BackplateUrl: x,
            ViewConfigId: viewConfig.Id

        })
    })

    const [layout2d] = BuildLayout2D(layout2DData);
    // 3. Markers
    const markerData: Array<TMarker> = markerInputs.map(marker => {
        const code = slugify(marker.name).replace('.', '_');
        return {
            Id: v4(),
            Code: code,
            PositionTop: parseFloat(marker.y),
            PositionLeft: parseFloat(marker.x),
            NavigateTo: `${project.NavigationBaseUrl}mall/${projectName}_retail_mall/${marker.target.replace('.', '_')}`,
            Title: marker.name,
            Layout2DId: layout2d.Id,
            Kind: 20 
        }
    })

    BuildMarker(markerData);

    writeLogFilesAndFlush('up', 'floor')

    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', [viewConfig.Id]).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'floor');



}


export const mallFloor = {
    execute
}