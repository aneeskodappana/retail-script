import { pg, tableNames } from '../db';
import { queryLogBuilder } from '../query-log-builder';

/*
```sql
INSERT INTO public."Navigations" ("Id", "DisplayName", "DisplayOrder", "IsPriority", "NavigationUrl", "ViewConfigId", "CardImageUrl", "DisplaySubName")
VALUES(
  '4f89185d-07d1-4943-be0b-d6e64cf19524'::uuid,
  'Nine Elms',
  2,
  false,
  '/uk/london/nineElms',
  'fa3e151b-08ce-4ea8-8e7c-ee0805f53e5c'::uuid,
  '',
  ''
);
*/

// Type for Navigation rows — required fields first. ViewConfigId is a parent reference and kept required.
export type TNavigation = {
    // --- REQUIRED (non-null in INSERT) ---
    Id: string; // '4f89185d-07d1-4943-be0b-d6e64cf19524'
    DisplayName: string; // 'Nine Elms'
    DisplayOrder: number; // 2
    IsPriority: boolean; // false
    NavigationUrl: string; // '/uk/london/nineElms'
    ViewConfigId: string; // parent ref — 'fa3e151b-08ce-4ea8-8e7c-ee0805f53e5c'
    CardImageUrl: string; // '' (empty string)
    DisplaySubName: string; // '' (empty string)
};

// Factory that maps required fields first and would apply defaults for optional fields.
// For this single-row INSERT all fields were non-null, so factory maps directly.
export function Navigation(v: TNavigation, index: number): TNavigation {
    return {
        // --- REQUIRED ---
        Id: v.Id,
        DisplayName: v.DisplayName,
        DisplayOrder: v.DisplayOrder,
        IsPriority: v.IsPriority,
        NavigationUrl: v.NavigationUrl,
        ViewConfigId: v.ViewConfigId,
        CardImageUrl: v.CardImageUrl,
        DisplaySubName: v.DisplaySubName,
    };
}

// Build function following your exact stored pattern (maps, generates SQL, logs it, returns array)
export function BuildNavigations(data: Array<TNavigation>) {
    const navigations = data.map(Navigation);
    const upRawSql = pg.table(tableNames.Navigations).insert(navigations).toQuery() + ';';
    queryLogBuilder.addUp(upRawSql);
    return navigations;
}