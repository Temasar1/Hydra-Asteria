import { createPellet } from "../transactions/asteria-tx/admin/pellet/create-pellet.js";
import { gatherFuel } from "../transactions/asteria-tx/user/gather-fuel.js";
import { mineAsteria } from "../transactions/asteria-tx/user/mine-asteria.js";

let shipCoordinates: { x: number, y: number }[] = [];
let initialPelletCoordinates: { x: number, y: number }[] = [];

export const createShips = async (socket: any) => {
  socket.on('initial-coordinates', async (data: { pellets: { x: number, y: number }[], ships: { x: number, y: number }[] }) => {
    const { ships } = data;

    if (!Array.isArray(ships)) {
      throw new Error("Ship data is not an array.");
    }

    ships.forEach(ship => {
      console.log("Create ship at coordinates:", ship.x, ship.y);
    });
  });
};

export const createPellets = async (socket: any) => {
  socket.on('initial-coordinates', async (data: { pellets: { x: number, y: number }[], ships: { x: number, y: number }[] }) => {
    const { pellets } = data;

    if (!Array.isArray(pellets)) {
      throw new Error("Pellet data is not an array.");
    }

    pellets.forEach(pellet => {
      const pelletProperty = {
        posX: pellet.x,
        posY: pellet.y,
        fuel: "10"
      };

      console.log("Pellet properties:", pelletProperty);
      // const txHash = await createPellet(pelletProperty);
      // console.log("Transaction hash:", txHash);
    });
  });
};

export const shipActions = async (socket: any) => {
  socket.on('initial-coordinates', async (data: { pellets: { x: number, y: number }[], ships: { x: number, y: number }[] }) => {
    const { pellets } = data;

    if (!Array.isArray(pellets)) {
      throw new Error("Pellet data is not an array.");
    }

    initialPelletCoordinates = [...pellets];
  });

  socket.on('ship-coordinates', async (data: { latestShipCoordinates: { x: number, y: number }[] }) => {
    const coordinatesArray = data.latestShipCoordinates;

    if (!Array.isArray(coordinatesArray)) {
      throw new Error("Ship data is not an array.");
    }

    if (shipCoordinates.length === 0) {
      shipCoordinates = [...coordinatesArray];
      return;
    }

    coordinatesArray.forEach((newCoordinates, i) => {
      const prevCoordinates = shipCoordinates[i];

      if (!prevCoordinates || newCoordinates.x !== prevCoordinates.x || newCoordinates.y !== prevCoordinates.y) {
        console.log("Ship moved to:", newCoordinates.x, newCoordinates.y);

        const matchesPellet = initialPelletCoordinates.some(
          pellet => pellet.x === newCoordinates.x && pellet.y === newCoordinates.y
        );

        if (matchesPellet) {
          // await gatherFuel(20, "", "", 20);
          console.log("Gathered fuel at:", newCoordinates.x, newCoordinates.y);
        }

        if (newCoordinates.x === 0 && newCoordinates.y === 0) {
          // const txHash = await mineAsteria(20, "", 20);
          console.log("Mined Asteria:", "done");
        }
      }
    });
    shipCoordinates = [...coordinatesArray];
  });
};
