import { createPellet } from "../../../admin/pellet/create-pellet.js";


async function createPelletTest(){
   // let pelletsTxHash: string[] = [];
    let pellets: { posX: number; posY: number; fuel: string }[] = [];

    const numberOfPellets = 20;
    
    //generates random pellet property
    function generateRandomFuelProperty() {
        const posX = Math.floor(Math.random() * 100);
        const posY = Math.floor(Math.random() * 100);
        const fuel = (Math.floor(Math.random() * (200 - 50 + 1)) + 50).toString(); //random fuel from 50 to 200
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
    }
    const pelletTxHash = await createPellet(pellets);
    
    console.log(pellets);
    // for (let i = 0; i < numberOfPellets; i++) {
    //     try {
    //         pelletsTxHash.push(pelletTxHash);
    //     } catch (error) {
    //         console.error("Error creating pellet:", error);
    //     }
    // }
    console.log("Pellet transaction hashes:", pelletTxHash);
    return pelletTxHash;
}

export {createPelletTest};