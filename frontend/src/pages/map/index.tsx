import React, { useEffect, useRef, useState } from "react";

// Example input centered around 0
let changeShipPos: {x: number, y: number}[];
const inputPellets = [
  { x: -40, y: 20 },
  { x: 0, y: 0 },
  { x: 40, y: -10 },
  { x: 25, y: 30 },
  { x: -15, y: -20 },
  { x: -35, y: 10 },
];
const inputShips = [
  { x: -5, y: -5 },
  { x: 10, y: 15 },
  { x: -10, y: 15 },
];
 
const GalaxyMap = ({ pellets = inputPellets, ships = inputShips }) => {
  const gridSize = 100; // Full grid range (-50 to 50)
  const moveStep = 1;
  const containerRef = useRef(null);

  const [ship, setShip] = useState(ships);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;

      setShip((prevShips) => {
        const updated = [...prevShips];
        const node = { ...updated[selectedIndex] };

        switch (e.key) {
          case "ArrowUp":
            node.y = Math.max(-50, node.y - moveStep);
            break;
          case "ArrowDown":
            node.y = Math.min(50, node.y + moveStep);
            break;
          case "ArrowLeft":
            node.x = Math.max(-50, node.x - moveStep);
            break;
          case "ArrowRight":
            node.x = Math.min(50, node.x + moveStep);
            break;
          default:
            return prevShips;
        }

        updated[selectedIndex] = node;
        changeShipPos = updated;
        return updated;
      });
    };
  


    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handleClick = (index) => {
    setSelectedIndex(index);
    //moveShips();
  };

  const toPercent = (val) => `${((val + 50) / gridSize) * 100}%`;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden outline-none"
      style={{
        backgroundImage: "url('/starfield.svg')",
        backgroundSize: "conver",
        backgroundPosition: "center",
      }}
    >
      {pellets.map((node, idx) => (
        <img
          key={idx}
          src="/landing-fuel-1.svg"
          alt="pellet"
          className="absolute w-6 h-6"
          style={{
            left: toPercent(node.x),
            top: toPercent(node.y),
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <img
        src="/favicon.png"
        alt="asteria"
        className="absolute w-16 h-16"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}
      />

      {ship.map((s, index) => (
        <img
          key={index}
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
            handleClick(index);
          }}
        />
      ))}
      {/* Center Grid at (0,0) */}
        <div
          className="absolute border-2 border-black-400 bg-transparent pointer-events-none"
          style={{
            width: "1%",
            height: "1%",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}
        >
          <span className="absolute text-green-400 text-xs" style={{ top: "100%", left: "50%", transform: "translateX(-50%)" }}>
            (0, 0)
          </span>
        </div>
    </div>
  );
};

export default GalaxyMap;