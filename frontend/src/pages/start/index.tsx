import React, { useState } from "react";

const GRID_SIZE = 100;

function generateGrid() {
    const grid = [];
    for (let y = -GRID_SIZE / 2; y < GRID_SIZE / 2; y++) {
        const row = [];
        for (let x = -GRID_SIZE / 2; x < GRID_SIZE / 2; x++) {
            row.push({ x, y, content: null as string | null });
        }
        grid.push(row);
    }
    return grid;
}

export default function Start() {
    const [grid, setGrid] = useState<{ x: number; y: number; content: string | null }[][]>(generateGrid());
    const [inputValue, setInputValue] = useState("");
    const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
   const [zoom, setZoom] = useState(1); // State to manage zoom level


    const handleCellClick = (x: number, y: number) => {
        setSelectedCell({ x, y });
    };

    const handleAddContent = () => {
        if (selectedCell) {
            setGrid((prevGrid) => {
                return prevGrid.map((row) =>
                    row.map((cell) =>
                        cell.x === selectedCell?.x && cell.y === selectedCell?.y
                            ? { ...cell, content: inputValue }
                            : cell
                    )
                );
            });
            setInputValue("");
            setSelectedCell(null);
        }
    };

    return (
        <div>
            <div className="controls">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter content"
                />
                <button onClick={handleAddContent} disabled={!selectedCell}>
                    Add to Grid
                </button>
            </div>
            <div
                className="grid"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "140%",
                    height: "280vh",
                    backgroundImage: "url('/visualizer/background.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    transform: `scale(${zoom})`, // Apply zoom level
                    transformOrigin: "center", // Zoom from the center
                }}
            >
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} className="row" style={{ display: "flex" }}>
                        {row.map((cell) => (
                            <div
                                key={`${cell.x},${cell.y}`}
                                className="cell"
                                style={{
                                    width: "20px",
                                    height: "20px",
                                    border: "0.1px solid black",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundImage:
                                        selectedCell?.x === cell.x && selectedCell?.y === cell.y
                                            ? "linear-gradient(rgba(128, 128, 128, 0.5), rgba(128, 128, 128, 0.5))"
                                            : "none",
                                }}
                                onClick={() => handleCellClick(cell.x, cell.y)}
                            >
                                {cell.content}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

