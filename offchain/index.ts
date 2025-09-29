export * from "./src/admin/asteria/create-asteria.js";
export * from "./src/admin/asteria/consume-asteria.js";
export * from "./src/admin/pellet/create-pellet-test.js";
export * from "./src/admin/pellet/consume-pellet.js";
export * from "./src/user/create-ship.js";
export * from "./src/user/move-ship.js";
export * from "./src/user/gather-fuel.js";
export * from "./src/user/mine-asteria.js";
export * from "./src/user/quit.js";

import { moveShip } from "./src/user/move-ship.js";
const txhash = await moveShip(1,1,"dd4ab052c8fc8576a254b9b2b4327596f099283e69261058edb974426cdf4501")
console.log("txhash", txhash);

//In every game interaction, ship utxo is being created
//First step deploy pellet then deploy following validators


//de1ecb8f79167eaa794fb6b8b20d81440ca37409692b3ca7a8abc12b434af095 - asteria
//76bc7d608adc0b5fde73fe75936e296a0d187fc3d6511f4508e7623d55e3ff9f - pellet 
//7a7b5c8dedfcce1f3c6df5b2dea95ec1e8f8d566d6f1bd62bba16bd8d927a22c - ship 
//61cc4486ec153ab716065b9631511f86d4bc85038aa80eb1789756baceabdb2c - moveship 
//898c9a5a8bdfff9e14aa642832a2d45e15fde2a40d252265ff774f4e549eee6e - gatherFuel
//baed49f4c5f0395de8d86c8a93f0a695056b4bcd3d94c6defd4cbe5a58a52d38 - mineAsteria
//7583c87adb8e0ae938c3583929411585a9861e31fe1d21128883c4c75fd7702a - consumeAsteria