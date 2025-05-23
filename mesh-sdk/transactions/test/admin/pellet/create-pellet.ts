import { createPellet } from "../../../admin/pellet/create-pellet.js";


async function createPelletTest(){
    const pellets: string[] = [];
    const numberOfPellets = 5;
    
    //generates random pellet property
    function generateRandomFuelProperty() {
        const posX = Math.floor(Math.random() * 100);
        const posY = Math.floor(Math.random() * 100);
        const fuel = (Math.floor(Math.random() * (300 - 50 + 1)) + 50).toString(); //random fuel from 50 t0 300
        return {fuel, posX, posY};
    };
    const {posX, posY, fuel} = generateRandomFuelProperty();
    const pelletProperty = {
        posX,
        posY,
        fuel
    };
    
    for (let i = 0; i < numberOfPellets; i++) {
        const pellet = await createPellet(pelletProperty);
        pellets.push(pellet);
    };

    return pellets;
}

export {createPelletTest};