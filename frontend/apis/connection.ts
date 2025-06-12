import { io } from "socket.io-client"

let socket: any;
export const newSocketConnection = ( url: string) => {
socket = io(url);
socket.on('connect', () => {
    console.log("connected to socket.io server");
 });
 return socket;
};