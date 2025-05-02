import {
    admin_token, 
    max_asteria_mining, 
    ship_mint_lovelace_fee 
} from "../../../const.js";
import { asteriaScriptAppliedParam } from "../apply-param/Asteria.js";
import { blockchainProvider, myWallet } from "../../../utils.js";
import { Asset, MeshTxBuilder } from "@meshsdk/core";
import { deployScriptAppliedParam } from "../apply-param/deploy.js";
import { resolvePlutusScriptAddress} from "@meshsdk/core-csl";
import { writeFile } from "fs/promises";

const utxos = await myWallet.getUtxos();
const changeAddress = await myWallet.getChangeAddress();


const asteria = asteriaScriptAppliedParam(
    admin_token,
    ship_mint_lovelace_fee,
    max_asteria_mining
);
const deployScript = deployScriptAppliedParam(
    admin_token
);

const deployScriptAddressBech32 = resolvePlutusScriptAddress(deployScript.deployPlutusScript,0);

const asteriaAsset: Asset[] = [
    {
      unit: "lovelace",
      quantity:"10615530"
    }
];

async function deployAsteria(){

    const txBuiler = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true
    });
    
    const unsignedTx = await txBuiler
    .txOut(deployScriptAddressBech32,asteriaAsset)
    .txOutReferenceScript(asteria.appliedAsteriaParam,"V3")
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .setNetwork("preprod")
    .complete();
    
    const signedTx = await myWallet.signTx(unsignedTx);
    const deployAsteriaTx = await myWallet.submitTx(signedTx);
    
await writeFile(
    "./scriptref-hash/asteria-script.json",
    JSON.stringify({ txHash: deployAsteriaTx })
  );
};

export {deployAsteria};