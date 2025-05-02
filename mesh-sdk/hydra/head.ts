import { HydraProvider,HydraInstance } from "@meshsdk/hydra";
import { Asset, MeshTxBuilder, MeshWallet } from "@meshsdk/core";
import { blockchainProvider, myWallet } from "./utils.js";


export class HydraCustomInstance  {
private provider : HydraProvider;

    constructor (url: string){
    const hydraProvider = new HydraProvider({url});
    this.provider = hydraProvider;
};

commitTx = async(amount: number) => {
await this.provider.connect();
await this.provider.init();
    
const InstanceParam = {
    provider: this.provider,
    fetcher: this.provider,
    submitter: this.provider
};
const instance = new HydraInstance(InstanceParam);

const ADA = amount * 1000000;
const assetLovelace: Asset[] = [{
    unit: "lovelace",
    quantity: ADA.toString()
}]
const utxos = await blockchainProvider.fetchAddressUTxOs("","lovelace")

//TO DO: get an amount utxo without making a Tx
const txHex = new MeshTxBuilder({
    submitter : blockchainProvider,
    fetcher: blockchainProvider,
    verbose: true
})

const unsignedTx = await txHex
.txOut("",assetLovelace)
.selectUtxosFrom(utxos)
.changeAddress("")
.setNetwork("preprod")
.complete()

const signedTx = await myWallet.signTx(unsignedTx)
const txHash  = await myWallet.submitTx(signedTx)

const txhash = await instance.commitFunds(txHash,0);
return txhash;
};
    
headTx = async (amount: string) => {
await this.provider.newTx(
    " ",
    "Tx ConwayEra",
    " ",
    " "
);
const participantWallet = {
    addr: " ",
    key: " "
};

const wallet = new MeshWallet({
    networkId: 0,
    key:{
        type: "cli",
        payment: participantWallet.key
    },
    fetcher: this.provider,
    submitter: this.provider
});

const txoutAsset: Asset[] = [{
    unit: "lovelace",
    quantity: `${amount}`
}] 

const pp = await this.provider.fetchProtocolParameters();
const utxos = await wallet.getUtxos("enterprise");
const changeAddress = participantWallet.addr;

const txBuilder = new MeshTxBuilder({
    fetcher: this.provider,
    params: pp,
    verbose: true,
    isHydra: true
});

const unsignedTx = await txBuilder 
.txOut(" ", txoutAsset)
.changeAddress(changeAddress)
.selectUtxosFrom(utxos)
.complete()

const signedTx = await wallet.signTx(unsignedTx);
const txhash = await wallet.submitTx(signedTx);
return txhash;
};
    
decommitTx = async() => {
this.provider.decommit(
    " ", 
    "Tx ConwayEra",
    " "
)
};
closeHead = async() => {
    await this.provider.close();
};
    
finalizeHead = async() => {
    await this.provider.fanout()
};
}
