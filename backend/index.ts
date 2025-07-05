import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
import { createShip } from '../offchain/transactions/user/create-ship.js';
import { gatherFuel } from '../offchain/transactions/user/gather-fuel.js';
import { mineAsteria } from '../offchain/transactions/user/mine-asteria.js';
import { moveShip } from '../offchain/transactions/user/move-ship.js';
import { quit } from '../offchain/transactions/user/quit.js';
import { writeFile, readFile } from "fs/promises";
import { readPelletsCsvFile } from "../offchain/transactions/test/admin/pellet/utils.js";

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

const pelletFromCsv = await readPelletsCsvFile();
gameState.pellets = pelletFromCsv.map((pellet, index) => ({
  id: index,
  x: pellet.posX,
  y: pellet.posY,
  fuel: parseInt(pellet.fuel, 10),
}));

io.on("connection", async (socket: Socket) => {
  console.log("New client connected:", socket.id);
  console.log("Pellets from CSV:", pelletFromCsv);

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

      const shipTxHashes: string[] = [];
      try {
        for (const ship of ships) {
          const txHash = await createShip(ship.x, ship.y);
          await writeFile('./backend/user-hash/ships.json', JSON.stringify({ txHash }));
          if (!txHash) {
            throw new Error(`Failed to create ship at (${ship.x}, ${ship.y})`);
          }
          console.log("Ship txHash:", txHash);
          shipTxHashes.push(txHash);
        }

        gameState.ships[username] = ships;

        console.log(`Emitting createship-coordinates for ${username}:`, ships);
        io.emit("createship-coordinates", { coordinatesArray: ships });

        console.log("Emitting pellets-coordinates:", gameState.pellets);
        io.emit("pellets-coordinates", { pelletsCoordinates: gameState.pellets });
      } catch (err) {
        console.error("Error processing initial-shipCoordinates:", err);
        socket.emit("error", { message: "Failed to initialize ships or pellets" });
      }
    }
  );

  socket.on("ship-moved", async (data: { id: number; dx: number; dy: number }) => {
    console.log("Received ship-moved:", data);
    const { id, dx, dy } = data;

    try {
      // Read shipTxHash
      let shipTxHash: string;
      try {
        const fileContent = await readFile('./backend/user-hash/ships.json', 'utf-8');
        shipTxHash = JSON.parse(fileContent).txHash;
        console.log("Read shipTxHash:", shipTxHash);
      } catch (err) {
        console.error("Error reading ships.json:", err);
        socket.emit("error", { message: "Failed to read ship transaction hash" });
        return;
      }

      let username: string | undefined;
      let ship: Ship | undefined;
      let shipIndex: number = -1;

      // Find the ship
      for (const user in gameState.ships) {
        const userShips = gameState.ships[user];
        shipIndex = userShips.findIndex((s) => s.id === id);
        if (shipIndex !== -1) {
          username = user;
          ship = { ...userShips[shipIndex] };
          break;
        }
      }

      if (!username || !ship) {
        console.error("Ship not found for ID:", id, "in gameState:", gameState.ships);
        socket.emit("error", { message: `Ship not found for ID ${id}` });
        return;
      }

      // Calculate new position
      const newX = Math.max(-50, Math.min(50, ship.x + dx));
      const newY = Math.max(-50, Math.min(50, ship.y + dy));

      // Check if position changed
      if (newX === ship.x && newY === ship.y) {
        console.log(`Ship ${id} movement ignored (already at boundary):`, { newX, newY });
        return;
      }

      // Update ship position
      ship.x = newX;
      ship.y = newY;
      gameState.ships[username][shipIndex] = ship;


      io.emit("ship-moved", { ship });
      console.log(`Emitted ship-moved for ship ${id}:`, ship);

      // Call moveShip function
      const moveTxHash = await moveShip(dx, dy, shipTxHash);
      if (!moveTxHash) {
        console.error(`Failed to move ship ${id}, moveTxHash:`, moveTxHash);
        socket.emit("error", { message: `Failed to move ship ${id}` });
        return;
      }
      console.log(`Move ship ${id} txHash:`, moveTxHash);

      // Broadcast updated ship position
    
      // Check for pellet collision
      const pelletIndex = gameState.pellets.findIndex(
        (p) => p.x === ship.x && p.y === ship.y
      );
      if (pelletIndex !== -1) {
        const collectedPellet = gameState.pellets.splice(pelletIndex, 1)[0];
        const fuelTxHash = await gatherFuel(
          collectedPellet.fuel,
          shipTxHash,
          "67f5d630bae3da4bea5cb2b87f38da33e6f0d7b91665be94e2396c7c791423f3",
          collectedPellet.id
        );
        if (!fuelTxHash) {
          console.error("Failed to gather fuel, txHash:", fuelTxHash);
          socket.emit("error", { message: "Failed to gather fuel" });
        } else {
        io.emit("pellet-collected", { pelletId: collectedPellet.id });
        console.log(`Pellet collected: ${collectedPellet.id}`);
        console.log("Gather fuel txHash:", fuelTxHash);
        }
      }

      // Check for Asteria mining
      if (ship.x === 0 && ship.y === 0) {
        const mineTxHash = await mineAsteria(shipTxHash);
        if (!mineTxHash) {
          console.error("Failed to mine Asteria, txHash:", mineTxHash);
          socket.emit("error", { message: "Failed to mine Asteria" });
        } else {
          console.log("Mine Asteria txHash:", mineTxHash);
          io.emit("asteria-mined", { username });
          console.log(`${username} mined Asteria`);
          gameState.ships = {};
          gameState.pellets = [];
          io.emit("game-cleared", { message: "Game reset due to Asteria mined" });
        }
      }
    } catch (err) {
      console.error("Error processing ship-moved:", err);
      if (err instanceof Error) {
        socket.emit("error", { message: `Failed to process ship movement: ${err.message}` });
      } 
    }
  });

  socket.on("quit", async (data: { username: string }) => {
    console.log(`Quit request received from ${data.username}`);
    try {
      const shipTxHash = JSON.parse(await readFile('./backend/user-hash/ships.json', 'utf-8')).txHash;
      const quitTxHash = await quit(shipTxHash);
      if (!quitTxHash) {
        throw new Error(`Failed to process quit for ${data.username}`);
      }
      console.log("Quit txHash:", quitTxHash);

      if (gameState.ships[data.username]) {
        delete gameState.ships[data.username];
        console.log(`Cleared game state for ${data.username}`);
      }

      io.emit("game-cleared", {
        username: data.username,
        message: `${data.username} has quit the game`,
      });
      console.log(`Quit transaction hash for ${data.username}:`, quitTxHash);
    } catch (err) {
      console.error("Error processing quit:", err);
      socket.emit("error", { message: `Failed to process quit for ${data.username}` });
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