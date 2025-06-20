import { 
  assetName, 
  conStr0, 
  integer, 
  policyId, 
  stringToHex 
} from "@meshsdk/core";

let admin_token = conStr0([
  policyId("fbeafbfb456a440b174001793c546c93bdf887730c1e12b2f9f0d293"), 
  assetName(stringToHex("Asteriatoken"))                              
]);
const ship_mint_lovelace_fee = integer(3000000);
const max_asteria_mining = integer(50);
const max_speed = conStr0([
  integer(1),      //distance
  integer(30000)   //time
]);
const max_ship_fuel = integer(300);
const fuel_per_step = integer(20);
const initial_fuel = integer(100);
const min_asteria_distance = integer(10);

export {
  admin_token,
  ship_mint_lovelace_fee,
  max_asteria_mining,
  max_speed,
  max_ship_fuel,
  fuel_per_step,
  initial_fuel,
  min_asteria_distance,
};

const asteria = "c20d87a573056cabe4d64a832d6278578a60ec8964f6ba2c7b2bf9a0800ae8b8";