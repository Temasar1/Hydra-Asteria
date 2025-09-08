import React, { useEffect, useState } from "react";
import getSocket from "../../apis/connection";
import { useRouter } from "next/router";

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
  const [hydraUrl, setHydraUrl] = useState<string>("");

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
    if (pendingShips.length > 0 && pendingPellets.length > 0 && isLoading) {
      localStorage.setItem("initialGameState", JSON.stringify({
        ships: pendingShips,
        pellets: pendingPellets,
        username,
        hydraUrl
      }));
      setIsLoading(false);
      router.push("/start");
    }
  }, [pendingShips, pendingPellets, isLoading, router, username]);

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if(!hydraUrl.trim()) {
      setError("Enter your Hydra API URL");
      setIsLoading(false);
      return
    }

    if (!username.trim()) {
      setError("Enter a username");
      setIsLoading(false);
      return;
    }

    if (!shipsCount || shipsCount < 1 || shipsCount > 5) {
      setError("Enter a number of ships between 1 and 5");
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
    socket.emit("hydra-url", {
      hydraUrl
    })
  };

  // Custom style for placeholder font
  const inputPlaceholderStyle = {
    fontFamily: "'monocraft', 'monospace', 'DM Sans', 'sans-serif'",
    letterSpacing: "0.03em"
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-transparent overflow-hidden">
      {/* Starfield background */}
      {/* <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/starfield_front.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7) blur(0.5px)"
        }}
      /> */}
      {/* Overlay for game look */}
      {/* <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0a1a90] via-[#1a1a2a80] to-[#0a0a1aee]" /> */}

      {/* Game Setup Card */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-xl px-8 py-10 rounded-3xl shadow-2xl backdrop-blur-md bg-[#18182aee] border-4 border-[#e9ebee]">
        <img src="/landing-ship-1.svg" className="h-16 mb-4 animate-bounce" alt="Ship" />
        <h1 className="font-monocraft-regular text-3xl text-[#e9ebee] mb-2 tracking-wider text-center drop-shadow-lg">
          Game Setup
        </h1>
        <p className="font-dmsans-regular text-[#b6c2d1] text-lg mb-6 text-center">
          Enter your details to start a new game session.
        </p>

        {error && (
          <div className="w-full mb-2">
            <p className="text-red-300 font-monocraft-regular text-center text-base bg-[#2a1a1a80] rounded py-2 border border-red-400">
              {error}
            </p>
          </div>
        )}
        {isLoading && (
          <div className="w-full mb-2">
            <p className="text-blue-200 font-monocraft-regular text-center text-base bg-[#1a2a3a80] rounded py-2 border border-blue-400 animate-pulse">
              Creating game...
            </p>
          </div>
        )}

        <form
          onSubmit={handleCreateGame}
          className="flex flex-col gap-6 w-full"
        >
          <div className="flex flex-col gap-4 w-full">
            <input
              type="url"
              placeholder="Enter hydra API URL"
              value={hydraUrl}
              onChange={(e) => setHydraUrl(e.target.value)}
              className="font-monocraft-regular placeholder:font-monocraft-regular placeholder:text-[#b6c2d1] bg-[#23233a] border-2 border-[#e9ebee] rounded-lg px-5 py-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              style={inputPlaceholderStyle}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
              name="hydraUrl"
            />
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="font-monocraft-regular placeholder:font-monocraft-regular placeholder:text-[#b6c2d1] bg-[#23233a] border-2 border-[#e9ebee] rounded-lg px-5 py-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              style={inputPlaceholderStyle}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
              name="username"
            />
            <input
              type="number"
              placeholder="Number of ships (1-5)"
              value={shipsCount === undefined ? "" : shipsCount}
              onChange={(e) => setShipsCount(e.target.value ? parseInt(e.target.value) : undefined)}
              min={1}
              max={5}
              className="font-monocraft-regular placeholder:font-monocraft-regular placeholder:text-[#b6c2d1] bg-[#23233a] border-2 border-[#e9ebee] rounded-lg px-5 py-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              style={inputPlaceholderStyle}
              disabled={isLoading}
              autoComplete="off"
              spellCheck={false}
              name="shipsCount"
            />
          </div>
          <button
            type="submit"
            className="font-monocraft-regular text-lg bg-gradient-to-r from-grey-300 to-blue-200 text-white border-2 border-grey-400 rounded-lg px-8 py-4 mt-2 shadow-lg hover:from-blue-200 hover:to-grey-400 hover:scale-105 transition-all disabled:opacity-50"
            disabled={isLoading}
          >
            START GAME
          </button>
        </form>

        {/* Score and username display */}
        <div className="absolute top-4 left-4 flex gap-2 items-center">
          <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center text-black font-monocraft-regular text-lg border-2 border-yellow-400 shadow-md">
            0
          </div>
          <div className="text-base font-monocraft-regular text-[#e9ebee] px-2 py-1 bg-[#23233a] rounded border border-[#e9ebee] shadow">
            {username}
          </div>
        </div>
      </div>
      {/* Decorative floating elements */}
      <img
        src="/landing-fuel-1.svg"
        className="absolute bottom-8 left-8 w-16 h-16 animate-float-slow opacity-80 z-10"
        alt="Fuel"
      />
      <img
        src="/landing-ship-2.svg"
        className="absolute top-8 right-8 w-16 h-16 animate-float-fast opacity-80 z-10"
        alt="Ship"
      />
    </div>
  );
};
export default GameSetup;