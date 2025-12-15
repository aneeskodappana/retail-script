import { v4 } from "uuid";
import { BuildViewConfig, TViewConfig, ViewConfigKind } from "../objects/ViewConfig";
import { projectConfig } from "../projectConfig";
import { queryLogBuilder } from "../query-log-builder";
import { pg, tableNames } from "../db";
import { writeLogFilesAndFlush } from "../util";
import { BuildLayout2D, TLayout2D } from "../objects/Layout2D";
import { BuildMarker, TMarker } from "../objects/Marker";

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
        ViewConfigId: viewConfig.Id,
        BackplateHeight: 2048,
        BackplateWidth: 2048,
        DesktopTransformSettingsJson: '{"Disabled":false,"MinScale":1,"MaxScale":2.5,"Wheel":{"Disabled":false,"WheelDisabled":false,"TouchPadDisabled":false,"Step":0.2,"SmoothStep":0.001},"Pan":{"Disabled":false,"VelocityDisabled":false,"LockAxisX":false,"LockAxisY":false},"Pinch":{"Disabled":false,"Step":5.0},"DoubleClick":{"Disabled":false,"Step":0.7,"Mode":"zoomIn","AnimationTime":200.0,"AnimationType":"easeOut"},"UI":{"HideZoomControls":false}}'
    }];

    const [layout2d] = BuildLayout2D(layout2DData);

    // 3. Marker
    const markerData: Array<TMarker> = [{
        Id: v4(),
        Kind: 18,
        MarkerIndex: 2001,
        Code: project.hero.Code,
        NavigateTo: project.NavigationBaseUrl,
        PositionTop: project.hero.marker.position.top,
        PositionLeft: project.hero.marker.position.left,
        HoverIconUrl: `${project.CdnBaseUrl}placeholders/project_thumbnail.webp`,
        HoverIconWidth: 400.0,
        HoverIconHeight: 225.0,
        HoverScale: 125.0,
        Title: project.hero.Title,
        TitleVisible: false,
        IconUrl: `${project.CdnBaseUrl}labels/hero-label.svg`,
        IconWidth: 80.0,
        IconHeight: 20.0,
        Layout2DId: layout2d.Id,
        SubType: 34,
        MaxZoom: 2.5,
        MinZoom: 0.0,
        Scale: 100.0,
        MobileMaxZoom: 2.5,
        MobileMinZoom: 0.0,
        MobileScale: 100.0,
    }];

    const [marker] = BuildMarker(markerData);

    writeLogFilesAndFlush('up', 'hero');

    // clean up
    const downRawSql = pg.table(tableNames.ViewConfigs).whereIn('Id', [viewConfig.Id]).del().toQuery() + ';';
    queryLogBuilder.addDown(downRawSql);
    writeLogFilesAndFlush('down', 'hero');
}

export const hero = {
    execute
}
