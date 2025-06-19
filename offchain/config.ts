import { stringToHex } from "@meshsdk/core";

export const admintoken = {
  policyid: "fbeafbfb456a440b174001793c546c93bdf887730c1e12b2f9f0d293", 
  name:      stringToHex("Asteriatoken")
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
export const max_ship_fuel: number = 300;
export const initial_fuel: string = "100";
export const min_asteria_distance: number = 10;
export const fuel_per_step: number = 20;