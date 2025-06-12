import { admin_token } from "../../../const.js";
import { applyParamtoPellet } from "../apply-param/pellet.js";
import { maestroprovider, myWallet } from "../../../utils.js";
import { conStr0, MeshTxBuilder } from "@meshsdk/core";
import { applyParamtoDeploy } from "../apply-param/deploy.js";
import { resolvePlutusScriptAddress } from "@meshsdk/core-csl";
import { writeFile } from "fs/promises";
const utxos = await myWallet.getUtxos();
const changeAddress = await myWallet.getChangeAddress();
const pellet = applyParamtoPellet(admin_token);
const deployScript = applyParamtoDeploy(admin_token);
const deployAddressBech32 = resolvePlutusScriptAddress(deployScript.plutusScript, 0);
const pelletAsset = [
    {
        unit: "lovelace",
        quantity: "20000000"
    }
];
console.log(deployAddressBech32);
async function deployPellet() {
    const txBuiler = new MeshTxBuilder({
        fetcher: maestroprovider,
        submitter: maestroprovider,
        verbose: true
    });
    const unsignedTx = await txBuiler
        .txOut(deployAddressBech32, pelletAsset)
        .txOutInlineDatumValue(conStr0([]), "JSON")
        .txOutReferenceScript(pellet.cborScript, "V3")
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .setNetwork("preprod")
        .complete();
    const signedTx = await myWallet.signTx(unsignedTx, true);
    const txHash = await myWallet.submitTx(signedTx);
    await writeFile("./scriptref-hash/pellet-script.json", JSON.stringify({ txHash: txHash }));
}
;
export { deployPellet };
