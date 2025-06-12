import { initial_fuel, ship_mint_lovelace_fee } from "../../../config.js";
import { tx_latest_slot } from "../../../utils.js";
import { createShip } from "../../user/create-ship.js";

const createShipTest = async() => {
  const txHash = await createShip(
    -8,
    3,
);
return txHash;
};

//export {createShipTest};