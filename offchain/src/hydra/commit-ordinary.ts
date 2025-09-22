import { HydraInstance, HydraProvider } from "@meshsdk/hydra";
import { blockchainProvider, myWallet } from "../../utils.js";
import { MeshTxBuilder } from "@meshsdk/core";


const commit_ordinary = async (commit_txhash: string, index: number, hydra_url: string) => {

  const hydraProvider = new HydraProvider({
    httpUrl: hydra_url,
  });
  const hydraInstance = new HydraInstance({
    provider: hydraProvider,
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
  });

  const ordinaryUtxos = await blockchainProvider.fetchUTxOs(commit_txhash,index);
  const ordinary = ordinaryUtxos[0];

  const changeAddress = await myWallet.getChangeAddress();
  const collateral = (await myWallet.getCollateral())[0]!;
  const utxos = await myWallet.getUtxos();

  const txbuilder = new MeshTxBuilder({
    submitter: blockchainProvider,
    fetcher: blockchainProvider,
    verbose: true,
  });

const unsignedTx = await txbuilder
.txIn(ordinary.input.txHash, ordinary.input.outputIndex)
.txOut(myWallet.addresses.baseAddressBech32!, [
  {
    unit: 'lovelace',
    quantity: "20000000",
  },
])
.txInCollateral(collateral.input.txHash, collateral.input.outputIndex)
.changeAddress(changeAddress)
.selectUtxosFrom(utxos)
.setNetwork("preprod")
.complete();

  const tx = await hydraInstance.commitBlueprint(commit_txhash, index, {
    cborHex: unsignedTx,
    description: "ordinary commit",
    type: "Tx ConwayEra",
  });
  const signedTx = await myWallet.signTx(tx, true);
  const txhash = await myWallet.submitTx(signedTx);
  return txhash
};

export { commit_ordinary };