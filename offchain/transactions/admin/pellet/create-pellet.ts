import {
  conStr0,
  integer,
  MeshTxBuilder,
  PlutusScript,
  scriptHash,
  stringToHex,
  UTxO
} from "@meshsdk/core";
import { blockchainProvider, myWallet } from "../../../utils.js";
import { admintoken } from "../../../config.js";
import { fromScriptRef, resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import { readFile } from "fs/promises";


const changeAddress = await myWallet.getChangeAddress();
const collateral: UTxO = (await myWallet.getCollateral())[0]!;
const utxos = await myWallet.getUtxos();

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

const pelletUtxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
const fuelPolicyID = pelletUtxo[0].output.scriptHash;

const pelletScriptRef = fromScriptRef(pelletUtxo[0].output.scriptRef!);
const pelletPlutusScript = pelletScriptRef as PlutusScript;
const pelletScriptAddress = resolvePlutusScriptAddress(pelletPlutusScript,0);

const spacetimeUtxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
const shipyardPolicyId = spacetimeUtxo[0].output.scriptHash;

// const addressUtxos = await blockchainProvider.fetchAddressUTxOs(changeAddress,admintoken.policyid+admintoken.name);
// const asteriaInput = addressUtxos[0];

export async function createPellet(
  pelletProperty: { posX: number; posY: number; fuel: string }[], totalFuelMint: string,
) {
 
const fueltokenNameHex = stringToHex("FUEL");
const fuelReedemer = conStr0([]);

const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    evaluator: blockchainProvider,
    verbose: true
  });
  //console.log(asteriaInput.output.amount);
  txBuilder
  .mintPlutusScriptV3()
  .mint(totalFuelMint, fuelPolicyID!, fueltokenNameHex)
  .mintTxInReference(pelletDeployScript.txHash, 0)
  .mintRedeemerValue(fuelReedemer, "JSON")

  for (const pellet of pelletProperty) {
    const pelletDatum = conStr0([
      integer(pellet.posX), 
      integer(pellet.posY), 
      scriptHash(shipyardPolicyId!)
    ]);
    
      txBuilder.txOut(pelletScriptAddress, [ 
        {
          unit: fuelPolicyID + fueltokenNameHex,
          quantity: pellet.fuel
        },
        {
          unit: admintoken.policyid + admintoken.name,
          quantity: "1"
        }]
      )
      .txOutInlineDatumValue(pelletDatum, "JSON")
  }
   txBuilder .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .setNetwork("preprod")
    
  const unsignedTx = await txBuilder.complete();
  const signedTx = await myWallet.signTx(unsignedTx);
  const pelletTxhash = await myWallet.submitTx(signedTx);
  return pelletTxhash;
};
