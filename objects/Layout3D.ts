import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';


export type TLayout3D = {
  Id: string;              // required
  ModelUrl: string;        // required
  ViewConfigId: string;    // required
  ModelScaleJson: string;  // required

  DefaultHotspotGroupIndex?: number; // optional → default: 0
};

export function Layout3D(v: TLayout3D, index: number): TLayout3D {
  return {
    Id: v.Id,
    ModelUrl: v.ModelUrl,
    ViewConfigId: v.ViewConfigId,
    ModelScaleJson: v.ModelScaleJson,

    DefaultHotspotGroupIndex: v.DefaultHotspotGroupIndex ?? 0,
  };
}


export function BuildLayout3D(data: Array<TLayout3D>) {
    const layout3d = data.map(Layout3D);
    const upRawSql = pg.table(tableNames.Layout3Ds).insert(layout3d).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return layout3d;
}

/*
```sql
INSERT INTO public."Layout3Ds" ("Id", "ModelUrl", "DefaultHotspotGroupIndex", "ViewConfigId", "ModelScaleJson") VALUES('d2d57db6-7ad4-47da-820c-a771617c0619'::uuid, '', 0, '45e37d34-7d20-44e1-aaed-dfbae9679a74'::uuid, '');
```
*/