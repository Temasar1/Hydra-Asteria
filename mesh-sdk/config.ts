import { stringToHex } from "@meshsdk/core";

export const admintoken = {
  policyid: "42d256198af3a67890ed7aaeea027b18da3c585b77d362b5745413c2", 
  name:      stringToHex("asteria-temasar")
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
export const ship_mint_lovelace_fee: number = 3000000;
export const max_asteria_mining: number = 50;
export const max_ship_fuel: number = 100;
export const initial_fuel: string = "30";
export const min_asteria_distance: number = 10;
export const fuel_per_step: number = 1;