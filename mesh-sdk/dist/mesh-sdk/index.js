import express from "express";
import { Server } from "socket.io";
import http from "http";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('new connection', socket.id);
    // socket.on('initial-coordinates', (data) => {
    //     const { pellets , ships } = data;
    //     for( let i = 0; i <= ships.length; i++){
    //         //console.log(`ship${i} = ${ships.x}`)
    //     }
    //    // console.log(pellets);
    //    // console.log(ships);
    // });
    // socket.on('ship-coordinates', (data) => {
    //     const shipCoordinates = data.latestShipCoordinates;
    //     if(!Array.isArray(shipCoordinates)){
    //         throw new Error("Expected data is an array");
    //         return;
    //     }
    //     shipCoordinates.forEach((coord: any, index: any) => {
    //         console.log(`Received coordinates for ship ${index}: `, coord);
    //     });
    // })
    socket.emit('shipHash', {});
    socket.on('disconnect', () => {
        console.log('client disconnected', socket.id);
    });
});
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
});
console.log("My socket server is running");
