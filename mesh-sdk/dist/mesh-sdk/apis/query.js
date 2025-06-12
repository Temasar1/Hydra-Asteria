const createShips = async (socket) => {
    socket.on('initial-coordinates', async (data) => {
        const { pellets, ships } = data;
        ships.forEach((ship) => {
            console.log(ship);
        });
        //const txHash = await createShip()
    });
};
export {};
