import { readFile } from "fs/promises";
import { blockchainProvider, myWallet } from "../../../utils.js";
import { admintoken } from "../../../config.js";
import { conStr2, MeshTxBuilder } from "@meshsdk/core";


const utxos = await myWallet.getUtxos(); 
const changeAddress = await myWallet.getChangeAddress();  


const consumeAsteria = async (
   asteriaUtxo : {
      txHash: string,
      txIndex: number
   }
) => {
const asteriaDeployScript = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteriaDeployScript.txHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};

//const asteriaScriptRefUtxos = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash)
const asteriaUtxos = await blockchainProvider.fetchUTxOs(asteriaUtxo.txHash,asteriaUtxo.txIndex);
const asteria = asteriaUtxos[0];

const adminTokenUnit = admintoken.policyid + admintoken.name;
const adminUTxOs =  await myWallet.getUtxos()
.then((us) => us.filter((u) => u.output.amount.find((Asset) => 
Asset.unit === adminTokenUnit)));

const adminUtxo = adminUTxOs[0];
const consumeRedeemer = conStr2([]);

const txBuilder = new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
    verbose: true
})

const unsignedTx = await txBuilder
.spendingPlutusScriptV3()
.txIn(
    asteria.input.txHash,
    asteria.input.outputIndex,
    asteria.output.amount,
    asteria.output.address
)
.txInRedeemerValue(consumeRedeemer,"JSON")
.spendingTxInReference(asteriaDeployScript.txHash,0)

.spendingPlutusScriptV3()
.txIn(
    adminUtxo.input.txHash,
    adminUtxo.input.outputIndex,
    adminUtxo.output.amount,
    adminUtxo.output.address
)
.txInRedeemerValue(consumeRedeemer,"JSON")
.spendingTxInReference(asteriaDeployScript.txHash,0)

.selectUtxosFrom(utxos)
.setNetwork("preprod")
.changeAddress(changeAddress)
.complete();

const signedTx = await myWallet.signTx(unsignedTx);
const txHash   = await myWallet.submitTx(signedTx);

return txHash;
};

export { consumeAsteria};