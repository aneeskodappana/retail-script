import dotenv from 'dotenv'
import { mallFloor } from "./features/mall-floor";
import { mallInteriorV2 } from './features/mall-interior-v2';
import { hero } from './features/hero';
// import { mallInterior } from './features/mall-interior';
dotenv.config();

const main = async () => {
    // await hero.execute();
    await mallFloor.execute();
    // await mallInteriorV2.execute();
}

main();
