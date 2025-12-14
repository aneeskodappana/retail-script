import { v4 } from "uuid";
import { BuildViewConfig, TViewConfig, TViewConfigWithMeta, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import { queryLogBuilder } from "../query-log-builder";
import { pg, tableNames } from "../db";
import { assetExtractor } from "../asset-extractor";
import fs from "fs/promises";
import { getCSVContents, writeLogFilesAndFlush } from "../util";
import { BuildLayout2D, TLayout2D } from "../objects/Layout2D";
import { BuildMarker, TMarker } from "../objects/Marker";
import { BuildNavigations, TNavigation } from "../objects/Navigation";
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
    const imageEntries = floorPlanFiles.filter(x => x.isFile() && x.name.endsWith('webp')).map(e => e.name);

    // 1. ViewConfig + Layout2D (one per image)
    const config = project.floorPlan;
    const viewConfigs: TViewConfigWithMeta[] = [];
    const layout2Ds: TLayout2D[] = [];

    const layoutIdMap: Record<string, string> = {};

    for (const imageFile of imageEntries) {
        const fileName = imageFile.replace('.webp', '');
        const code = `${slugify(fileName).replace(/\./g, '_')}`;
        
        const viewConfigId = v4();
        const layout2dId = v4();
        layoutIdMap[fileName] = layout2dId;

        viewConfigs.push({
            Id: viewConfigId,
            Kind: ViewConfigKind.Floor,
            Code: `${projectName}_${code}`,
            _code: code,
            Title: config.Title,
            Subtitle: config.Subtitle,
            HasGallery: false,
            CdnBaseUrl: project.CdnBaseUrl
        });

        layout2Ds.push({
            Id: layout2dId,
            BackplateUrl: `${assets.mallFloorPlan}/${imageFile}`,
            ViewConfigId: viewConfigId,
            BackplateHeight: 4096, // @TODO: Move this to config > Floor
            BackplateWidth: 4006
        });
    }

    // 1. ViewConfigs
    BuildViewConfig(viewConfigs);
    // 2. Layout2Ds
    BuildLayout2D(layout2Ds);

    // 3. Navigations (each ViewConfig gets navigation entries to all ViewConfigs)
    for (let i = 0; i < viewConfigs.length; i++) {
        const currentViewConfig = viewConfigs[i];
        const navigations: TNavigation[] = viewConfigs.map((vc, j) => ({
            Id: v4(),
            DisplayName: vc.Title,
            DisplayOrder: j,
            IsPriority: i === j,
            NavigationUrl: `${project.NavigationBaseUrl}mall/${vc._code}`,
            ViewConfigId: currentViewConfig.Id,
            CardImageUrl: '',
            DisplaySubName: ''
        }));
        BuildNavigations(navigations);
    }

    // 4. Markers
    for (const imageFile of imageEntries) {
        const fileName = imageFile.replace('.webp', '');
        const csvPath = `${floorPlanPath}/${fileName}.csv`;
        const layout2dId = layoutIdMap[fileName];

        const markerInputs = await getCSVContents<CSVStructure>(csvPath);
        const markerData: Array<TMarker> = markerInputs.map(marker => {
            const markerCode = slugify(marker.name).replace('.', '_');
            return {
                Id: v4(),
                Code: markerCode,
                PositionTop: parseFloat(marker.y),
                PositionLeft: parseFloat(marker.x),
                NavigateTo: `${project.NavigationBaseUrl}mall/${projectName}${project.floorPlan.navigationUrlSlug}/${marker.target.replace('.', '_')}`,
                Title: '',
                Layout2DId: layout2dId,
                Kind: 11,
                TitleVisible: false,
                IconUrl: '/pins/exterior-360.png'
            }
        });
        BuildMarker(markerData);
    }

    writeLogFilesAndFlush('up', 'floor')

    // clean up
    const viewConfigIds = viewConfigs.map(vc => vc.Id);
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', viewConfigIds).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'floor');



}


export const mallFloor = {
    execute
}