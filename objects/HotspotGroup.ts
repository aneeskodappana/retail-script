import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';


// Type for HotspotGroup rows — required fields first. Layout3DId is a parent reference and kept required.
export type THotspotGroup = {
    // --- REQUIRED ---
    Id: string; // 'db14cf25-a964-46eb-843b-ce7c02e1ccb7'
    Name: string; // 'grove-retail-mall-2'
    HotspotGroupIndex: number; // 0
    DefaultHotspotIndex: number; // 0
    Layout3DId: string; // parent ref — 'd2d57db6-7ad4-47da-820c-a771617c0619'
    IsVisible?: boolean; // true
    IsExplorable?: boolean; // true
};

// Factory that enforces required ordering and (if later needed) would apply defaults.
// For this single-row INSERT all fields are required, so the factory maps directly.
export function HotspotGroup(v: THotspotGroup, index: number): THotspotGroup {
    return {
        // --- REQUIRED ---
        Id: v.Id,
        Name: v.Name,
        HotspotGroupIndex: v.HotspotGroupIndex,
        DefaultHotspotIndex: v.DefaultHotspotIndex,
        IsVisible: v.IsVisible || true,
        IsExplorable: v.IsExplorable || true,
        Layout3DId: v.Layout3DId,
    };
}

export function BuildHotspotGroups(data: Array<THotspotGroup>) {
    const hotspotGroups = data.map(HotspotGroup);
    const upRawSql = pg.table(tableNames.HotspotGroups).insert(hotspotGroups).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return hotspotGroups;
}

/*
```sql
INSERT INTO public."HotspotGroups" ("Id", "Name", "HotspotGroupIndex", "DefaultHotspotIndex", "IsVisible", "IsExplorable", "Layout3DId")
VALUES('db14cf25-a964-46eb-843b-ce7c02e1ccb7'::uuid, 'grove-retail-mall-2', 0, 0, true, true, 'd2d57db6-7ad4-47da-820c-a771617c0619'::uuid);
*/
