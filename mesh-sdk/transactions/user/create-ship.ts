import { 
    Asset,
    conStr0,
    deserializeDatum,
    integer,
    MeshTxBuilder,
    PlutusScript, 
    policyId,
    serializePlutusScript, 
    stringToHex, 
    toBytes,
    UTxO
} from "@meshsdk/core";
import { admintoken, blockchainProvider, myWallet, slot } from "../../utils.js";
import { fromScriptRef } from "@meshsdk/core-cst";
import { readFile } from "fs/promises";

const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();

const txInUtxo = utxos.find((utxo) =>
  utxo.output.amount.some(
    (asset) =>
      asset.unit ===
      admintoken.policyid + admintoken.name
  )
);
console.log(txInUtxo);

export default async function createShip(
    ship_mint_lovelace_fee: number,
    initial_fuel: string,
    posX: number,
    posY: number,
    tx_latest_pos_time: number
){

const asteria = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteria.asteriaTxHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};    

const spacetime = JSON.parse(
    await readFile("./scriptref-hash/spacetime-script.json", "utf-8"));
if(!spacetime.asteriaTxHash){
    throw Error ("spacetime script-ref not found, deploy asteria first.");
};

const pellet = JSON.parse(
    await readFile("./scriptref-hash/pellet-script.json", "utf-8"));
if(!pellet.pelletTxHash){
    throw Error ("pellet script-ref not found, deploy pellet first.");
};

const asteriaUtxos = await blockchainProvider.fetchUTxOs(asteria.asteriaTxHash);
const asteriaScriptRef = fromScriptRef(asteriaUtxos[0].output.scriptRef!);
const asteriaPlutusScript = asteriaScriptRef as PlutusScript;
const asteriaScriptAddress  = serializePlutusScript(asteriaPlutusScript);

const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetime.spacetimeTxHash);
const spacetimeScriptRef = fromScriptRef(spacetimeUtxo[0].output.scriptRef!);
const spacetimePlutusScript = spacetimeScriptRef as PlutusScript;
const spacetimeAddress =   serializePlutusScript(spacetimePlutusScript);
const shipyardPolicyid =   spacetimeUtxo[0].output.scriptHash;

const pelletUtxo = await blockchainProvider.fetchUTxOs(pellet.pelletTxHash);
const fuelPolicyId  = pelletUtxo[0].output.scriptRef;

const asteriaAddressUtxo = await blockchainProvider.fetchAddressUTxOs(asteriaScriptAddress.address);


const asteriaUtxo = asteriaUtxos[0];
    if (!asteriaUtxo.output.plutusData){
        throw Error ("Asteria datum is Empty");
    };

console.log(asteria);
const asteriaInputAda = asteriaUtxo.output.amount.find((Asset) => 
      Asset.unit === "lovelace");

//get asteria datum
const asteriaInputData = asteriaUtxo.output.plutusData;
const asteriaInputDatum = deserializeDatum(asteriaInputData!);
console.log(asteriaInputDatum);

//datum properties
    const asteriaInputShipcounter = asteriaInputDatum.fields[0].int;
    const asteriaInputShipYardPolicyId = asteriaInputDatum.fields[1].bytes;

    const asteriaOutputDatum =  conStr0([
        integer(asteriaInputShipcounter + 2),  //add number of ships(ship Counter)
        policyId(asteriaInputShipYardPolicyId)
    ]);
    
    const fuelTokenName = stringToHex("FUEL");
    const shipTokenName = stringToHex("SHIP") + integer(asteriaInputShipcounter); //ship counter from Datum
    const pilotTokenName = stringToHex("PILOT") + integer(asteriaInputShipcounter); //ship counter from Datum
    
    const shipDatum = conStr0([
        integer(posX),
        integer(posY),
        toBytes(shipTokenName),
        toBytes(pilotTokenName),
        integer(tx_latest_pos_time)
    ]);

//assets
    const admintokenAsset: Asset[] = [{
        unit: admintoken.policyid + admintoken.name,
        quantity:"1"
    }];
    const fueltokenAsset: Asset[] = [{
        unit: fuelPolicyId + fuelTokenName,
        quantity: initial_fuel
    }];
    const shiptokenAsset: Asset[] = [{
        quantity: shipyardPolicyid + shipTokenName,
        unit: "1"
    }];
    const asteriaLovelace: Asset[] = [{
        quantity: "lovelace",
        unit: asteriaInputAda?.unit + ship_mint_lovelace_fee.toString()
    }];

//Redeemers
const mintShipRedeemer   = conStr0([]);
const addNewshipRedeemer = conStr0([]);
const mintFuelRedeemer   = conStr0([]);

//TxBuilder 

const txBuilder = new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
    verbose: true
});


//TO DO: Create ship Txbuilder also minting muli assets
//notsure if to always pass datum for each transaction since we are sending to same address...
//...as the Txbuilder is looking too large
const unsignedTx =  await txBuilder
    .invalidHereafter(slot)
    .txIn(asteriaUtxo.input.txHash,asteriaUtxo.input.outputIndex)
    .mintPlutusScriptV3()
    .mint("1",shipyardPolicyid!,shipTokenName)
    // .mint("1",shipyardPolicyid!,pilotTokenName)
    .mintTxInReference(spacetime.spacetimeTxHash,0)
    .mintRedeemerValue(mintShipRedeemer,"JSON")

    .txIn(txInUtxo!.input.txHash, txInUtxo!.input.outputIndex)
    .mintPlutusScriptV3()
    .mint(initial_fuel, fuelPolicyId!, fuelTokenName)
    .mintTxInReference(pellet.pelletTxHash, 0)
    .mintRedeemerValue(mintFuelRedeemer, "JSON")

    .spendingTxInReference(asteriaUtxo.input.txHash,asteriaUtxo.input.outputIndex)
    .spendingReferenceTxInRedeemerValue(addNewshipRedeemer,"JSON")
    .txOut(spacetimeAddress.address,shiptokenAsset)
    .txOutInlineDatumValue(shipDatum,"JSON")
    .txOut(spacetimeAddress.address,fueltokenAsset)
    .txOutInlineDatumValue(shipDatum,"JSON")

    .txOut(asteriaScriptAddress.address,admintokenAsset)
    .txOutInlineDatumValue(asteriaOutputDatum,"JSON")
    .txOut(asteriaScriptAddress.address,asteriaLovelace)
    .txOutInlineDatumValue(asteriaOutputDatum,"JSON")

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

const signedTx = await myWallet.signTx(unsignedTx,true);
const shiptxHash = await myWallet.submitTx(signedTx);
return shiptxHash;
};