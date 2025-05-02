import { initial_fuel, ship_mint_lovelace_fee } from "./config.js";
import { createAsteria,createTest } from "./transactions/admin/asteria/create-asteria.js";
import { createShip } from "./transactions/user/create-ship.js";
import { slot,tx_latest_posix_time } from "./utils.js";
import { deployAsteria } from "./transactions/admin/deploy/asteria.js";
import { deployPellet } from "./transactions/admin/deploy/pellet.js";
import { deploySpacetime } from "./transactions/admin/deploy/spacetime.js";
import { createPellet } from "./transactions/admin/pellet/create-pellet.js";


console.log(slot);

// const pelletProperty = {
//     posX: 20,
//     posY: 20,
//     fuel: "20"
// };

//const txHash = await createPellet(pelletProperty);
const txHash = await createShip(
    ship_mint_lovelace_fee,
    initial_fuel,
    -8,
    3,
    tx_latest_posix_time
);

//const txHash = await createTest();

console.log(slot);
console.log(txHash);

// const txhash = await createAsteria();
// console.log(txhash);