import { fromScriptRef, resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import { admintoken,fuelToken} from "../../config.js";
import { blockchainProvider } from "../../utils.js";
import { Asset, conStr0, conStr1, conStr2, deserializeDatum, integer, MeshTxBuilder, PlutusScript, policyId, stringToHex } from "@meshsdk/core";
import { readFile } from "fs/promises";


async function mineAsteria(
    max_asteria_mining: number,
    ship_tx_hash: string,
    tx_earliest_posix_time: number
){

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
const asteriaDeployScript = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteriaDeployScript.txHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};


const spacetimeUtxos = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyardPolicyId = spacetimeUtxos[0].output.scriptHash;

const pelletUtxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const fuelPolicyid = pelletUtxo[0].output.scriptHash;

const pelletScriptRef = fromScriptRef(pelletUtxo[0].output.scriptRef!);
const pelletPlutusScript = pelletScriptRef as PlutusScript;
const pelletScriptAddress =  resolvePlutusScriptAddress(pelletPlutusScript,0);

const asteriaUtxos = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash);
const asteriaScriptRef = fromScriptRef(asteriaUtxos[0].output.scriptRef!);
const asteriaPlutusScript = asteriaScriptRef as PlutusScript;
const asteriaScriptAddress  = resolvePlutusScriptAddress(asteriaPlutusScript, 0);


const ship = spacetimeUtxos[0];
if (!ship.output.plutusData){
    throw Error("ship datum empty");
};

const asteria = asteriaUtxos[0];
if (asteria.output.plutusData){
    throw Error (" Asteria datum not found");
;}
//get input ship datum
const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData!).fields;

//get datum properties
const shipDatumPosX: number = shipInputDatum[0].int;
const shipDatumPosY: number = shipInputDatum[1].int;
const shipDatumShipTokenName: string = shipInputDatum[2].bytes;
const shipDatumPilotTokenName:string = shipInputDatum[3].bytes;
const shipDatumLastMoveLatestTime: number = shipInputDatum[4].int;

//get asteria datum 
const asteriaInputdata = asteria.output.plutusData;
const asteriaInputDatum = deserializeDatum(asteriaInputdata!).fields;

//get datum properties
const asteriaDatumShipCounter = asteriaInputDatum[0].int;
const asteriaDatumShipyardpolicyId = asteriaInputDatum[1].bytes;
const fuelTokenName = stringToHex("FUEL");

const shipInputFuel = ship.output.amount.find((Asset) =>
    Asset.unit == fuelPolicyid + fuelTokenName
);
const shipFuel = shipInputFuel?.quantity;

const rewardAsset = asteria.output.amount.find((Asset) =>
    Asset.unit === "Lovelace"
);
const rewards = rewardAsset?.quantity!;
const minedRewards = Math.floor(Number(rewards) * max_asteria_mining) /100;

const asteriaOutputDatum = conStr0([
 integer(asteriaDatumShipCounter),
 policyId(asteriaDatumShipyardpolicyId)
]);

const asteriaOutputAsset: Asset[] = [
{
    unit: admintoken.policyid + admintoken.name,
    quantity: "1"
},
{
    unit: "lovelace",
    quantity: (Number(rewards) - minedRewards).toString()
    
 }];
const shiptokenAsset: Asset[] = [{
    unit: shipyardPolicyId + shipDatumShipTokenName,
    quantity: "-1"
}];
const pilottokenAsset: Asset[] = [{
    unit: shipyardPolicyId + shipDatumPilotTokenName,
    quantity: "1"
}];
const fueltokenAsset: Asset [] = [{
    unit: shipInputFuel?.unit!,
    quantity: shipInputFuel?.quantity!
}]

const shipRedemmer = conStr2([]);
const asteriaRedeemer = conStr1([]);
const burnShipRedeemer = conStr1([]);
const burnfuelRedeemer = conStr1([]);

const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    verbose: true
});

const unsignedTx = await txBuilder
.invalidBefore(tx_earliest_posix_time)
.mintPlutusScriptV3()
.mint("-1",shipyardPolicyId!,shipDatumShipTokenName)
.mintTxInReference(spacetimeDeployScript.txHash,0)
.mintRedeemerValue(burnShipRedeemer,"JSON")

.mintPlutusScriptV3()
.mint("-" + shipFuel!,fuelPolicyid!,fuelTokenName)
.mintTxInReference(pelletDeployScript.txHash,0)
.mintRedeemerValue(burnfuelRedeemer,"JSON")

.spendingPlutusScriptV3()
.txIn(
    ship.input.txHash,
    ship.input.outputIndex,
    ship.output.amount,
    ship.output.address
)
.txInRedeemerValue(asteriaRedeemer,'JSON')
.spendingTxInReference(asteriaDeployScript.txHash,0)
.txInInlineDatumPresent()
.txOut(asteriaScriptAddress,asteriaOutputAsset)
.txOutInlineDatumValue(asteriaOutputDatum,"JSON")

.spendingPlutusScriptV3()
.txIn(
    asteria.input.txHash,
    asteria.input.outputIndex,
    asteria.output.amount,
    asteria.output.address
)
.txInRedeemerValue(shipRedemmer,"JSON")
.spendingTxInReference(spacetimeDeployScript.txHash,0)
.txInInlineDatumPresent()
}

export {mineAsteria};