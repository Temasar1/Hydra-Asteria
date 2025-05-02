import { 
    Asset,
    byteString,
    conStr0,
    deserializeDatum,
    integer,
    MeshTxBuilder,
    PlutusScript, 
    policyId,
    serializePlutusScript, 
    stringToHex, 
    UTxO,
} from "@meshsdk/core";
import { admintoken } from "../../config.js";
import { blockchainProvider, myWallet} from "../../utils.js";
import { fromScriptRef} from "@meshsdk/core-cst";
import { maestroprovider } from "../../utils.js";
import { readFile } from "fs/promises";

const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();
//const utxos = await blockchainProvider.fetchUTxOs("420d1b6ddff2ce1188a3d9c37459fa6325d0f1aea6dcc9b3ec1a4de9a017e59e",0);

async function createShip(
    ship_mint_lovelace_fee: number,
    initial_fuel: string,
    posX: number,
    posY: number,
    tx_latest_posix_time: number
){

const asteriaDeployScript = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteriaDeployScript.txHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};
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


const asteriaScriptRefUtxos = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash);
const asteriaScriptRef = fromScriptRef(asteriaScriptRefUtxos[0].output.scriptRef!);
const asteriaPlutusScript = asteriaScriptRef as PlutusScript;
const asteriaScriptAddress  = serializePlutusScript(asteriaPlutusScript).address;

const spacetimeScriptRefUtxos = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyardPolicyid =   spacetimeScriptRefUtxos[0].output.scriptHash;
const spacetimeScriptRef = fromScriptRef(spacetimeScriptRefUtxos[0].output.scriptRef!);
const spacetimePlutusScript = spacetimeScriptRef as PlutusScript;
const spacetimeAddress =   serializePlutusScript(spacetimePlutusScript).address;

const pelletScriptRefUtxos = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const fuelPolicyId  = pelletScriptRefUtxos[0].output.scriptHash;

console.log(" spacetimeAddress: ", spacetimeAddress);
console.log("fuel policyId : ", fuelPolicyId);
console.log("asteria Script Address : ", asteriaScriptAddress);
console.log("fuel policyId : ", fuelPolicyId);

const asteriaInputUtxos = await blockchainProvider.fetchAddressUTxOs(asteriaScriptAddress,admintoken.policyid+admintoken.name);
const asteriaInputAda = asteriaInputUtxos[0].output.amount.find((Asset) => 
    Asset.unit === "lovelace"
);

const asteria = asteriaInputUtxos[0];
const asteriaInputData = asteria.output.plutusData;
const asteriaInputDatum = deserializeDatum(asteriaInputData!).fields;

//datum properties
const asteriaInputShipcounter = asteriaInputDatum[0].int;
const asteriaInputShipYardPolicyId = asteriaInputDatum[1].bytes;

const asteriaOutputDatum =  conStr0([
    integer(Number(asteriaInputShipcounter) + 1),  //add number of ships(ship Counter)
    policyId(asteriaInputShipYardPolicyId)
]);

const fuelTokenName = stringToHex("FUEL");
const shipTokenName = stringToHex("SHIP" + asteriaInputShipcounter.toString()); //ship counter from Datum
const pilotTokenName = stringToHex("PILOT" + asteriaInputShipcounter.toString()); //ship counter from Datum

const shipDatum = conStr0([
    integer(posX),
    integer(posY),
    byteString(shipTokenName),
    byteString(pilotTokenName),
    integer(tx_latest_posix_time)
]);
//defining assets
const assetToSpacetimeAddress: Asset[] = [{
    unit: shipyardPolicyid! + shipTokenName,
    quantity: "1"
},
{
    unit: fuelPolicyId! + fuelTokenName,
    quantity: initial_fuel
}];
const totalRewardsAsset : Asset[] = [{
    unit: admintoken.policyid + admintoken.name,
    quantity: "1"
},
{
    unit: "lovelace",
    quantity:  (Number(asteriaInputAda?.quantity) + ship_mint_lovelace_fee).toString(),
}];
const pilotTokenAsset: Asset [] = [{
    unit: shipyardPolicyid + pilotTokenName,
    quantity: "1"
}];

const mintShipRedeemer   = conStr0([]);
const addNewshipRedeemer = conStr0([]);
const mintFuelRedeemer   = conStr0([]);

const txBuilder = new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
    evaluator: maestroprovider,
    verbose: true
});

const unsignedTx =  await txBuilder
    .invalidHereafter(tx_latest_posix_time)
    .mintPlutusScriptV3()
    .mint("1",shipyardPolicyid!,shipTokenName)
    .mintRedeemerValue(mintShipRedeemer,"JSON")
    .mintTxInReference(spacetimeDeployScript.txHash,0)
    .mintPlutusScriptV3()
    .mint("1",shipyardPolicyid!,pilotTokenName)
    .mintRedeemerValue(mintShipRedeemer,"JSON")
    .mintTxInReference(spacetimeDeployScript.txHash,0)
    .mintPlutusScriptV3()
    .mint(initial_fuel, fuelPolicyId!, fuelTokenName)
    .mintRedeemerValue(mintFuelRedeemer, "JSON")
    .mintTxInReference(pelletDeployScript.txHash, 0)
    
    .txOut(spacetimeAddress,assetToSpacetimeAddress)
    .txOutInlineDatumValue(shipDatum,"JSON")

    .spendingPlutusScriptV3()
    .txIn(
        asteria.input.txHash,
        asteria.input.outputIndex,
        asteria.output.amount,
        asteria.output.address
    )
    .txInInlineDatumPresent()
    .txInRedeemerValue(addNewshipRedeemer,"JSON")
    .spendingTxInReference(asteriaDeployScript.txHash,0)
    .txOut(asteriaScriptAddress,totalRewardsAsset)
    .txOutInlineDatumValue(asteriaOutputDatum,"JSON")
    

    .txOut(myWallet.addresses.baseAddressBech32!,pilotTokenAsset)
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
const shiptxHash = await myWallet.submitTx(signedTx);
return shiptxHash;
};
export {createShip};