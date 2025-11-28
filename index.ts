import dotenv from 'dotenv'
import { mallFloor } from "./features/mall-floor";
dotenv.config();

const main = async () => {
    // mall floor
    await mallFloor.execute();
    

    
}

main();
