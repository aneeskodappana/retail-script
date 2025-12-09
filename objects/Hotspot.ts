import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';

/*
```sql
INSERT INTO public."Hotspots" ("Id", "HotspotIndex", "IsVisible", "IsExplorable", "Name", "MediaUrl", "MediaVersion", "MediaThumbnailUrl", "MediaThumbnailVersion", "PositionJson", "OffsetRotationJson", "DefaultCameraRotationJson", "HotspotGroupId", "CameraSettingsJson")
VALUES(
  '0a827077-5699-4047-a7ed-fa28e472577a'::uuid,
  1,
  true,
  true,
  'adidas',
  '/retail/new/P_1.25_TheGroveMall.webp',
  1,
  '',
  1,
  '{"X":0,"Y":0,"Z":0}',
  '{"X":0,"Y":0,"Z":0,"W":1}',
  '{"X":0,"Y":0,"Z":0,"W":1}',
  'db14cf25-a964-46eb-843b-ce7c02e1ccb7'::uuid,
  '{"default": {"fov": 90}, "version": 1}'::jsonb
);

INSERT INTO public."Hotspots" ("Id", "HotspotIndex", "IsVisible", "IsExplorable", "Name", "MediaUrl", "MediaVersion", "MediaThumbnailUrl", "MediaThumbnailVersion", "PositionJson", "OffsetRotationJson", "DefaultCameraRotationJson", "HotspotGroupId", "CameraSettingsJson")
VALUES(
  '308a1c2a-c1ab-4501-8182-820c39cce548'::uuid,
  0,
  true,
  true,
  'puma',
  '/retail/new/P_1.27_TheGroveMall.webp',
  1,
  '',
  1,
  '{"X":0,"Y":0,"Z":0}',
  '{"X":0,"Y":0,"Z":0,"W":1}',
  '{"X":0,"Y":0,"Z":0,"W":1}',
  'db14cf25-a964-46eb-843b-ce7c02e1ccb7'::uuid,
  '{"default": {"fov": 90}, "version": 1}'::jsonb
);
*/

/**
 * 
THotspot
Required fields first (including parent ref HotspotGroupId)
Repeating values across the supplied INSERTs are optional and get defaults in the factory.
*/
export type THotspot = {
    // --- REQUIRED ---
    Id: string; // e.g. '0a827077-5699-4047-a7ed-fa28e472577a'
    HotspotIndex: number; // e.g. 1
    Name: string; // e.g. 'adidas'
    MediaUrl?: string; // e.g. '/retail/new/P_1.25_TheGroveMall.webp'
    HotspotGroupId: string; // parent ref — 'db14cf25-a964-46eb-843b-ce7c02e1ccb7'
    PositionJson: string; // default: '{"X":0,"Y":0,"Z":0}'

    // --- OPTIONAL (repeating defaults across the provided INSERTs) ---
    IsVisible?: boolean; // default: true
    IsExplorable?: boolean; // default: true

    MediaVersion?: number; // default: 1
    MediaThumbnailUrl?: string; // default: ''
    MediaThumbnailVersion?: number; // default: 1

    OffsetRotationJson?: string; // default: '{"X":0,"Y":0,"Z":0,"W":1}'
    DefaultCameraRotationJson?: string; // default: '{"X":0,"Y":0,"Z":0,"W":1}'

    CameraSettingsJson?: string; // default: '{"default": {"fov": 90}, "version": 1}'
};

/**

Hotspot factory

Required props are copied directly.

Optional props that repeat across the INSERTs get defaults when omitted.
*/
export function Hotspot(v: THotspot, index: number): THotspot {
    return {
        // --- REQUIRED ---
        Id: v.Id,
        HotspotIndex: v.HotspotIndex,
        Name: v.Name,
        MediaUrl: v.MediaUrl ?? '',
        HotspotGroupId: v.HotspotGroupId,
        PositionJson: v.PositionJson,

        // --- OPTIONAL w/ repeating defaults ---
        IsVisible: v.IsVisible ?? true,
        IsExplorable: v.IsExplorable ?? true,

        MediaVersion: v.MediaVersion ?? 1,
        MediaThumbnailUrl: v.MediaThumbnailUrl ?? '',
        MediaThumbnailVersion: v.MediaThumbnailVersion ?? 1,

        OffsetRotationJson: v.OffsetRotationJson ?? '{"X":0,"Y":0,"Z":0,"W":1}',
        DefaultCameraRotationJson: v.DefaultCameraRotationJson ?? '{"X":0,"Y":0,"Z":0,"W":1}',

        CameraSettingsJson: v.CameraSettingsJson ?? '{"default": {"fov": 90}, "version": 1}',
    };
}

/**

BuildHotspots

Maps the input through Hotspot, generates SQL via pg.table(...).insert(...).toQuery(),

logs the SQL with queryLogBuilder, and returns the mapped array.
*/
export function BuildHotspots(data: Array<THotspot>) {
    const hotspots = data.map(Hotspot);
    const upRawSql = pg.table(tableNames.Hotspots).insert(hotspots).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return hotspots;
}