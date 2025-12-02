import { v4 } from "uuid";
import { BuildViewConfig, TViewConfig, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import { queryLogBuilder } from "../query-log-builder";
import { pg, tableNames } from "../db";
import { writeLogFilesAndFlush } from "../util";
import { BuildLayout2D, TLayout2D } from "../objects/Layout2D";

async function execute() {
    const projectName = process.env.PROJECT;
    if (!projectName) {
        throw new Error('PROJECT environment variable is not set.');
    }
    const key = projectName as keyof typeof projectConfig;
    const project = projectConfig[key];

    // 1. ViewConfig
    const viewConfigData: Array<TViewConfig> = [{
        Id: v4(),
        Kind: ViewConfigKind.City,
        Code: `${projectName}_${project.hero.Code}`,
        Title: project.hero.Title,
        Subtitle: project.hero.Subtitle,
        HasGallery: false,
        CdnBaseUrl: project.CdnBaseUrl
    }];

    const [viewConfig] = BuildViewConfig(viewConfigData);

    // 2. Layout2D
    const layout2DData: Array<TLayout2D> = [{
        Id: v4(),
        BackplateUrl: `mall-hero/backplate_image_landing.webp`,
        ViewConfigId: viewConfig.Id
    }];

    const [layout2d] = BuildLayout2D(layout2DData);

    writeLogFilesAndFlush('up', 'hero');

    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', [viewConfig.Id]).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'hero');
}

export const hero = {
    execute
}
