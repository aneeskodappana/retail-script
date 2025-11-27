import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';


export enum ViewConfigKind {
    'Globe',
    'Nation',
    'City',
    'Project',
    'Cluster',
    'Amenity',
    'Property',
    'Floor',
    'Interior',
    'Gallery',
    'ParkingFloorplan',
    'ParkingUpgrade',
    'ParkingUpgradeGallery',
}


export type TViewConfig = {
    Id: string;
    Kind: number;
    Code: string;
    Title: string;
    Subtitle: string;

    HasGallery: boolean;
    CdnBaseUrl: string;
    // optional cols
    NationId?: string;
    CityId?: string;
    ProjectId?: string;
    ClusterId?: string;
    AmenityId?: string;
    UnitId?: string;
    UnitVariantExteriorId?: string;
    UnitVariantFloorId?: string;
    UnitVariantInteriorId?: string;

    ParkingFloorplanId?: string;
    ParkingUpgradeGalleryId?: string;
    ParkingUpgradeId?: string;
};


export function ViewConfig(v: TViewConfig, index: number): TViewConfig {
    return {
        Id: v.Id,
        Kind: v.Kind,
        Code: v.Code,
        Title: v.Title,
        Subtitle: v.Subtitle,
        HasGallery: v.HasGallery,
        CdnBaseUrl: v.CdnBaseUrl,
        NationId: v.NationId,
        CityId: v.CityId,
        ProjectId: v.ProjectId,
        ClusterId: v.ClusterId,
        AmenityId: v.AmenityId,
        UnitId: v.UnitId,
        UnitVariantExteriorId: v.UnitVariantExteriorId,
        UnitVariantFloorId: v.UnitVariantFloorId,
        UnitVariantInteriorId: v.UnitVariantInteriorId,
        ParkingFloorplanId: v.ParkingFloorplanId,
        ParkingUpgradeGalleryId: v.ParkingUpgradeGalleryId,
        ParkingUpgradeId: v.ParkingUpgradeId
    }
}

export function BuildViewConfig(data: Array<TViewConfig>) {
    const viewConfigs = data.map(ViewConfig);
    const upRawSql = pg.table(tableNames.ViewConfigs).insert(viewConfigs).toQuery() + ';';
    queryLogBuilder.add(upRawSql);
    return viewConfigs;
}
/*
```sql
INSERT INTO public."ViewConfigs" ("Id", "Kind", "Code", "Title", "Subtitle", "NationId", "CityId", "ProjectId", "ClusterId", "AmenityId", "UnitId", "UnitVariantExteriorId", "UnitVariantFloorId", "UnitVariantInteriorId", "HasGallery", "CdnBaseUrl", "ParkingFloorplanId", "ParkingUpgradeGalleryId", "ParkingUpgradeId") VALUES('00e7f1f9-38c8-4106-8be8-ff41640de568'::uuid, 6, 'haven_V_P_6B_A', '6 Bed Premium Villa TypeA', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '', NULL, NULL, NULL);
```
*/