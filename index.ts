import dotenv from 'dotenv'
import { mallFloor } from "./features/mall-floor";
import { mallInterior } from './features/mall-interior';
import { hero } from './features/hero';
// import { mallInterior } from './features/mall-interior';
dotenv.config();

const main = async () => {
    await hero.execute();
    // await mallFloor.execute();
    // await mallInterior.execute();
}

main();
