import { stringToHex } from "@meshsdk/core";

export const admintoken = {
  policyid: "9ff12b0c435fe2dc6dc58730713bad9ab1cec9ed0798dbe850538d03", 
  name:      stringToHex("asteria-new")
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