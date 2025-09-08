import { MeshWallet, BlockfrostProvider, MaestroProvider} from "@meshsdk/core";
import { readFile, writeFile } from "fs/promises";
import { join } from 'path';

// const blockfrostApiKey = process.env.BLOCKFROST_APIKEY;
// //const seedPhrase  = process.env.SEED_PHRASE?.split(',')!
// if (!blockfrostApiKey) {
//   throw new Error("BLOCKFROST_APIKEY not found in .env file.");
// }
// if (!seedPhrase){
//   throw new Error("SEED_PHRASE not found in .env file");
// }
//const seedPhrase = ["Hockey","Umbrella","Liquid","Robust","Security","Cash","Panther","Buffalo","File","Fiction","Typical","Food","Omit","Example","Valid","Bronze","Mutual","Denial","Lens","System","Pottery","Portion","Swift","Stove"];
const seedPhrase = ["vibrant","north","decade","mean","ensure","turn","universe","cause","neutral","mad","can","next","mutual","tongue","main","bind","lizard","crumble","order","pole","assault","guilt","physical","cup"];
export const blockchainProvider = new BlockfrostProvider("preprodYAw21nxr9EdeZNSLDDLOJVg98DOrya75");

export const myWallet = new MeshWallet({
  networkId: 0, // 0: testnet, 1: mainnet
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'mnemonic',
    words: seedPhrase,
  },
});

export const maestroprovider = new MaestroProvider({
  network: "Preprod",
  apiKey: "HOMTwVrArW5p3LEsv69qJ32gJ9q6xP4u",
  turboSubmit:false
});

const blockData = await blockchainProvider.fetchLatestBlock();
export const time = blockData.time;
const slot = blockData.slot;

export const tx_latest_slot = Number(slot) + 300;
export const tx_earliest_slot = Number(slot) - 60;
//export const tx_earliest_posix_time = time - 60 * 1000;     //- 1 minute from now

const __dirname = (process.cwd())
const __filedir = join(__dirname, '/offchain/transactions/admin/deploy/ref-script/');

export const writeScriptRefJson = async (filename: string, txHash: string) => {
  await writeFile(
    __filedir + filename + ".json",
    JSON.stringify({ txHash: txHash })
    );
};

export const readScripRefJson = async (filename: string) => {
const scriptRef = JSON.parse(
  await readFile(__filedir + filename + ".json", "utf-8"));
  if(!scriptRef){
    throw new Error(`${filename} scriptref not found`);
  }
  return scriptRef;
}
