import { stringToHex } from "@meshsdk/core";


export const adminToken = {
  policyid: "f06038e916ab3f1fb15280641280f8c13cfd684f6ce31ac000ed6e8f", 
  name:      stringToHex("AsteriaCoin")
};

export const prizeToken = {
    policyId: "",
    name: stringToHex("")
};

export const fuelToken = {
    policyId: "",
    name: stringToHex("FUEL")
};

export const max_speed = {
    distance: 1,
    time: 30 * 1000
};
export const ship_mint_lovelace_fee: Number = 3000000;
export const max_asteria_mining: Number = 50;
export const max_ship_fuel: Number = 100;
export const initial_fuel: Number = 30;
export const min_asteria_distance: Number = 10;
export const fuel_per_step: Number = 1;