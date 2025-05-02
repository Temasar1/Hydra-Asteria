import { 
    Asset, 
    byteString, 
    conStr0, 
    conStr1, 
    deserializeDatum, 
    integer,
    MeshTxBuilder, 
    PlutusScript, 
    serializePlutusScript, 
    stringToHex,
    UTxO } from "@meshsdk/core";
import { blockchainProvider, myWallet } from "../../utils.js";
import { fromScriptRef, } from "@meshsdk/core-cst";
import { readFile } from "fs/promises";

const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();


async function moveShip(
    fuel_per_step: number,
    delta_X: number,
    delta_Y: number,
    tx_earliest_posix_time: number,
    tx_latest_posix_time: number,
    ship_tx_hash: string
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

const spacetimeUtxos = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const spacetimeScriptRef = fromScriptRef(spacetimeUtxos[0].output.scriptRef!);
const spacetimePlutusScript = spacetimeScriptRef as PlutusScript;
const spacetimeAddress = serializePlutusScript(spacetimePlutusScript).address;
const shipyardPolicyid = spacetimeUtxos[0].output.scriptHash;

const pellettUtxos = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const fuelPolicyid  = pellettUtxos[0].output.scriptHash;


//fetch ship utxo for create ship
const shipUtxo = await blockchainProvider.fetchUTxOs(ship_tx_hash,0);
const ship = shipUtxo[0];
    if (!ship.output.dataHash){
    throw Error ("Ship Datum is Empty");
    };

const shipInputAda = ship.output.amount.find((Asset) =>
    Asset.unit === "lovalace"
);
const shipInputFuel = ship.output.amount.find((Asset) =>
    Asset.unit == fuelPolicyid + stringToHex("FUEL")
);
const shipFuel = shipInputFuel?.quantity;

//get input ship datum
const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData!).fields;

//get datum properties
const shipDatumPosX: number = shipInputDatum[0].int;
const shipDatumPosY: number = shipInputDatum[1].int;
const shipDatumShipTokenName: string = shipInputDatum[2].bytes;
const shipDatumPilotTokenName:string = shipInputDatum[3].bytes;
const shipDatumLastMoveLatestTime: number = shipInputDatum[4].int;

const shipOutputDatum = conStr0([
    integer(shipDatumPosX),
    integer(shipDatumPosY),
    byteString(shipDatumShipTokenName),
    byteString(shipDatumPilotTokenName),
    integer(shipDatumLastMoveLatestTime)
]);

//get distance and fuel for distance
function distance (delta_X: number , delta_Y: number){
    return Math.abs(delta_X) + Math.abs(delta_Y);
};
function required_fuel (distance:number, fuel_per_step:number){
    return distance * fuel_per_step;
};

const movedDistance = distance(delta_X,delta_Y);
const spentFuel =   required_fuel(movedDistance , fuel_per_step);
const fuelTokenName = stringToHex("FUEL");
//defining assets
const assetsToSpacetime: Asset[] = [{
    unit: shipyardPolicyid + shipDatumShipTokenName,
    quantity: "1"
},
{
    unit: fuelPolicyid + fuelTokenName,
    quantity: (Number(shipFuel) - spentFuel).toString()  
},
{
    unit: shipInputAda?.unit!,
    quantity: shipInputAda?.quantity!
}];
const pilotTokenAsset: Asset [] = [{
    unit: shipyardPolicyid + shipDatumPilotTokenName,
    quantity: "1"
}];

const moveShipRedeemer = conStr0([
    integer(delta_X),
    integer(delta_Y)
]);

const burnfuelRedeemer = conStr1([]);


const txbuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    verbose: true
})

const unsignedTx = await txbuilder
.invalidBefore(tx_earliest_posix_time)
.invalidHereafter(tx_latest_posix_time)
.mintPlutusScriptV3()
.mintTxInReference(pelletDeployScript.txHash,0)
.mint((-spentFuel).toString(),fuelPolicyid!,fuelTokenName)
.mintRedeemerValue(burnfuelRedeemer,"JSON")

.spendingPlutusScriptV3()
.txIn(
    ship.input.txHash,
    ship.input.outputIndex,
    ship.output.amount,
    ship.output.address
)
.txInInlineDatumPresent()
.txInRedeemerValue(moveShipRedeemer,"JSON")
.spendingTxInReference(ship_tx_hash,0)
.txOut(spacetimeAddress,assetsToSpacetime)
.txOutInlineDatumValue(shipOutputDatum,"JSON")

.txOut(myWallet.getAddresses().baseAddressBech32!,pilotTokenAsset)

.txInCollateral(
    collateral.input.txHash,
    collateral.input.outputIndex,
    collateral.output.amount,
    collateral.output.address
  )
.changeAddress(changeAddress)
.selectUtxosFrom(utxos)
.setNetwork("preprod")
.complete();
  
const  signedTx = await myWallet.signTx(unsignedTx, true);
const  moveshipTxhash = await myWallet.submitTx(signedTx);
return moveshipTxhash;
};

export {moveShip};