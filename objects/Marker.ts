import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';



export type TMarker = {
  // --- REQUIRED ---
  Id: string;                // e.g. '5ad61334-ea3c-4d3f-a91e-3cdcc55bc036'
  Code: string;              // e.g. 'retail-1'
  PositionTop: number;       // e.g. 300.4132080078125
  PositionLeft: number;      // e.g. 343.880126953125
  NavigateTo: string;        // e.g. '/uae/abudhabi/grove/mall/grove-retail-mall/grove-retail-mall-1'
  Title: string;             // e.g. '1.1'
  Layout2DId: string;        // parent ref — e.g. 'a74fc1e8-d583-4d48-8b7a-3e015b34fd71'
  Kind: number;             // maybe: 20 for retail??

  // --- OPTIONAL (repeating defaults from your INSERTs) ---
  MarkerIndex?: number;      // default: 5

  IsVisible?: boolean;       // default: true
  IsExplorable?: boolean;    // default: false
  IsShallowLink?: boolean;   // default: false
  KeepScale?: boolean;       // default: false

  // nullable / rarely-used fields (kept optional, default -> undefined)
  LinkToMarkerIndex?: number;
  AnchorPositionTop?: number;
  AnchorPositionLeft?: number;

  HoverTitle?: string;
  HoverTitleVisible?: boolean;
  HoverIconUrl?: string;
  HoverIconVersion?: number;
  HoverIconWidth?: number;
  HoverIconHeight?: number;
  HoverScale?: number;

  SelectedTitle?: string;
  SelectedTitleVisible?: boolean; // default: true
  SelectedIconUrl?: string;       // default: '/pins/floorplan-waypoint-current.png'
  SelectedIconVersion?: number;
  SelectedIconWidth?: number;     // default: 24
  SelectedIconHeight?: number;    // default: 24
  SelectedScale?: number;         // default: 100

  TitleVisible?: boolean;         // default: true

  IconUrl?: string;               // default: '/pins/floorplan-waypoint-default.png'
  IconVersion?: number;
  IconWidth?: number;             // default: 24
  IconHeight?: number;            // default: 24

  SubType?: number;

  MaxZoom?: number;               // default: 2.5
  MinZoom?: number;               // default: 0.0
  Scale?: number;                 // default: 100.0
  MobileMaxZoom?: number;         // default: 2.5
  MobileMinZoom?: number;         // default: 0.0
  MobileScale?: number;           // default: 100.0

  IsPriority?: boolean;
  Logo?: string;
  Version?: number;

  LngLatJson?: string;            // default: ''
  ConnectionLineJson?: string;    // default: ''
};





// Factory that applies repeating defaults when optional fields are omitted.
// Required fields first (including Layout2DId), optional fields follow.
export function Marker(v: TMarker, index: number): TMarker {
  return {
    // --- REQUIRED (must be present on v) ---
    Id: v.Id,
    Code: v.Code,
    PositionTop: v.PositionTop,
    PositionLeft: v.PositionLeft,
    NavigateTo: v.NavigateTo,
    Title: v.Title,
    Layout2DId: v.Layout2DId,
    Kind: v.Kind,

    // --- OPTIONAL with repeating defaults (from your INSERTs) ---
    MarkerIndex: v.MarkerIndex ?? 5,

    IsVisible: v.IsVisible ?? true,
    IsExplorable: v.IsExplorable ?? false,
    IsShallowLink: v.IsShallowLink ?? false,
    KeepScale: v.KeepScale ?? false,

    // NULL-able / rarely provided → keep undefined if not passed
    LinkToMarkerIndex: v.LinkToMarkerIndex ?? undefined,
    AnchorPositionTop: v.AnchorPositionTop ?? undefined,
    AnchorPositionLeft: v.AnchorPositionLeft ?? undefined,

    HoverTitle: v.HoverTitle ?? undefined,
    HoverTitleVisible: v.HoverTitleVisible ?? undefined,
    HoverIconUrl: v.HoverIconUrl ?? undefined,
    HoverIconVersion: v.HoverIconVersion ?? undefined,
    HoverIconWidth: v.HoverIconWidth ?? undefined,
    HoverIconHeight: v.HoverIconHeight ?? undefined,
    HoverScale: v.HoverScale ?? undefined,

    SelectedTitle: v.SelectedTitle ?? undefined,
    SelectedTitleVisible: v.SelectedTitleVisible ?? true,
    SelectedIconUrl: v.SelectedIconUrl ?? '/pins/floorplan-waypoint-current.png',
    SelectedIconVersion: v.SelectedIconVersion ?? undefined,
    SelectedIconWidth: v.SelectedIconWidth ?? 24,
    SelectedIconHeight: v.SelectedIconHeight ?? 24,
    SelectedScale: v.SelectedScale ?? 100,

    TitleVisible: v.TitleVisible ?? true,

    IconUrl: v.IconUrl ?? '/pins/floorplan-waypoint-default.png',
    IconVersion: v.IconVersion ?? undefined,
    IconWidth: v.IconWidth ?? 24,
    IconHeight: v.IconHeight ?? 24,

    SubType: v.SubType ?? undefined,

    MaxZoom: v.MaxZoom ?? 2.5,
    MinZoom: v.MinZoom ?? 0.0,
    Scale: v.Scale ?? 100.0,
    MobileMaxZoom: v.MobileMaxZoom ?? 2.5,
    MobileMinZoom: v.MobileMinZoom ?? 0.0,
    MobileScale: v.MobileScale ?? 100.0,

    IsPriority: v.IsPriority ?? undefined,
    Logo: v.Logo ?? undefined,
    Version: v.Version ?? undefined,

    LngLatJson: v.LngLatJson ?? '',
    ConnectionLineJson: v.ConnectionLineJson ?? '',
  };
}




export function BuildMarker(data: Array<TMarker>) {
    const marker = data.map(Marker);
    const upRawSql = pg.table(tableNames.Markers).insert(marker).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return marker;
}

/*
```sql
INSERT INTO public."Markers" ("Id", "Kind", "MarkerIndex", "Code", "IsVisible", "IsExplorable", "NavigateTo", "IsShallowLink", "PositionTop", "PositionLeft", "KeepScale", "LinkToMarkerIndex", "AnchorPositionTop", "AnchorPositionLeft", "HoverTitle", "HoverTitleVisible", "HoverIconUrl", "HoverIconVersion", "HoverIconWidth", "HoverIconHeight", "HoverScale", "SelectedTitle", "SelectedTitleVisible", "SelectedIconUrl", "SelectedIconVersion", "SelectedIconWidth", "SelectedIconHeight", "SelectedScale", "Title", "TitleVisible", "IconUrl", "IconVersion", "IconWidth", "IconHeight", "Layout2DId", "SubType", "MaxZoom", "MinZoom", "Scale", "MobileMaxZoom", "MobileMinZoom", "MobileScale", "IsPriority", "Logo", "Version", "LngLatJson", "ConnectionLineJson") VALUES('5ad61334-ea3c-4d3f-a91e-3cdcc55bc036'::uuid, 20, 5, 'retail-1', true, false, '/uae/abudhabi/grove/retail/grove-retail-mall/grove-retail-mall-1', false, 300.4132080078125, 343.880126953125, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '/pins/floorplan-waypoint-current.png', NULL, 24.0, 24.0, 100.0, '1.1', true, '/pins/floorplan-waypoint-default.png', NULL, 24.0, 24.0, 'a74fc1e8-d583-4d48-8b7a-3e015b34fd71'::uuid, NULL, 2.5, 0.0, 100.0, 2.5, 0.0, 100.0, NULL, NULL, NULL, '', '');
```
*/