import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';

export type TOverlay = {
    Id: string;
    Url: string;
    Layout2DId: string;
    Type?: number;
    Version?: number;
};

export function Overlay(v: TOverlay, index: number): TOverlay {
    return {
        Id: v.Id,
        Url: v.Url,
        Type: v.Type ?? 1,
        Version: v.Version ?? 1,
        Layout2DId: v.Layout2DId,
    };
}

export function BuildOverlays(data: Array<TOverlay>) {
    const overlays = data.map(Overlay);
    const upRawSql = pg.table(tableNames.Overlays).insert(overlays).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return overlays;
}
