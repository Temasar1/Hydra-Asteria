import { MeshWallet, BlockfrostProvider, MaestroProvider } from "@meshsdk/core";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import "dotenv/config";
import { HydraProvider } from "@meshsdk/hydra";

const seedPhrase = process.env.SEED_PHRASE?.split(" ");
if (seedPhrase == undefined) {
  throw new Error(
    "Enter your seedphrase in an .env file: make sure .env file in the root directory"
  );
}
const blockfrost_API = process.env.BLOCKFROST_APIKEY;
if (blockfrost_API == undefined) {
  throw new Error("Enter your blockfrost key in an env file");
}
const maestro_API = process.env.MAESTRO_APIKEY;
if (maestro_API == undefined) {
  throw new Error("Enter your maestro key in an env file");
}
export const blockchainProvider = new BlockfrostProvider(blockfrost_API);
export const hydra_api_url = process.env.HYDRA_API_URL;
if (hydra_api_url == undefined) {
  throw new Error("Enter your hydra api url in an env file");
}
export const hydraProvider = new HydraProvider({
  httpUrl: hydra_api_url,
});

export const myWallet = new MeshWallet({
  networkId: 0,
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: "mnemonic",
    words: seedPhrase,
  },
});

export const hydraWallet = new MeshWallet({
  networkId: 0,
  fetcher: hydraProvider,
  submitter: hydraProvider,
  key: {
    type: "mnemonic",
    words: seedPhrase,
  },
});

export const maestroprovider = new MaestroProvider({
  network: "Preprod",
  apiKey: maestro_API,
  turboSubmit: false,
});

const blockData = await blockchainProvider.fetchLatestBlock();
export const time = blockData.time;
const slot = blockData.slot;

export const tx_latest_slot = Number(slot) + 300;
export const tx_earliest_slot = Number(slot) - 60;
//export const tx_earliest_posix_time = time - 60 * 1000;     //- 1 minute from now

const __dirname = process.cwd();
const __filedir = join(__dirname, "src/admin/deploy/ref-script/");

export const writeScriptRefJson = async (filename: string, txHash: string) => {
  await writeFile(
    __filedir + filename + ".json",
    JSON.stringify({ txHash: txHash })
  );
};

export const readScripRefJson = async (filename: string) => {
  const scriptRef = JSON.parse(
    await readFile(__filedir + filename + ".json", "utf-8")
  );
  if (!scriptRef) {
    throw new Error(`${filename} scriptref not found`);
  }
  return scriptRef;
};
