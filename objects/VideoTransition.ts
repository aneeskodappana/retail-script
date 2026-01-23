import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';

export type TVideoTransition = {
    Id: string;
    FromLayout2dId: string;
    ToLayout2dId: string;
    MediaUrl: string;
    FromLayout3dId?: string | null;
    ToLayout3dId?: string | null;
    Version?: number;
    Theme?: number;
};

export function VideoTransition(v: TVideoTransition, index: number): TVideoTransition {
    return {
        Id: v.Id,
        FromLayout2dId: v.FromLayout2dId,
        ToLayout2dId: v.ToLayout2dId,
        MediaUrl: v.MediaUrl,
        FromLayout3dId: v.FromLayout3dId ?? null,
        ToLayout3dId: v.ToLayout3dId ?? null,
        Version: v.Version ?? 1,
        Theme: v.Theme ?? 0,
    };
}

export function BuildVideoTransitions(data: Array<TVideoTransition>) {
    const videoTransitions = data.map(VideoTransition);
    const upRawSql = pg.table(tableNames.VideoTransitions).insert(videoTransitions).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return videoTransitions;
}
