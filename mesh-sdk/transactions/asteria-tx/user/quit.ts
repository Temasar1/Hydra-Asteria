import { fromScriptRef, toScriptRef } from "@meshsdk/core-cst";
import { blockchainProvider, myWallet } from "../../utils.js";
import { Asset, conStr1, deserializeDatum, MeshTxBuilder, PlutusScript, serializePlutusScript, stringToHex, UTxO } from "@meshsdk/core";
import { readFile } from "fs/promises";


const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();


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

const spacetime_scriptref_utxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyard_policyid =   spacetime_scriptref_utxo[0].output.scriptHash;

const pellet_scriptref_utxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const pellet_scriptref = fromScriptRef(pellet_scriptref_utxo[0].output.scriptRef!);
const pellet_plutus_script = pellet_scriptref as PlutusScript;
const fuel_policyId = pellet_scriptref_utxo[0].output.scriptHash;

const fuelTokenName = stringToHex("FUEL");
const shipUtxos = await blockchainProvider.fetchUTxOs(ship_tx_hash)
const ship = shipUtxos[0];
const shipInputFuel = ship.output.amount.find((Assets) =>
   Assets.unit == shipyard_policyid + fuelTokenName
);

const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData!).fields;
const shipFuel = shipInputFuel?.quantity;

const ship_datum_PosX: number = shipInputDatum[0].int;
const ship_datum_PosY: number = shipInputDatum[1].int;
const ship_datum_ShipTokenName: string = shipInputDatum[2].bytes;
const ship_datum_PilotTokenName:string = shipInputDatum[3].bytes;
const ship_datumLastMoveLatestTime: number = shipInputDatum[4].int;

const burnShipRedeemer = conStr1([]);
const burnfuelRedeemer = conStr1([]);
const quitRedeemer = conStr1([]);

const txbuilder = new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
    verbose: true
})

const unsignedTx   = await txbuilder
.spendingPlutusScriptV3()
.txIn(
    ship.input.txHash,
    ship.input.outputIndex
)
.txInRedeemerValue(quitRedeemer, "JSON")
.spendingTxInReference(spacetimeDeployScript.txHash,0)

.mintPlutusScriptV3()
.mint("-1", shipyard_policyid!,ship_datum_ShipTokenName)
.mintTxInReference(spacetimeDeployScript.txHash,0)
.mintRedeemerValue(burnShipRedeemer,"JSON")
.mintPlutusScriptV3()
.mint("-" + shipFuel,fuel_policyId!, fuelTokenName)
.mintTxInReference(spacetimeDeployScript.txhash, 0)
.mintRedeemerValue(burnfuelRedeemer,"JSON")

.txOut(myWallet.addresses.baseAddressBech32!, [{
    unit: shipyard_policyid + ship_datum_PilotTokenName,
    quantity: "1"
}])
.txInCollateral(
  collateral.input.txHash,
  collateral.input.outputIndex
)
.changeAddress(changeAddress)
.selectUtxosFrom(utxos)
.setNetwork("preprod")
.complete()

const signedTx = await myWallet.signTx(unsignedTx);
const txhash   = await myWallet.submitTx(signedTx);
return txhash;
}

export {quit}