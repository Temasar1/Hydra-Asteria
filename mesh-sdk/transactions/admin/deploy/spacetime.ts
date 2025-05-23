
import {
    admin_token,
    fuel_per_step,
    max_ship_fuel,
    max_speed,
} from "../../../const.js";
import { 
    blockchainProvider, 
    myWallet 
} from "../../../utils.js";
import { 
    Asset,
    conStr0,
    MeshTxBuilder,
    none,
    scriptHash 
} from "@meshsdk/core";
import { applyParamtoDeploy } from "../apply-param/deploy.js";
import { resolvePlutusScriptAddress} from "@meshsdk/core-csl";
import { applyParamtoSpacetime } from "../apply-param/spacetime.js";
import { readFile, writeFile} from "fs/promises";


const utxos = await myWallet.getUtxos();
const changeAddress = await myWallet.getChangeAddress();

const asteriaDeployScript = JSON.parse(
    await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
if(!asteriaDeployScript.txHash){
    throw Error ("asteria script-ref not found, deploy asteria first.");
};
const pelletDeployScript = JSON.parse(
    await readFile("./scriptref-hash/pellet-script.json", "utf-8"));
if(!pelletDeployScript.txHash){
    throw Error ("pellet script-ref not found, deploy pellet first.");
};

const asteriaScriptUtxo = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash,0);
const pelletScriptUtxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash,0);

//parameterize hash instead of address 
const asteriaScriptHash = asteriaScriptUtxo[0].output.scriptHash;
const pelletScriptHash = pelletScriptUtxo[0].output.scriptHash;

const deployScript = applyParamtoDeploy(
    admin_token
);
const deployScriptAddressBech32 = resolvePlutusScriptAddress(deployScript.plutusScript,0);

const spacetimeScript = applyParamtoSpacetime(
    scriptHash(pelletScriptHash!),
    scriptHash(asteriaScriptHash!),
    admin_token,
    max_speed,
    max_ship_fuel,
    fuel_per_step
);

const spacetimeAsset: Asset[] = [
    {
    unit: "lovelace",
    quantity:"35088510"
    }
];
async function deploySpacetime(){

    const txBuiler = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        verbose: true
    });
    
    const unsignedTx = await txBuiler
    .txOut(deployScriptAddressBech32,spacetimeAsset)
    .txOutInlineDatumValue(conStr0([]),"JSON")
    .txOutReferenceScript(spacetimeScript.cborScript,"V3")
    .selectUtxosFrom(utxos)
    .changeAddress(changeAddress)
    .setNetwork("preprod")
    .complete();
    
    const signedTx = await myWallet.signTx(unsignedTx);
    const txHash = await myWallet.submitTx(signedTx);
    
await writeFile(
        "./scriptref-hash/spacetime-script.json",
        JSON.stringify({ txHash: txHash })
    );
};

export {deploySpacetime};