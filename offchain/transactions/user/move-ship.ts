import { 
    Asset, 
    byteString, 
    conStr0, 
    conStr1, 
    deserializeDatum, 
    integer,
    MeshTxBuilder, 
    PlutusScript, 
    posixTime, 
    serializePlutusScript, 
    stringToHex,
    UTxO 
} from "@meshsdk/core";
import { 
    readScripRefJson, 
    tx_earliest_slot, 
    tx_latest_slot 
} from "../../utils.js";
import { fuel_per_step } from "../../config.js";
import { blockchainProvider, maestroprovider, myWallet } from "../../utils.js";
import { fromScriptRef, } from "@meshsdk/core-cst";

const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();

async function moveShip(
    delta_X: number,
    delta_Y: number,
    ship_tx_hash: string
){

const spacetimeDeployScript = await readScripRefJson('spacetimeref');
if(!spacetimeDeployScript.txHash){
    throw Error ("spacetime script-ref not found, deploy spacetime first.");
}; 
const pelletDeployScript = await readScripRefJson('pelletref');
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
const shipUtxo = await blockchainProvider.fetchUTxOs(ship_tx_hash,1);
const ship = shipUtxo[0];
    if (!ship.output.plutusData){
     throw Error ("Ship Datum is Empty");
    };
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

const ttl = Date.now() + 10 * 60 * 1000;
const shipOutputDatum = conStr0([
    integer(Number(shipDatumPosX) + delta_X),
    integer(Number(shipDatumPosY) + delta_Y),
    byteString(shipDatumShipTokenName),
    byteString(shipDatumPilotTokenName),
    posixTime(ttl)
]);

//get distance and fuel for distance
function distance (delta_X: number , delta_Y: number){
    return Math.abs(delta_X) + Math.abs(delta_Y);
};
function required_fuel (distance:number, fuel_per_step:number){
    return distance * fuel_per_step;
};

const movedDistance = distance(delta_X, delta_Y);
const spentFuel =   required_fuel(movedDistance , fuel_per_step);
const fuelTokenName = stringToHex("FUEL");

//defining assets
const assetsToSpacetime: Asset[] = [{
    unit: shipyardPolicyid + shipDatumShipTokenName,
    quantity: "1"
},{
    unit: fuelPolicyid + fuelTokenName,
    quantity: (Number(shipFuel) - spentFuel).toString()  
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
    fetcher: maestroprovider,
    submitter: maestroprovider,
    verbose: true
})
const unsignedTx = await txbuilder
    .spendingPlutusScriptV3()
    .txIn(
        ship.input.txHash,
        ship.input.outputIndex,
    )
    .txInRedeemerValue(moveShipRedeemer,"JSON")
    .spendingTxInReference(spacetimeDeployScript.txHash,0)
    .txInInlineDatumPresent()
    .txOut(spacetimeAddress,assetsToSpacetime)
    .txOutInlineDatumValue(shipOutputDatum,"JSON")

    .mintPlutusScriptV3()
    .mint((-spentFuel).toString(),fuelPolicyid!,fuelTokenName)
    .mintTxInReference(pelletDeployScript.txHash,0)
    .mintRedeemerValue(burnfuelRedeemer,"JSON")

    .txOut(myWallet.getAddresses().baseAddressBech32!,pilotTokenAsset)
    .invalidBefore(tx_earliest_slot)
    .invalidHereafter(tx_latest_slot)
    .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
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