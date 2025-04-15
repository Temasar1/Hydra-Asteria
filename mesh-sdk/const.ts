import { byteString, conStr0, integer, policyId, stringToHex } from "@meshsdk/core";

let admin_token = conStr0([
  policyId("f06038e916ab3f1fb15280641280f8c13cfd684f6ce31ac000ed6e8f"), 
  byteString(stringToHex("asteriaCoin"))                              
]);
const ship_mint_lovelace_fee = integer(3000000);
const max_asteria_mining = integer(50);
const max_speed = conStr0([
  integer(1),
  integer(30000)     
]);
const max_ship_fuel = integer(100);
const fuel_per_step = integer(1);
const initial_fuel = integer(30);
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
