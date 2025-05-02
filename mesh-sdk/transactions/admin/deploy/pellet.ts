import {
    admin_token
} from "../../../const.js";
import { pelletScriptApliedParam } from "../apply-param/pellet.js";
import { blockchainProvider, myWallet } from "../../../utils.js";
import { Asset, MeshTxBuilder } from "@meshsdk/core";
import { deployScriptAppliedParam } from "../apply-param/deploy.js";
import { resolvePlutusScriptAddress} from "@meshsdk/core-csl";
import { writeFile } from "fs/promises";

const utxos = await myWallet.getUtxos();
const changeAddress = await myWallet.getChangeAddress();

const pellet = pelletScriptApliedParam(
    admin_token,
);
const deployScript = deployScriptAppliedParam(
    admin_token
);

const deployScriptAddressBech32 = resolvePlutusScriptAddress(deployScript.deployPlutusScript,0);

const pelletAsset: Asset[] = [
    {
    unit: "lovelace",
    quantity:"7594220"
    }
];

async function deployPellet(){

    const txBuiler = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true
    });
    
    const unsignedTx = await txBuiler
    .txOut(deployScriptAddressBech32,pelletAsset)
    .txOutReferenceScript(pellet.appliedPelletParam,"V3")
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .setNetwork("preprod")
    .complete();
    
    const signedTx = await myWallet.signTx(unsignedTx);
    const deployPelletTx = await myWallet.submitTx(signedTx);

await writeFile(
    "./scriptref-hash/pellet-script.json",
    JSON.stringify({ txHash: deployPelletTx })
    );
};

export {deployPellet};