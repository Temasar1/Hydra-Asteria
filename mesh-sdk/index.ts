import express from "express"
import { Server} from "socket.io"
import http from "http";
import { create_ships, create_pellets, ship_actions } from "./server/sockets.js";

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
   create_ships(socket);
   create_pellets(socket);
   ship_actions(socket);
socket.on('disconnect', () => {
    console.log('client disconnected', socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`);
});
console.log("My socket server is running");