import { createPellet } from "../../../admin/pellet/create-pellet.js";
import { writeFile } from "fs/promises";
import { writePelletsCsvFIle } from "./utils.js";

async function createPelletTest(){
let pellets: { posX: number; posY: number; fuel: string }[] = [];
let totalFuel = 0;
    const numberOfPellets = 30;
        function generateRandomFuelProperty() {
            const posX = Math.floor(Math.random() * 101) - 50;
            const posY = Math.floor(Math.random() * 101) - 50;
            const fuel = (Math.floor(Math.random() * (200 - 50 + 1)) + 50).toString();
        return {fuel, posX, posY};
    };
    for(let i = 0; i < numberOfPellets; i++){
        const {posX, posY, fuel} = generateRandomFuelProperty();
        const pelletProperty = {
            posX,
            posY,
            fuel
        };
        pellets.push(pelletProperty);
        totalFuel += parseInt(fuel, 10); // Accumulate the fuel value
    }

writePelletsCsvFIle(pellets);
const txHash = await createPellet(
    pellets,
    totalFuel.toString()
);

await writeFile('./backend/user-hash/pellets.json', JSON.stringify({txHash: txHash }));
return txHash;
}
export {createPelletTest};