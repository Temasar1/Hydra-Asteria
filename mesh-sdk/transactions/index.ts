import { fuel_per_step, initial_fuel, max_asteria_mining, ship_mint_lovelace_fee } from "./config.js";
import { createPelletTest } from "./asteria-tx/test/admin/pellet/create-pellet-test.js";
import { myWallet, tx_earliest_posix_time, tx_earliest_slot, tx_latest_slot} from "./utils.js";
import { deployAsteria } from "./asteria-tx/admin/deploy/asteria.js";
import { deployPellet } from "./asteria-tx/admin/deploy/pellet.js";
import { deploySpacetime } from "./asteria-tx/admin/deploy/spacetime.js";
import { createAsteria } from "./asteria-tx/admin/asteria/create-asteria.js";
import { createPellet } from "./asteria-tx/admin/pellet/create-pellet.js";
import { moveShip } from "./asteria-tx/user/move-ship.js";
import { gatherFuel } from "./asteria-tx/user/gather-fuel.js";

console.log(tx_earliest_slot);

const txHash = await moveShip(
    -1,
    -1,
    "c888e622a425e06518d149d00a5f458aa3f3b8619245825998148858b6724c6c"
);
// const txHash = await gatherFuel(
//     87,
//     "12ec4f757c0320131703032b85506ea38b1a4f5a93d6291a3aee975bf5356bbd",
//     "86e25f9252df954251a74f42efa647bc80676caf545fd46a17a178b09e62952c",
//     tx_earliest_slot
// )
// const txHash = await mineAsteria(
//     max_asteria_mining,
//     "12ec4f757c0320131703032b85506ea38b1a4f5a93d6291a3aee975bf5356bbd",
//     tx_earliest_slot
// )
//const txHash = await deploySpacetime();
 //console.log(txHash);
 //const txHash = await createAsteria();
 console.log(txHash);

// const txHash = await  createAsteria();
// console.log(txHash);