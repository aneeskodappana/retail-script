type TAssetExtrator = {
    mallFloorPlan?: string
    mallInterior?: string,
    mallInteriorTitle?: string,
    processInteriorCsv: (interiorPath: string, imageEntries: ImageEntry[]) => Promise<CsvExtractResult>
} 

export type AssetExtrator = {
    grove: TAssetExtrator,
    yas: TAssetExtrator
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
    px: string;
    py: string;
    pz: string;
    rx: string;
    ry: string;
    rz: string;
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
    offsetRotationJson: string
};

export type CsvExtractResult = {
    sourceToFileName: Map<string, string>;
    uniqueSources: string[];
    buildHotspotRows: (hotspotGroupIdMap: Map<string, string>, assetPath: string) => HotspotRowData[];
};

