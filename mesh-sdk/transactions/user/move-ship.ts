import { byteString, ByteString, conStr0, deserializeDatum, integer, PlutusScript, toBytes } from "@meshsdk/core";
import { blockchainProvider } from "../../utils.js";
import { resolvePlutusScriptAddress } from "@meshsdk/core-cst";

async function moveShip(
    fuel_per_step: number,
    delta_X: number,
    delta_Y: number,
    tx_earliest_posix_time: number,
    tx_latest_posix_time: number,
    ship_tx_hash: string
){
  
//To do: change to read json file
const deployTxhash = " ";
const deployUtxos = await blockchainProvider.fetchUTxOs(deployTxhash);
const spacetimeScriptRef = deployUtxos[2].output.scriptRef;
const spacetimePlutusScript = spacetimeScriptRef as unknown as PlutusScript;
const spacetimeAddress = resolvePlutusScriptAddress(spacetimePlutusScript,0);
const shipyardPolicyid = deployUtxos[2].output.scriptHash;


const pelletScriptRef = deployUtxos[1].output.scriptRef;
const pelletPlutusScript = pelletScriptRef as unknown as PlutusScript;
const fuelPolicyid  = deployUtxos[1].output.scriptHash;

const shipUtxo = await blockchainProvider.fetchUTxOs(ship_tx_hash,0);
const ship = shipUtxo[0];
    if (!ship.output.dataHash){
    throw Error ("Ship Datum is Empty");
    };

const shipInputAda = ship.output.amount.find((Asset) =>
    Asset.unit === "lovalace");

//get ship datum
const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData!);

//datum properties
const shipDatumPosX: number = shipInputDatum.field[0].int;
const shipDatumPosY: number = shipInputDatum.field[1].int;
const shipDatumShipTokenName: string = shipInputDatum.field[2].bytes;
const shipDatumPelleTokenName:string = shipInputDatum.field[3].bytes;
const shipDatumLastMoveLatestTime: string = shipInputDatum.field[4].bytes;

const shipOutputDatum = conStr0([
    integer(shipDatumPosX),
    integer(shipDatumPosY),
    toBytes(shipDatumShipTokenName),
    toBytes(shipDatumPelleTokenName),
    toBytes(shipDatumLastMoveLatestTime)

]);
const distance = (delta_X: number , delta_Y: number) => {
    return Math.abs(delta_X) + Math.abs(delta_Y);
};
const required_fuel = (distance:number, fuel_per_step:number) => {
    return distance * fuel_per_step;
};



const movedDistance = distance(delta_X,delta_Y);
const spentFuel =   required_fuel(movedDistance , fuel_per_step);




}