
import { 
    Asset,
    conStr0,
    integer,
    MeshTxBuilder,
    PlutusScript,
    policyId} from "@meshsdk/core";
import { myWallet ,blockchainProvider} from "../../../utils.js";
import { fromScriptRef, resolvePlutusScriptAddress} from "@meshsdk/core-cst";
import { admintoken } from "../../../utils.js";
import { readFile } from "fs/promises";


const utxos = await myWallet.getUtxos();  //gets utxos from wallet
const changeAddress = await myWallet.getChangeAddress();   //wallet as change address

//read asteria ref json file
const asteria = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteria.asteriaTxHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};

//read spacetime ref json file
const spacetime = JSON.parse(
    await readFile("./scriptref-hash/spacetime-script.json", "utf-8"));
if(!asteria.asteriaTxHash){
    throw Error ("spacetime script-ref not found, deploy asteria first.");
};


const asteriaUtxo = await blockchainProvider.fetchUTxOs(asteria.asteriaTxHash);
const asteriaScriptRef = fromScriptRef(asteriaUtxo[0].output.scriptRef!);      //asteria utxo index
const asteriascriptPlutus = asteriaScriptRef as PlutusScript;     
const asteriaValidatorAddress = resolvePlutusScriptAddress(asteriascriptPlutus,0); //asteria validator address

const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetime.spacetimeTxHash);
const shipyardPolicyId = spacetimeUtxo[0].output.scriptRef;

const asteriaDatum = (
    conStr0([
    integer(0),                    //shipcounter
    policyId(shipyardPolicyId!)   //policyId
    ])
);

const admintokenAsset: Asset[] = [
  {
   unit:  admintoken.policyid + admintoken.name,
   quantity: "1"
  }
];

const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    verbose: true
});

const unsignedTx = await txBuilder
.txOut(asteriaValidatorAddress,admintokenAsset)  
.txOutInlineDatumValue(asteriaDatum,"JSON")
.selectUtxosFrom(utxos)
.changeAddress(changeAddress)
.complete();

const signedTx = await myWallet.signTx(unsignedTx);
const createAsteriaTxHash = await myWallet.submitTx(signedTx);

export { createAsteriaTxHash};