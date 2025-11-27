import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';



export type TLayout2D = {
  // --- REQUIRED ---
  Id: string;
  BackplateUrl: string;
  ViewConfigId: string;

  // --- OPTIONAL (all nullable in DB or treated as optional) ---
  IsDefault?: boolean; // default: false
  DisplayName?: string; // default: ""
  DisplayOrder?: number; // default: 0

  DesktopTransformSettingsJson?: string; // default: SQL JSON
  MobileTransformSettingsJson?: string;  // default: SQL JSON

  BackplateVersion?: number; // default: 2
  BackplateWidth?: number; // default: 1024
  BackplateHeight?: number; // default: 1024
  NorthBearing?: string; // default: ""

  BackplateThumbnailUrl?: string; // default: ""
  BackplateThumbnailVersion?: number; // default: 1
  BackplateThumbnailWidth?: number | null; // default: 0
  BackplateThumbnailHeight?: number | null; // nullable

  BackplateFormat?: number; // default: 0

  ShowVideoControls?: boolean; // default: false
  VideoAutoplay?: boolean; // default: false
  VideoLoopEnabled?: boolean; // default: false
  HasCallbackWindow?: boolean; // default: false

  FocusedMarkerId?: number; // default: -1

  MarkerConnectionSettings?: string; // default: '{"Connections":[]}'
};




export function Layout2D(v: TLayout2D, index: number): TLayout2D {
    return {
        // --- REQUIRED FIELDS ---
        Id: v.Id,
        BackplateUrl: v.BackplateUrl,
        ViewConfigId: v.ViewConfigId,

        // --- OPTIONAL FIELDS WITH DEFAULTS FROM SQL ---
        IsDefault: v.IsDefault ?? false,
        DisplayName: v.DisplayName ?? "",
        DisplayOrder: v.DisplayOrder ?? 0,

        DesktopTransformSettingsJson: v.DesktopTransformSettingsJson ??
            '{"Disabled":false,"MinScale":1.5,"MaxScale":2.5,"Wheel":{"Disabled":false,"WheelDisabled":false,"TouchPadDisabled":false,"Step":0.2,"SmoothStep":0.001},"Pan":{"Disabled":false,"VelocityDisabled":false,"LockAxisX":false,"LockAxisY":false},"Pinch":{"Disabled":false,"Step":5.0},"DoubleClick":{"Disabled":false,"Step":0.7,"Mode":"zoomIn","AnimationTime":200.0,"AnimationType":"easeOut"},"UI":{"HideZoomControls":false}}',

        MobileTransformSettingsJson: v.MobileTransformSettingsJson ??
            '{"Disabled":false,"MinScale":1.0,"MaxScale":2.5,"Wheel":{"Disabled":false,"WheelDisabled":false,"TouchPadDisabled":false,"Step":0.2,"SmoothStep":0.001},"Pan":{"Disabled":false,"VelocityDisabled":false,"LockAxisX":false,"LockAxisY":false},"Pinch":{"Disabled":false,"Step":5.0},"DoubleClick":{"Disabled":false,"Step":0.7,"Mode":"zoomIn","AnimationTime":200.0,"AnimationType":"easeOut"},"UI":{"HideZoomControls":false}}',

        BackplateVersion: v.BackplateVersion ?? 1,
        BackplateWidth: v.BackplateWidth ?? 1024,
        BackplateHeight: v.BackplateHeight ?? 1024,
        NorthBearing: v.NorthBearing ?? "",

        BackplateThumbnailUrl: v.BackplateThumbnailUrl ?? "",
        BackplateThumbnailVersion: v.BackplateThumbnailVersion ?? 1,
        BackplateThumbnailWidth: v.BackplateThumbnailWidth ?? null,
        BackplateThumbnailHeight: v.BackplateThumbnailHeight ?? null, 

        BackplateFormat: v.BackplateFormat ?? 0,
        ShowVideoControls: v.ShowVideoControls ?? false,
        VideoAutoplay: v.VideoAutoplay ?? false,
        VideoLoopEnabled: v.VideoLoopEnabled ?? false,
        HasCallbackWindow: v.HasCallbackWindow ?? false,

        FocusedMarkerId: v.FocusedMarkerId ?? -1,

        MarkerConnectionSettings: v.MarkerConnectionSettings ?? '{"Connections":[]}',
    };
}



export function BuildLayout2D(data: Array<TLayout2D>) {
    const layout2d = data.map(Layout2D);
    const upRawSql = pg.table(tableNames.Layout2Ds).insert(layout2d).toQuery() + ';';
    queryLogBuilder.add(upRawSql);
    return layout2d;
}

/*
```sql
INSERT INTO public."Layout2Ds" ("Id", "IsDefault", "DisplayName", "DisplayOrder", "DesktopTransformSettingsJson", "MobileTransformSettingsJson", "BackplateUrl", "BackplateVersion", "BackplateWidth", "BackplateHeight", "NorthBearing", "BackplateThumbnailUrl", "BackplateThumbnailVersion", "BackplateThumbnailWidth", "BackplateThumbnailHeight", "ViewConfigId", "BackplateFormat", "ShowVideoControls", "VideoAutoplay", "VideoLoopEnabled", "HasCallbackWindow", "FocusedMarkerId", "MarkerConnectionSettings") VALUES('a74fc1e8-d583-4d48-8b7a-3e015b34fd71'::uuid, false, '', 0, '{"Disabled":false,"MinScale":1.5,"MaxScale":2.5,"Wheel":{"Disabled":false,"WheelDisabled":false,"TouchPadDisabled":false,"Step":0.2,"SmoothStep":0.001},"Pan":{"Disabled":false,"VelocityDisabled":false,"LockAxisX":false,"LockAxisY":false},"Pinch":{"Disabled":false,"Step":5.0},"DoubleClick":{"Disabled":false,"Step":0.7,"Mode":"zoomIn","AnimationTime":200.0,"AnimationType":"easeOut"},"UI":{"HideZoomControls":false}}', '{"Disabled":false,"MinScale":1.0,"MaxScale":2.5,"Wheel":{"Disabled":false,"WheelDisabled":false,"TouchPadDisabled":false,"Step":0.2,"SmoothStep":0.001},"Pan":{"Disabled":false,"VelocityDisabled":false,"LockAxisX":false,"LockAxisY":false},"Pinch":{"Disabled":false,"Step":5.0},"DoubleClick":{"Disabled":false,"Step":0.7,"Mode":"zoomIn","AnimationTime":200.0,"AnimationType":"easeOut"},"UI":{"HideZoomControls":false}}', '/container_projects/project_1-0-0_uae_abudhabi_grove/Back Plate.webp', 2, 1024.0, 1024.0, '', '', 1, NULL, NULL, 'b51445ef-60ab-4fd2-921f-db88e787fbad'::uuid, 0, false, false, false, false, -1, '{"Connections":[]}');
```
*/