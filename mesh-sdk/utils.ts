import { MeshWallet, BlockfrostProvider, MaestroProvider, MaestroSupportedNetworks } from "@meshsdk/core";

//get blockfrost provider api key
export const blockchainProvider = new BlockfrostProvider('preprodYAw21nxr9EdeZNSLDDLOJVg98DOrya75');
export const myWallet = new MeshWallet({
  networkId: 0, // 0: testnet, 1: mainnet
  fetcher: blockchainProvider,
  submitter: blockchainProvider,
  key: {
    type: 'mnemonic',
    words: ["vibrant","north","decade","mean","ensure","turn","universe","cause","neutral","mad","can","next","mutual","tongue","main","bind","lizard","crumble","order","pole","assault","guilt","physical","cup"],
  },
});

export const maestroprovider = new MaestroProvider({
  network: "Preprod",
  apiKey: "HOMTwVrArW5p3LEsv69qJ32gJ9q6xP4u",
  turboSubmit:false
});

export const blockData = await blockchainProvider.fetchLatestBlock();
export const latestSlot = blockData.slot;
export const tx_latest_posix_time = Number(latestSlot) + 600;
export const slot = Number(latestSlot);
