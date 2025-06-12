import { conStr0, conStr1, conStr2, deserializeDatum, integer, MeshTxBuilder, policyId, stringToHex } from "@meshsdk/core";
import { fromScriptRef, resolvePlutusScriptAddress } from "@meshsdk/core-cst";
import { admintoken } from "../../config.js";
import { blockchainProvider, myWallet } from "../../utils.js";
import { readFile } from "fs/promises";
const changeAddress = await myWallet.getChangeAddress();
const collateral = (await myWallet.getCollateral())[0];
const utxos = await myWallet.getUtxos();
async function mineAsteria(max_asteria_mining, ship_tx_hash, tx_earliest_posix_time) {
    const spacetimeDeployScript = JSON.parse(await readFile("./scriptref-hash/spacetime-script.json", "utf-8"));
    if (!spacetimeDeployScript.txHash) {
        throw Error("spacetime script-ref not found, deploy spacetime first.");
    }
    ;
    const pelletDeployScript = JSON.parse(await readFile("./scriptref-hash/pellet-script.json", "utf-8"));
    if (!pelletDeployScript.txHash) {
        throw Error("pellet script-ref not found, deploy pellet first.");
    }
    ;
    const asteriaDeployScript = JSON.parse(await readFile("./scriptref-hash/asteria-script.json", "utf-8"));
    if (!asteriaDeployScript.txHash) {
        throw Error("asteria script-ref not found, deploy asteria first.");
    }
    ;
    const spacetime_scriptref_utxo = await blockchainProvider.fetchUTxOs(spacetimeDeployScript.txHash);
    const shipyard_policyId = spacetime_scriptref_utxo[0].output.scriptHash;
    const pellet_scriptref_utxo = await blockchainProvider.fetchUTxOs(pelletDeployScript.txHash);
    const fuel_policyid = pellet_scriptref_utxo[0].output.scriptHash;
    const asteria_scriptref_utxos = await blockchainProvider.fetchUTxOs(asteriaDeployScript.txHash);
    const asteria_script_ref = fromScriptRef(asteria_scriptref_utxos[0].output.scriptRef);
    const asteria_plutus_script = asteria_script_ref;
    const asteria_script_address = resolvePlutusScriptAddress(asteria_plutus_script, 0);
    const ship_utxo = await blockchainProvider.fetchUTxOs(ship_tx_hash, 1);
    const ship = ship_utxo[0];
    if (!ship.output.plutusData) {
        throw Error("ship datum not found");
    }
    ;
    const shipInputFuel = ship.output.amount.find((Asset) => Asset.unit == fuel_policyid + stringToHex("FUEL"));
    const asteria_utxo = await blockchainProvider.fetchAddressUTxOs(asteria_script_address, admintoken.policyid + admintoken.name);
    const asteria = asteria_utxo[0];
    if (!asteria.output.plutusData) {
        throw Error(" Asteria datum not found");
    }
    const rewardAda = asteria.output.amount.find((Asset) => Asset.unit === "lovelace");
    //get input ship datum
    const shipInputData = ship.output.plutusData;
    const shipInputDatum = deserializeDatum(shipInputData).fields;
    //get datum properties
    const ship_datum_posX = shipInputDatum[0].int;
    const ship_datum_posY = shipInputDatum[1].int;
    const ship_datum_shipTokenName = shipInputDatum[2].bytes;
    const ship_datum_pilotTokenName = shipInputDatum[3].bytes;
    const ship_datum_LastMoveLatestTime = shipInputDatum[4].int;
    //get asteria datum 
    const asteriaInputdata = asteria.output.plutusData;
    const asteriaInputDatum = deserializeDatum(asteriaInputdata).fields;
    //get datum properties
    const asteria_datum_shipcounter = asteriaInputDatum[0].int;
    const asteria_datum_shipyard_policy = asteriaInputDatum[1].bytes;
    const asteriaOutputDatum = conStr0([
        integer(asteria_datum_shipcounter),
        policyId(asteria_datum_shipyard_policy)
    ]);
    const shipFuel = shipInputFuel?.quantity;
    const totalReward = rewardAda?.quantity;
    //mined reward is half total reward
    const minedReward = Math.floor(Number(totalReward) * max_asteria_mining) / 100;
    const asteria_address_assets = [{
            unit: admintoken.policyid + admintoken.name,
            quantity: "1"
        }, {
            unit: "lovelace",
            quantity: (Number(totalReward) - minedReward).toString()
        }];
    const pilotAssets = [{
            unit: shipyard_policyId + ship_datum_pilotTokenName,
            quantity: "1"
        }, {
            unit: "lovelace",
            quantity: minedReward.toString()
        }];
    const shipRedemmer = conStr2([]);
    const asteriaRedeemer = conStr1([]);
    const burnShipRedeemer = conStr1([]);
    const burnfuelRedeemer = conStr1([]);
    const txBuilder = new MeshTxBuilder({
        fetcher: blockchainProvider,
        submitter: blockchainProvider,
        evaluator: blockchainProvider,
        verbose: true
    });
    const unsignedTx = await txBuilder
        .spendingPlutusScriptV3()
        .txIn(asteria.input.txHash, asteria.input.outputIndex, asteria.output.amount, asteria.output.address)
        .spendingReferenceTxInRedeemerValue(asteriaRedeemer, 'JSON')
        .spendingTxInReference(asteriaDeployScript.txHash, 0)
        .txInInlineDatumPresent()
        .txOut(asteria_script_address, asteria_address_assets)
        .txOutInlineDatumValue(asteriaOutputDatum, "JSON")
        .spendingPlutusScriptV3()
        .txIn(ship.input.txHash, ship.input.outputIndex, ship.output.amount, ship.output.address)
        .spendingReferenceTxInRedeemerValue(shipRedemmer, "JSON")
        .spendingTxInReference(spacetimeDeployScript.txHash, 0)
        .txInInlineDatumPresent()
        .mintPlutusScriptV3()
        .mint("-1", shipyard_policyId, ship_datum_shipTokenName)
        .mintTxInReference(spacetimeDeployScript.txHash, 0)
        .mintRedeemerValue(burnShipRedeemer, "JSON")
        .mintPlutusScriptV3()
        .mint("-" + shipFuel, fuel_policyid, stringToHex("FUEL"))
        .mintTxInReference(pelletDeployScript.txHash, 0)
        .mintRedeemerValue(burnfuelRedeemer, "JSON")
        .txOut(myWallet.addresses.baseAddressBech32, pilotAssets)
        .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
        .invalidBefore(tx_earliest_posix_time)
        .selectUtxosFrom(utxos)
        .changeAddress(changeAddress)
        .setNetwork("preprod")
        .complete();
    const signedTx = await myWallet.signTx(unsignedTx);
    const txHash = await myWallet.submitTx(signedTx);
    return txHash;
}
export { mineAsteria };
