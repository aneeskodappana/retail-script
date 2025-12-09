export type AssetExtrator = {
    grove: {
        mallFloorPlan?: string
        mallInterior?: string,
        mallInteriorTitle?: string,
        processInteriorCsv: (interiorPath: string, imageEntries: ImageEntry[]) => Promise<CsvExtractResult>
    },
    yas: {
        mallFloorPlan?: string
        mallInterior?: string,
        mallInteriorTitle?: string,
        processInteriorCsv: (interiorPath: string, imageEntries: ImageEntry[]) => Promise<CsvExtractResult>
    }
}


export type GroveCsvRow = {
    source: string;
    hotspot_index: string;
    target: string;
    position_x: string;
    position_y: string;
    position_z: string;
};

export type YasCsvRow = {
    name: string;
    x: string;
    y: string;
    z: string;
    width: string;
    height: string;
    target: string;
};

export type ImageEntry = {
    fullPath: string;
    fileName: string;
};

export type HotspotRowData = {
    hotspotIndex: number;
    targetViewConfigCode: string;
    mediaUrl?: string;
    hotspotGroupId: string;
    positionJson: string;
};

export type CsvExtractResult = {
    sourceToFileName: Map<string, string>;
    uniqueSources: string[];
    buildHotspotRows: (hotspotGroupIdMap: Map<string, string>, assetPath: string) => HotspotRowData[];
};

