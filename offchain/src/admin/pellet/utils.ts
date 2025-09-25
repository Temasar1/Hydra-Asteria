import { existsSync } from "node:fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDist = __dirname.includes("/dist/");
const sourceDir = isDist ? join(__dirname, "../../admin/pellet") : __dirname;
const distDir = isDist
  ? __dirname
  : join(__dirname, "../../../dist/src/admin/pellet");

const csvSourcePath = join(sourceDir, "pellets.csv");
const csvDistPath = join(distDir, "pellets.csv");

export const writePelletsCsvFIle = async (
  pellets: {
    posX: number;
    posY: number;
    fuel: string;
  }[]
) => {
  const csvHeaders = "posX,posY,fuel\n";
  const csvData = pellets
    .map((pellet) => `${pellet.posX},${pellet.posY},${pellet.fuel}`)
    .join("\n");

  console.log("Writing pellets CSV to:", csvSourcePath);

  // Write to both source and dist locations
  await writeFile(csvSourcePath, csvHeaders + csvData, "utf8");
  await writeFile(csvDistPath, csvHeaders + csvData, "utf8");
};

export const readPelletsCsvFile = async () => {
  console.log("Reading pellets CSV from:", csvSourcePath);

  const csvPath = existsSync(csvDistPath) ? csvDistPath : csvSourcePath;

  if (existsSync(csvPath)) {
    const csvContent = await readFile(csvPath, "utf8");
    const readPellet = csvContent
      .split("\n")
      .slice(1)
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [posX, posY, fuel] = line.split(",");
        return {
          posX: parseInt(posX, 10),
          posY: parseInt(posY, 10),
          fuel: fuel.trim(),
        };
      });
    return readPellet;
  } else {
    console.log(csvDistPath);
    throw new Error(
      "Unable to read pellets from both source and dist locations"
    );
  }
};
export { __dirname };
