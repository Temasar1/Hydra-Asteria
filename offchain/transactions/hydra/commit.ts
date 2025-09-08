import { HydraProvider, HydraInstance } from "@meshsdk/hydra";
import { Asset, MeshTxBuilder, stringToHex } from "@meshsdk/core";
import { blockchainProvider, myWallet, readScripRefJson } from "../../utils";
import { admintoken } from "../../config";

const commit_game_instance = async (player_id: number, hydra_url: string) => {

  const hydra_provider = new HydraProvider({
    url: hydra_url
  });

  const collateral = (await myWallet.getCollateral())[0]!;
  const utxos = await myWallet.getUtxos();

  const asteria_scriptref = await readScripRefJson("asteriaref");
  if (!asteria_scriptref.txHash) {
    throw new Error("deply asteria first");
  }
  const pellet_scriptref = await readScripRefJson("pelletref");
  if (!pellet_scriptref.txHash) {
    throw new Error("deploy pellet first");
  }
  const spacetime_scriptref = await readScripRefJson("spacetimeref");
  if (!spacetime_scriptref.txHash) {
    throw new Error("deploy spacetime first");
  }

  const asteria_reference = await hydra_provider.fetchUTxOs(
    asteria_scriptref.txHash
  );
  const asteria_address = asteria_reference[0].output.address;
  const asteria_address_utxo = await blockchainProvider.fetchAddressUTxOs(
    asteria_address,
    admintoken.policyid + admintoken.name
  );
  const asteria_utxo = asteria_address_utxo[0];

  const pellet_reference = await blockchainProvider.fetchUTxOs(
    pellet_scriptref.txHash
  );
  const pellet_policyid = pellet_reference[0].output.scriptHash;
  const pellet_address = pellet_reference[0].output.address;
  const pellet_address_utxo = await blockchainProvider.fetchAddressUTxOs(
    pellet_address,
    pellet_policyid + stringToHex("FUEL")
  );
  const pellet_utxo = pellet_address_utxo[0];

  const spacetime_reference = await blockchainProvider.fetchUTxOs(
    spacetime_scriptref.txHash
  );
  const spacetime_policyid = spacetime_reference[0].output.scriptHash;
  const spacetime_address = spacetime_reference[0].output.address;
  const spacetime_address_utxo = await blockchainProvider.fetchAddressUTxOs(
    spacetime_address,
    spacetime_policyid + stringToHex(`SHIP${player_id}`)
  );
  const spacetime_utxo = spacetime_address_utxo[0];

  const player_utxos = await myWallet.getUtxos();
  const pilot_token = pellet_policyid + stringToHex(`PILOT${player_id}`);
  const pilot_utxo = player_utxos.find((utxo) =>
    utxo.output.amount.find((asset) => asset.unit === pilot_token)
  );
  if (!pilot_utxo) {
    throw new Error("player does not have pilot token");
  }

  const asteria_asset: Asset[] = [
    {
      unit: "",
      quantity: "",
    },
  ];

  const pellet_asset: Asset[] = [
    {
      unit: pellet_policyid + stringToHex("FUEL"),
      quantity: "",
    },
  ];

  const spacetime_asset: Asset[] = [
    {
      unit: "",
      quantity: "",
    },
  ];

  const pilot_asset: Asset[] = [
    {
      unit: pellet_policyid + stringToHex(`PILOT${player_id}`),
      quantity: "1",
    },
  ];

  const txBuilder = new MeshTxBuilder({
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    evaluator: blockchainProvider,
    verbose: true,
  });

  const unsignedTx = await txBuilder
    .spendingPlutusScriptV3()
    .txIn(asteria_utxo.input.txHash, asteria_utxo.input.outputIndex)
    .txIn(pellet_utxo.input.txHash, pellet_utxo.input.outputIndex)
    .txIn(spacetime_utxo.input.txHash, spacetime_utxo.input.outputIndex)
    .txIn(pilot_utxo.input.txHash, pilot_utxo.input.outputIndex)
    .txOut("hydra_participant_address", pilot_asset)
    .txOut("hydra_participant_address", spacetime_asset)
    .txOut("hydra_participant_address", pellet_asset)
    .txOut("hydra_participant_address", asteria_asset)

    .changeAddress(myWallet.getAddresses().baseAddressBech32!)
    .setNetwork("preprod")
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
    .selectUtxosFrom(utxos)
    .complete();

  await hydra_provider.connect();
  await hydra_provider.init();

  const Hydra_instance = new HydraInstance({
    provider: hydra_provider,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });
  const commit_tx = await Hydra_instance.commitBlueprint();
  const signedTx = await myWallet.signTx(commit_tx);
  const txHash = await myWallet.submitTx(signedTx);
  console.log("txHash", txHash);
  return txHash;
};
