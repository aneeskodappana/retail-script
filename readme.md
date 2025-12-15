# marker update 
[-] Grove Mall

## Navigation URL for mall marker
```bash
http://localhost:3000/uae/abudhabi/grove/mall/grove-mall
```

## Floorplan query for mall

```sql
INSERT INTO public."ViewConfigs" ("Id", "Kind", "Code", "Title", "Subtitle", "NationId", "CityId", "ProjectId", "ClusterId", "AmenityId", "UnitId", "UnitVariantExteriorId", "UnitVariantFloorId", "UnitVariantInteriorId", "HasGallery", "CdnBaseUrl", "ParkingFloorplanId", "ParkingUpgradeGalleryId", "ParkingUpgradeId") VALUES('b51445ef-60ab-4fd2-921f-db88e787fbad'::uuid, 4, 'grove_retail_grove-mall', 'Grove Retail Mall', 'Grove - Grove Beach Views', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '', NULL, NULL, NULL);
```

## Kind types
```typescript
enum ViewTypes {
  'Globe', // 0
  'Nation', // 1
  'City', // 2
  'Project', // 3
  'Cluster', // 4
  'Amenity', // 5
  'Property', // 6
  'Floor', // 7
  'Interior', // 8
  'Gallery', // 9
  'ParkingFloorplan', // 10
  'ParkingUpgrade', // 11
  'ParkingUpgradeGallery', // 12
}
```


### How to store assets

- floorplan image => assets/<project_name>/<image>.webp
- 

## Yas Mall @TODOs

[] Hero page navigate to url and brand logo (add to project config under hero)
[] Interior page hotspots & positions