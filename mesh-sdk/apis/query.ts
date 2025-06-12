import { createShip } from "../transactions/asteria-tx/user/create-ship.js";

const createShips = async (socket: any) => {
  socket.on('initial-coordinates', async (data: {pellets: {x: number , y: number}[], ships: {x: number, y: number}[]}) => {
    const { pellets, ships} = data;
    for(let i = 0; i < ships.length; i++){
         const txHash = await createShip(
            ships[i].x,
            ships[i].y
         )
    console.log(txHash);
    }
  })
}

const moveShip = async (socket:any) => {
    socket.on('ship-coordinates', async (data:  ) => {
        
    })
}
export {createShips};