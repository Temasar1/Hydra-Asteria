import { createPellet } from "../../../admin/pellet/create-pellet.js";
import { writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join, dirname} from "path";
import { fileURLToPath } from "url";
import { readPelletsCsvFile, writePelletsCsvFIle } from "./utils.js";


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
return txHash;
}

export {createPelletTest};