
import { 
    Asset,
    conStr0,
    integer,
    MeshTxBuilder,
    PlutusScript,
    policyId} from "@meshsdk/core";
import { myWallet ,blockchainProvider} from "../../../utils.js";
import { fromScriptRef, resolvePlutusScriptAddress} from "@meshsdk/core-cst";
import { admintoken } from "../../../config.js";
import { readFile } from "fs/promises";


const utxos = await myWallet.getUtxos(); 
const changeAddress = await myWallet.getChangeAddress();  


export async function createAsteria(){

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

const asteriaUtxo = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash);
const asteriaScriptRef = fromScriptRef(asteriaUtxo[0].output.scriptRef!);      
const asteriascriptPlutus = asteriaScriptRef as PlutusScript;     
const asteriaValidatorAddress = resolvePlutusScriptAddress(asteriascriptPlutus,0); 

const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyardPolicyId = spacetimeUtxo[0].output.scriptHash;

const asteriaDatum = conStr0([
    integer(0),                    //shipcounter
    policyId(shipyardPolicyId!)    //policyId
 ]);
 
const admintokenAsset: Asset[] = [{
   unit:  admintoken.policyid + admintoken.name,
   quantity: "1"
  }];

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
const asteriaTxhash = await myWallet.submitTx(signedTx);
return asteriaTxhash;
};

export const createTest = async() => {

    const totalRewardsAsset : Asset[] = [{
        unit: "lovelace",
        quantity:  "2000000",
    },
    {
        unit: admintoken.policyid + admintoken.name,
        quantity: "1"
    }];

    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        verbose: true
    });

    const unsignedTx = await txBuilder
    .txOut(myWallet.addresses.baseAddressBech32!,totalRewardsAsset)  
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .complete();
    
    const signedTx = await myWallet.signTx(unsignedTx);
    const Txhash = await myWallet.submitTx(signedTx);
    return Txhash;

}