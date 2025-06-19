import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import {createPellet} from '../offchain/transactions/admin/pellet/create-pellet.js';
import {createShip} from '../offchain/transactions/user/create-ship.js'
import {gatherFuel} from '../offchain/transactions/user/gather-fuel.js';
import {mineAsteria} from '../offchain/transactions/user/mine-asteria.js';
import {moveShip} from '../offchain/transactions/user/move-ship.js';
import {quit} from '../offchain/transactions/user/quit.js';



interface Ship {
  id: number;
  x: number;
  y: number;
}

interface Pellet {
  id: number;
  x: number;
  y: number;
  fuel: number;
}

interface GameState {
  ships: { [username: string]: Ship[] };
  pellets: Pellet[];
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const gameState: GameState = {
  ships: {},
  pellets: [],
};

async function createPellets(): Promise<{ pellets: Pellet[]}> {
  const pellets: Pellet[] = [];
  let totalFuel = 0;
  const numberOfPellets = 20;

  function generateRandompelletProperty() {
    const x = Math.floor(Math.random() * 101) - 50;
    const y = Math.floor(Math.random() * 101) - 50;
    const fuel = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
    return { x, y, fuel };
  }

  const offchainPelletData: { posX: number; posY: number; fuel: string }[] = [];

  for (let i = 0; i < numberOfPellets; i++) {
    const { x, y, fuel } = generateRandompelletProperty();
    pellets.push({ id: i, x, y, fuel });

    offchainPelletData.push({ posX: x, posY: y, fuel: fuel.toString() });
    totalFuel += fuel;
  }

  //const txHash = await createPellet(offchainPelletData, totalFuel.toString());
  console.log("Pellet transaction hash:", );
  console.log("Total fuel value:", totalFuel);
  return {pellets};
}

io.on("connection", (socket: Socket) => {
  console.log("New client connected:", socket.id);

  socket.on(
    "initial-shipCoordinates",
    async (data: { shipProperty: { username: string; ships: Ship[] } }) => {
      console.log("Received initial-shipCoordinates:", data);
      const { username, ships } = data.shipProperty;

      if (!Array.isArray(ships)) {
        console.error("Invalid ship data:", ships);
        socket.emit("error", { message: "Ship data is not an array" });
        return;
      }

      gameState.ships[username] = ships;

      if (gameState.pellets.length === 0) {
        gameState.pellets = (await createPellets()).pellets;
        console.log("Generated pellets:", gameState.pellets);
      }

      console.log(`Emitting createship-coordinates for ${username}:`, ships);
      io.emit("createship-coordinates", { coordinatesArray: ships });

      console.log("Emitting pellets-coordinates:", gameState.pellets);
      io.emit("pellets-coordinates", { pelletsCoordinates: gameState.pellets });
    }
  );

  socket.on("ship-moved", (data: { ship: Ship }) => {
    console.log("Received ship-moved:", data);
    const { ship } = data;
    for (const username in gameState.ships) {
      const userShips = gameState.ships[username];
      const shipIndex = userShips.findIndex((s) => s.id === ship.id);
      if (shipIndex !== -1) {
        userShips[shipIndex] = ship;
        break;
      }
    }
    io.emit("ship-moved", { ship });

    const pelletIndex = gameState.pellets.findIndex(
      (p) => p.x === ship.x && p.y === ship.y
    );
    if (pelletIndex !== -1) {
      const collectedPellet = gameState.pellets.splice(pelletIndex, 1)[0];
      io.emit("pellet-collected", { pelletId: collectedPellet.id });
      console.log(`Pellet collected: ${collectedPellet.id}`);
    }

    if (ship.x === 0 && ship.y === 0) {
      const username = Object.keys(gameState.ships).find((u) =>
        gameState.ships[u].some((s) => s.id === ship.id)
      );
      if (username) {
        io.emit("asteria-mined", { username });
        console.log(`${username} mined Asteria`);
        gameState.ships = {};
        gameState.pellets = [];
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});