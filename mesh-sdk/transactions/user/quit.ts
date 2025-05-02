import { fromScriptRef } from "@meshsdk/core-cst";
import { blockchainProvider } from "../../utils.js";
import { Asset, deserializeDatum, PlutusScript, serializePlutusScript } from "@meshsdk/core";
import { readFile } from "fs/promises";


async function quit(ship_tx_hash: string){
  
const spacetimeDeployScript = JSON.parse(
    await readFile("./scriptref-hash/spacetime-script.json", "utf-8"));
if(!spacetimeDeployScript.txHash){
    throw Error ("spacetime script-ref not found, deploy spacetime first.");
}; 
const pelletDeployScript = JSON.parse(
    await readFile("./scriptref-hash/pellet-script.json", "utf-8"));
if(!pelletDeployScript.txHash){
throw Error ("pellet script-ref not found, deploy pellet first.");
};


const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyardPolicyid =   spacetimeUtxo[0].output.scriptHash;

const pelletUtxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const fuelPolicyId  = pelletUtxo[0].output.scriptRef;

const shipUtxos = await blockchainProvider.fetchUTxOs(ship_tx_hash)
const ship = shipUtxos[0];

const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData!);

// const burnShipAsset: Asset [] = [{
//  quantity: shipyardPolicyid! + 
// }]


}