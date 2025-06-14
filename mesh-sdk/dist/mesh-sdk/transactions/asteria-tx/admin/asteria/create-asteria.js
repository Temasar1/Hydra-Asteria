import { conStr0, integer, MeshTxBuilder, policyId } from "@meshsdk/core";
import { myWallet, blockchainProvider } from "../../../utils.js";
import { fromScriptRef, resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import { admintoken } from "../../../config.js";
import { readFile } from "fs/promises";
const utxos = await myWallet.getUtxos();
const changeAddress = await myWallet.getChangeAddress();
export async function createAsteria() {
    const asteriaDeployScript = JSON.parse(await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
    if (!asteriaDeployScript.txHash) {
        throw Error("asteria script-ref not found, deploy asteria first.");
    }
    ;
    const spacetimeDeployScript = JSON.parse(await readFile("./scriptref-hash/spacetime-script.json", "utf-8"));
    if (!spacetimeDeployScript.txHash) {
        throw Error("spacetime script-ref not found, deploy spacetime first.");
    }
    ;
    const asteriaUtxo = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash);
    const asteriaScriptRef = fromScriptRef(asteriaUtxo[0].output.scriptRef);
    const asteriascriptPlutus = asteriaScriptRef;
    const asteriaValidatorAddress = resolvePlutusScriptAddress(asteriascriptPlutus, 0);
    const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
    const shipyardPolicyId = spacetimeUtxo[0].output.scriptHash;
    const asteriaDatum = conStr0([
        integer(0), //shipcounter
        policyId(shipyardPolicyId) //policyId
    ]);
    console.log(asteriaDatum);
    const admintokenAsset = [{
            unit: admintoken.policyid + admintoken.name,
            quantity: "1"
        }];
    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        verbose: true
    });
    const unsignedTx = await txBuilder
        .txOut(asteriaValidatorAddress, admintokenAsset)
        .txOutInlineDatumValue(asteriaDatum, "JSON")
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .setNetwork("preview")
        .complete();
    const signedTx = await myWallet.signTx(unsignedTx);
    const asteriaTxhash = await myWallet.submitTx(signedTx);
    return asteriaTxhash;
}
;
export const createSpendingTest = async () => {
    const totalRewardsAsset = [{
            unit: "lovelace",
            quantity: "2000000",
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
        .txOut(myWallet.addresses.baseAddressBech32, totalRewardsAsset)
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .setNetwork("preprod")
        .complete();
    const signedTx = await myWallet.signTx(unsignedTx);
    const Txhash = await myWallet.submitTx(signedTx);
    return Txhash;
};
