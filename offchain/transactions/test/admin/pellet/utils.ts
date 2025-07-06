import { existsSync } from "node:fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvToDist = join(__dirname, 'pellets.csv');

export const writePelletsCsvFIle = async (pellets: {
    posX: number,
    posY: number,
    fuel: string
}[]) => {

    const csvFilePath = 
    join(process.cwd(), "offchain/transactions/test/admin/pellet/pellets.csv");
    
    const csvHeaders = "posX,posY,fuel\n";
    const csvData = pellets.map(pellet => `${pellet.posX},${pellet.posY},${pellet.fuel}`).join("\n");
    console.log("Writing CSV to:", csvFilePath);
    writeFile(csvToDist, csvHeaders + csvData, "utf8" );
    writeFile(csvFilePath, csvHeaders + csvData, "utf8");
};

export const readPelletsCsvFile = async () => {
  console.log('Reading CSV from:', csvToDist);
  const csvFilePath = join(process.cwd(), "transactions/test/admin/pellet/pellets.csv");
  if (existsSync(csvToDist)) {
    const csvContent = await readFile(csvToDist || csvFilePath, 'utf8');
    const readPellet = csvContent
      .split("\n")
      .slice(1) // Skip the header row
      .filter(line => line.trim() !== "") // Remove empty lines
      .map(line => {
        const [posX, posY, fuel] = line.split(",");
        return {
          posX: parseInt(posX, 10),
          posY: parseInt(posY, 10),
          fuel: fuel.trim(),
        };
      });
    return readPellet;
  } else {
    throw new Error("Unable to read pellets");
  }
};
