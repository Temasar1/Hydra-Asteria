
import React, { useEffect, useRef, useState } from "react";
import getSocket from "../../../apis/connection";
import GameSetup from "@/components/setup";

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

const GameStart: React.FC = () => {
  const gridSize = 100;
  const moveStep = 1;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ships, setShips] = useState<Ship[]>([]);
  const [pellets, setPellets] = useState<Pellet[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const socket = getSocket();

  useEffect(() => {
    const initialState = localStorage.getItem("initialGameState");
    if (initialState) {
      const { ships: initialShips, pellets: initialPellets } = JSON.parse(initialState);
      console.log("Loaded initial state from localStorage:", { initialShips, initialPellets });
      setShips(initialShips);
      setPellets(initialPellets);
    }

    containerRef.current?.focus();

    socket.on("createship-coordinates", (data: { coordinatesArray: Ship[] }) => {
      console.log("Received createship-coordinates:", data);
      setShips(data.coordinatesArray);
    });

    socket.on("pellets-coordinates", (data: { pelletsCoordinates: Pellet[] }) => {
      console.log("Received pellets-coordinates:", data);
      setPellets(data.pelletsCoordinates);
    });

    socket.on("ship-moved", (data: { ship: Ship }) => {
      console.log("Received ship-moved:", data);
      setShips((prev) => prev.map((s) => (s.id === data.ship.id ? data.ship : s)));
    });

    socket.on("pellet-collected", (data: { pelletId: number }) => {
      console.log("Received pellet-collected:", data);
      setPellets((prev) => prev.filter((p) => p.id !== data.pelletId));
    });

    socket.on("asteria-mined", (data: { username: string }) => {
      console.log("Received asteria-mined:", data);
      alert(`${data.username} has mined Asteria! Game Over!`);
    });

    socket.on("game-cleared", (data: { username: string; message: string }) => {
      console.log("Game cleared:", data.message);
      setShips([]);
      setPellets([]);
      setSelectedIndex(null);
      alert(data.message);
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Server error:", data.message);
      alert(`Error: ${data.message}`);
    });

    return () => {
      socket.off("createship-coordinates");
      socket.off("pellets-coordinates");
      socket.off("ship-moved");
      socket.off("pellet-collected");
      socket.off("asteria-mined");
      socket.off("game-cleared");
      socket.off("error");
    };
  }, [socket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= ships.length) {
        console.warn("No ship selected or invalid index:", selectedIndex);
        return;
      }

      const ship = ships[selectedIndex];
      if (!ship) {
        console.error("Ship not found at index:", selectedIndex);
        return;
      }

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case "ArrowUp":
          dy = -moveStep;
          break;
        case "ArrowDown":
          dy = moveStep;
          break;
        case "ArrowLeft":
          dx = -moveStep;
          break;
        case "ArrowRight":
          dx = moveStep;
          break;
        default:
          return;
      }

      console.log("Emitting ship-moved:", { id: ship.id, dx, dy });
      socket.emit("ship-moved", { id: ship.id, dx, dy });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, ships, socket]);

  const handleShipClick = (index: number) => {
    setSelectedIndex(index);
    containerRef.current?.focus();
    console.log("Selected ship at index:", index, ships[index]);
  };

  const handleQuit = () => {
    const username = "currentUser";
    socket.emit("quit", { username });
    localStorage.removeItem("initialGameState");
    console.log("Game state cleared from localStorage");
  };

  const toPercent = (val: number) => `${((val + 50) / gridSize) * 100}%`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden outline-none"
      style={{
        backgroundImage: "url('/starfield.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {pellets.map((node) => (
        <div
          key={node.id}
          className="absolute group"
          style={{
            left: toPercent(node.x),
            top: toPercent(node.y),
            transform: "translate(-50%, -50%)",
          }}
        >
          <img src="/fuel.svg" alt="pellet" className="w-6 h-6" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-black bg-opacity-70 text-white text-xs rounded-md border border-gray-300 px-2 py-1 whitespace-nowrap z-50">
            ID: {node.id}, Fuel: {node.fuel}
            <br />
            ({node.x}, {node.y})
          </div>
        </div>
      ))}
      <img
        src="/asteria-light.png"
        alt="asteria"
        className="absolute w-20 h-20"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      />
      {ships.map((s, index) => (
        <img
          key={s.id}
          src="/landing-ship-1.svg"
          alt="ship"
          className={`absolute w-6 h-6 cursor-pointer ${
            index === selectedIndex ? "ring-2 ring-yellow-400" : ""
          }`}
          style={{
            left: toPercent(s.x),
            top: toPercent(s.y),
            transform: "translate(-50%, -50%)",
            zIndex: index === selectedIndex ? 10 : 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleShipClick(index);
          }}
        />
      ))}
      <div
        className="absolute border-2 border-gray-400 bg-transparent pointer-events-none"
        style={{
          width: "1%",
          height: "1%",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
        }}
      >
        <span
          className="absolute text-green-400 text-xs"
          style={{ top: "100%", left: "50%", transform: "translateX(-50%)" }}
        >
          (0, 0)
        </span>
      </div>
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white py-2 px-4 rounded-md text-lg">
        <button
          type="button"
          className="text-white font-monocraft-regular bg-black bg-opacity-70 py-2 px-4 rounded-full disabled:opacity-10"
          onClick={handleQuit}
        >
          quit
        </button>
      </div>
      {/* Game Setup overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          width: "100vw",
          height: "100vh",
          background: "inherit"
        }}
      >
        <GameSetup />
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

export default GameStart;