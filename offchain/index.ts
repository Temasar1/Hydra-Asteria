import { fuel_per_step, initial_fuel, max_asteria_mining, ship_mint_lovelace_fee } from "./config.js";
import { createPelletTest } from "./transactions/test/admin/pellet/create-pellet-test.js";
import { blockchainProvider, myWallet, tx_earliest_posix_time, tx_earliest_slot, tx_latest_slot} from "./utils.js";
import { deployAsteria } from "./transactions/admin/deploy/asteria.js";
import { deployPellet } from "./transactions/admin/deploy/pellet.js";
import { deploySpacetime } from "./transactions/admin/deploy/spacetime.js";
import { createAsteria } from "./transactions/admin/asteria/create-asteria.js";
import { createPellet } from "./transactions/admin/pellet/create-pellet.js";
import { moveShip } from "./transactions/user/move-ship.js";
import { gatherFuel } from "./transactions/user/gather-fuel.js";

console.log(tx_earliest_slot);

const utxos = await blockchainProvider.fetchUTxOs('1163bbc5e59271044662b45786ce30ddc4f32410aee373cf231fa707fa5a390c');
console.log(utxos);
// const txHash = await createPelletTest();
//  //console.log(txHash);
//  //const txHash = await createAsteria();
//  console.log(txHash);

// const txHash = await  createAsteria();
// console.log(txHash);