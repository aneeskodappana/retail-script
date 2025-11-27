import dotenv from 'dotenv'
import { retailFloor } from "./features/retail-floor";
dotenv.config();

const main = async () => {
    // retail floor
    await retailFloor.execute();
    

    
}

main();
