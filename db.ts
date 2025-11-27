import knex from "knex";

export const pg = knex({ client: "pg" })

export const tableNames = {
    ViewConfigs: 'ViewConfigs',
    Layout2Ds: 'Layout2Ds',
    Markers: "Markers"
}