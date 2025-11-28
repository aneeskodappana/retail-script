import dotenv from 'dotenv'
import { mallFloor } from "./features/mall-floor";
import { mallInterior } from './features/mall-interior';
dotenv.config();

const main = async () => {
    // await mallFloor.execute();
    await mallInterior.execute();
}

main();
