import { createShip } from "../../user/create-ship.js";
const createShipTest = async () => {
    const txHash = await createShip(-8, 3);
    return txHash;
};
//export {createShipTest};
