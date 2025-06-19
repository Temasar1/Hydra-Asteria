import React, { useEffect, useState } from "react";
import getSocket from "../../../apis/connection";
import { useRouter } from "next/router";
import { CardanoWallet } from "@meshsdk/react";
import {BrowserWallet} from "@meshsdk/core"

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

const GameSetup: React.FC = () => {
  const router = useRouter();
  const socket = getSocket();
  const [username, setUsername] = useState("");
  const [shipsCount, setShipsCount] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingShips, setPendingShips] = useState<Ship[]>([]);
  const [pendingPellets, setPendingPellets] = useState<Pellet[]>([]);

  useEffect(() => {
    const handleCreateShipCoordinates = (data: { coordinatesArray: Ship[] }) => {
      console.log("Received createship-coordinates:", data);
      setPendingShips(data.coordinatesArray);
    };

    const handlePelletsCoordinates = (data: { pelletsCoordinates: Pellet[] }) => {
      console.log("Received pellets-coordinates:", data);
      setPendingPellets(data.pelletsCoordinates);
    };

    socket.on("createship-coordinates", handleCreateShipCoordinates);
    socket.on("pellets-coordinates", handlePelletsCoordinates);

    return () => {
      socket.off("createship-coordinates", handleCreateShipCoordinates);
      socket.off("pellets-coordinates", handlePelletsCoordinates);
    };
  }, [socket]);

  useEffect(() => {
    // Redirect when both ships and pellets are received
    if (pendingShips.length > 0 && pendingPellets.length > 0 && isLoading) {
      console.log("Redirecting to /start with ships and pellets");
      // Store initial state in localStorage for GameStart
      localStorage.setItem("initialGameState", JSON.stringify({
        ships: pendingShips,
        pellets: pendingPellets,
        username,
      }));
      setIsLoading(false);
      router.push("/start");
    }
  }, [pendingShips, pendingPellets, isLoading, router, username]);

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username.trim()) {
      setError("Please enter a username");
      setIsLoading(false);
      return;
    }

    if (!shipsCount || shipsCount < 1 || shipsCount > 5) {
      setError("Please enter a number of ships between 1 and 5");
      setIsLoading(false);
      return;
    }

    const shipProps: Ship[] = Array.from({ length: shipsCount }, (_, index) => {
      const x = Math.random() < 0.5
        ? Math.floor(Math.random() * 41) + 10
        : Math.floor(Math.random() * 41) - 50;
      const y = Math.random() < 0.5
        ? Math.floor(Math.random() * 41) + 10
        : Math.floor(Math.random() * 41) - 50;
      return { id: index, x, y };
    });

    console.log("Emitting initial-shipCoordinates:", { username, ships: shipProps });

    socket.emit("initial-shipCoordinates", {
      shipProperty: { username, ships: shipProps },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-4 text-white bg-gray-900">
      <div className="absolute top-4 right-4 border border-black rounded">
        <CardanoWallet
          label="Connect Wallet"
          isDark={false}
          persist={true}
          onConnected={(wallet: BrowserWallet) => {
        console.log("Wallet connected:", wallet);
          }}
        />
      </div>
      <h1 className="text-4xl font-bold">Hydra-Asteria</h1>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p className="text-yellow-400">Creating game...</p>}
      <form onSubmit={handleCreateGame} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-full border border-gray-300 px-4 py-2 text-black"
          disabled={isLoading}
        />
        <input
          type="number"
          placeholder="Number of ships (max 5)"
          value={shipsCount ?? ""}
          onChange={(e) => setShipsCount(Number(e.target.value) || undefined)}
          min="1"
          max="5"
          className="rounded-full border border-gray-300 px-4 py-2 text-black"
          disabled={isLoading}
        />
        <div className="text-center mt-8">
          <button
            type="submit"
            className="text-black bg-[#07F3E6] py-4 px-8 rounded-full text-lg disabled:opacity-50"
            disabled={isLoading}
          >
            Create Game
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameSetup;