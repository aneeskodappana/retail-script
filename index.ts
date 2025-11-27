import { writeLogFiles } from "./util";
import { retailFloor } from "./features/retail-floor";
import dotenv from 'dotenv'
import { projectConfig } from "./projectConfig";
dotenv.config();

const main = () => {


    // retail floor
    retailFloor.execute();

    // const downRawSql = pg.table('users').whereIn('Id', IDS).del().toQuery() + ';';
    // UTILITY: ensure the output directory exists
    writeLogFiles()
}

main();
