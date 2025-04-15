import { 
    Asset, 
    conStr0, 
    conStr1, 
    deserializeDatum, 
    integer, 
    MeshTxBuilder, 
    PlutusScript, 
    policyId, 
    stringToHex, 
    toBytes} from "@meshsdk/core";
import { resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import { admintoken, blockchainProvider } from "../../utils.js";


async function gatherFuel(
    gather_amount: number,
    ship_tx_hash: string,
    pellet_tx_Hash: string,
    tx_earliest_posix_time: number
){

//To DO: change to read json file
const deployTxhash = " ";
     const deployUtxo =  await blockchainProvider.fetchUTxOs(deployTxhash);

     const spacetimeScriptRef = deployUtxo[2].output.scriptRef;
     const spacetimePlutusScript = spacetimeScriptRef as unknown as PlutusScript
     const spacetimeAddress = resolvePlutusScriptAddress(spacetimePlutusScript,0);
     const shipYardPolicyId = deployUtxo[2].output.scriptHash;

    const  pelletScriptRef = deployUtxo[1].output.scriptRef;
     const pelletPlutusScript = pelletScriptRef as unknown as PlutusScript
     const pelletAddress = resolvePlutusScriptAddress( pelletPlutusScript,0);
     const fuelPolicyId = deployUtxo[1].output.scriptHash;


const pelletTxInput = await blockchainProvider.fetchUTxOs(pellet_tx_Hash);
const pellet = pelletTxInput[0];
     if (!pellet.output.plutusData){
        throw Error("Pellet Datum is Empty")
     };
const shipUtxo = await blockchainProvider.fetchUTxOs(ship_tx_hash,0);

const ship = shipUtxo[0];
    if(!ship.output.plutusData){
        throw Error("Ship datum is empty");
    };

//get input Ada value
const shipInputAda = ship.output.amount;
const pelletInputAda = pellet.output.amount;

//get shipInput Datum
const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData);

//get shipDatum Prpperties
const ShipPosX:number = shipInputDatum.field[0].int;
const shipPoxY: number = shipInputDatum.field[1].int;
const shipTokenName: string = shipInputDatum.field[2].bytes;
const pilotTokenName: string= shipInputDatum.field[3].bytes;
const lastMoveLatestTime: number = shipInputDatum.field[4].bytes;

//Ship output Datum
const shipOutDatum = conStr0([
    integer(ShipPosX),
    integer(shipPoxY),
    toBytes(shipTokenName),
    toBytes(pilotTokenName),
    integer(lastMoveLatestTime)
]);

//TO DO: other ways to get datum
//get pelletInput Datum
const pelletInputData = pellet.output.plutusData;
const pelletInputDatum = deserializeDatum(pelletInputData);

//get pelletDatum properties
const pelletPosX: number = pelletInputDatum.field[0].int;
const pelletPosY: number = pelletInputDatum.field[1].int;
const pelletInputShipyardPolicy: string = pelletInputDatum.field[2].bytes;

//pellet output Datum
const pelletOuputDatum = conStr0([
        integer(pelletPosX),
        integer(pelletPosY),
        policyId(pelletInputDatum)
    ]);

const shiptokenAsset: Asset[] = [{
        unit: shipYardPolicyId + pilotTokenName,
        quantity: "1"
    }];
const pilottokenAsset: Asset[] = [{
        unit: shipYardPolicyId + pilotTokenName,
        quantity: "1"
    }];
const admintokenAsset: Asset[] = [{
        quantity: admintoken.policyid + admintoken.name,
        unit: "1"
    }];

const fueltokenUnit = fuelPolicyId + stringToHex("FUEL");

const shipInputAsset = ship.output.amount.find((asset) => 
        asset.unit === fueltokenUnit);
    const shipFuel = shipInputAsset?.quantity;

const pelletInputAsset = pellet.output.amount.find((asset) => 
        asset.unit === fueltokenUnit);
    const pelletFuel = pelletInputAsset?.quantity;

const shipRedeemer = conStr1([gather_amount]); //note
const pelletRedemer = conStr0([gather_amount]);

//Mesh Txbuiler
     
const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true
    });


//TO DO: gether fuel Tx builder
const unsignedTx = await txBuilder


};