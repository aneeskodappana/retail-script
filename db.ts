import knex from "knex";

export const pg = knex({ client: "pg" })

export const tableNames = {
    ViewConfigs: 'ViewConfigs',
    Layout2Ds: 'Layout2Ds',
    Layout3Ds: 'Layout3Ds',
    Markers: "Markers",
    HotspotGroups: "HotspotGroups",
    Hotspots: "Hotspots"
}