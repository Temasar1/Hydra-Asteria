import { BlockfrostProvider, MeshWallet } from "@meshsdk/core";

export const blockchainProvider = new BlockfrostProvider("preprodYAw21nxr9EdeZNSLDDLOJVg98DOrya75");
export const myWallet = new MeshWallet({
    networkId: 0, // 0: testnet, 1: mainnet
    fetcher: blockchainProvider,
    submitter: blockchainProvider,
    key: {
      type: 'mnemonic',
      words: ["vibrant","north","decade","mean","ensure","turn","universe","cause","neutral","mad","can","next","mutual","tongue","main","bind","lizard","crumble","order","pole","assault","guilt","physical","cup"],
    },
  });