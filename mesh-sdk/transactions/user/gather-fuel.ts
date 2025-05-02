import { 
    Asset, 
    byteString, 
    conStr0, 
    conStr1, 
    deserializeDatum, 
    integer, 
    MeshTxBuilder, 
    PlutusScript, 
    policyId, 
    serializePlutusScript, 
    stringToHex, 
    UTxO} from "@meshsdk/core";
import { fromScriptRef} from "@meshsdk/core-cst";
import { blockchainProvider, myWallet, slot } from "../../utils.js";
import { admintoken} from "../../config.js";
import { readFile } from "fs/promises";

const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;

const utxos = await myWallet.getUtxos();


async function gatherFuel(
    gather_amount: number,
    ship_tx_hash: string,
    pellet_tx_Hash: string,
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
const spacetimeUtxos   =  await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const spacetimeScriptRef = fromScriptRef(spacetimeUtxos[0].output.scriptRef!);
const spacetimePlutusScript = spacetimeScriptRef as  PlutusScript;
const spacetimeAddress = serializePlutusScript(spacetimePlutusScript).address;
const shipYardPolicyId = spacetimeUtxos[0].output.scriptHash;

const pelletUtxos = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash)
const pelletScriptRef = fromScriptRef(pelletUtxos[0].output.scriptRef!);
const pelletPlutusScript = pelletScriptRef as PlutusScript
const pelletAddress = serializePlutusScript(pelletPlutusScript).address;
const fuelPolicyId = pelletUtxos[0].output.scriptHash;

const shipUtxo  = await blockchainProvider.fetchUTxOs(ship_tx_hash);
const pelletUtxo = await blockchainProvider.fetchUTxOs(pellet_tx_Hash);

const ship = shipUtxo[0];
    if(!ship.output.plutusData){
        throw Error("Ship datum is empty");
    };

const pellet = pelletUtxo[0];
     if (!pellet.output.plutusData){
        throw Error("Pellet Datum is Empty")
    };


//get input Ada value
const shipInputAda = ship.output.amount.find((Asset) =>{
    Asset.unit === "lovelace"
});
const pelletInputAda = pellet.output.amount.find((Asset =>
    Asset.unit === "lovelace"
));

//get shipInput Datum
const shipInputData = ship.output.plutusData;
const shipInputDatum = deserializeDatum(shipInputData).fields;

//get shipDatum Prpperties
const ShipPosX:number = shipInputDatum[0].int;
const shipPoxY: number = shipInputDatum[1].int;
const shipTokenName: string = shipInputDatum[2].bytes;
const pilotTokenName: string= shipInputDatum[3].bytes;
const lastMoveLatestTime: number = shipInputDatum[4].bytes;

//Ship output Datum
const shipOutDatum = conStr0([
    integer(ShipPosX),
    integer(shipPoxY),
    byteString(shipTokenName),
    byteString(pilotTokenName),
    integer(lastMoveLatestTime)
]);

//get pelletInput Datum
const pelletInputData = pellet.output.plutusData;
const pelletInputDatum = deserializeDatum(pelletInputData).fields;

//get pelletDatum properties
const pelletPosX: number = pelletInputDatum[0].int;
const pelletPosY: number = pelletInputDatum[1].int;
const pelletInputShipyardPolicy: string = pelletInputDatum[2].bytes;

//pellet output Datum
const pelletOuputDatum = conStr0([
    integer(pelletPosX),
    integer(pelletPosY),
    policyId(pelletInputShipyardPolicy)
]);


const fueltokenUnit = fuelPolicyId + stringToHex("FUEL");
const shipInputFuelAsset = ship.output.amount.find((asset) => 
    asset.unit === fueltokenUnit);

const pelletInputFuelAsset = pellet.output.amount.find((asset) => 
    asset.unit === fueltokenUnit);

const pelletFuel = pelletInputFuelAsset?.quantity;
const shipFuel = shipInputFuelAsset?.quantity;

const spacetimeOutputAssets : Asset[] = [{
    unit: shipYardPolicyId + shipTokenName,
    quantity: "1"
},
{
    quantity: pelletInputFuelAsset?.quantity!,
    unit: shipFuel! + gather_amount.toString()
},
{
    quantity: shipInputAda?.quantity!,
    unit: shipInputAda?.unit!
}];
const pelletOutputAssets : Asset[] = [{
    quantity: admintoken.policyid + admintoken.name,
    unit: "1"
},
{
    quantity: pelletInputFuelAsset?.quantity!,
    unit: (Number(pelletFuel!) - gather_amount).toString()
},
{
    quantity: pelletInputAda?.quantity!,
    unit:     pelletInputAda?.unit!
}];

const pilottokenAsset: Asset[] = [{
    unit: shipYardPolicyId + pilotTokenName,
    quantity: "1"
}];

const shipRedeemer = conStr1([integer(gather_amount)]);  //note to change redeemer index if error
const pelletRedemer = conStr0([integer(gather_amount)]);

     
const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    verbose: true
});

const unsignedTx = await txBuilder
.invalidBefore(tx_earliest_posix_time)
.spendingPlutusScriptV3()
.txIn(
    ship.input.txHash,
    ship.input.outputIndex,
    ship.output.amount,
    ship.output.address
)
.txInRedeemerValue(shipRedeemer)
.spendingTxInReference(spacetimeDeployScript.txHash,0)
.txInInlineDatumPresent()
.txOut(spacetimeAddress,spacetimeOutputAssets)
.txOutInlineDatumValue(shipOutDatum,"JSON")

.spendingPlutusScriptV3()
.txIn(
    pellet.input.txHash,
    pellet.input.outputIndex,
    pellet.output.amount,
    pellet.output.address
)
.txInRedeemerValue(pelletRedemer,"JSON")
.txInInlineDatumPresent()
.txOut(pelletAddress,pelletOutputAssets)
.txOutInlineDatumValue(pelletOuputDatum,"JSON")

.txOut(myWallet.addresses.baseAddressBech32!, pilottokenAsset) 
.txInCollateral(
    collateral.input.txHash,
    collateral.input.outputIndex,
    collateral.output.amount,
    collateral.output.address
  )
.selectUtxosFrom(utxos)
.changeAddress(changeAddress)
.setNetwork("preprod")
.complete();

const signedTx = await myWallet.signTx(unsignedTx);
const gatherFuelHash = await myWallet.submitTx(signedTx);
return gatherFuelHash;
};
export {gatherFuel};