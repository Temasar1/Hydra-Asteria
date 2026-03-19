package main

import (
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/Salvionied/apollo"
	"github.com/Salvionied/apollo/constants"
	"github.com/Salvionied/apollo/serialization/Address"
	"github.com/Salvionied/apollo/serialization/UTxO"
	"github.com/Salvionied/apollo/txBuilding/Backend/BlockFrostChainContext"
	"github.com/fxamacker/cbor/v2"
	"github.com/joho/godotenv"
)

func config1() {
	bfc, err := BlockFrostChainContext.NewBlockfrostChainContext(constants.BLOCKFROST_BASE_URL_PREVIEW, int(constants.PREVIEW), "blockfrost_api_key")
    if err != nil {
        panic(err)
    }

    cc := apollo.NewEmptyBackend()
    err = godotenv.Load()
    if err != nil {
       log.Fatal("Error loading .Env file")
    }
    SEED := os.Getenv("SEED_PHRASE")
    apollob := apollo.New(&cc)
    apollob, err = apollob.SetWalletFromMnemonic(SEED, constants.PREVIEW)
    if err != nil {
        panic(err)
    }
    apollob, err = apollob.SetWalletAsChangeAddress()
    if err != nil {
        panic(err)
    }
    utxos, err := bfc.Utxos(*apollob.GetWallet().GetAddress())
    if err != nil {
        panic(err)
    }
    apollob, err = apollob.AddLoadedUTxOs(utxos...).PayToAddressBech32("your address here", 1_000_000).
        Complete()
    if err != nil {
        panic(err)
    }
    apollob = apollob.Sign()
    tx := apollob.GetTx()
    cborred, err := cbor.Marshal(tx)
    if err != nil {
        panic(err)
    }
    fmt.Println(hex.EncodeToString(cborred))
    tx_id, err := bfc.SubmitTx(*tx)
    if err != nil {
		panic(err)
	}
    fmt.Println(hex.EncodeToString(tx_id.Payload))
}

func config() ([]UTxO.UTxO, Address.Address , *apollo.Apollo, BlockFrostChainContext.BlockFrostChainContext) {
	bfc, err := BlockFrostChainContext.NewBlockfrostChainContext(constants.BLOCKFROST_BASE_URL_PREVIEW, int(constants.PREVIEW), "blockfrost_api_key")
    if err != nil {
        panic(err)
    }

    cc := apollo.NewEmptyBackend()
    err = godotenv.Load()
    if err != nil {
       log.Fatal("Error loading .Env file")
    }
    SEED := os.Getenv("SEED_PHRASE")
    apollob := apollo.New(&cc)
    apollob, err = apollob.SetWalletFromMnemonic(SEED, constants.PREVIEW)
    if err != nil {
        panic(err)
    }
	apollob, err = apollob.SetWalletAsChangeAddress()
    if err != nil {
        panic(err)
    }
    utxos, err := bfc.Utxos(*apollob.GetWallet().GetAddress())
    if err != nil {
        panic(err)
    }
	changeAddress := *apollob.GetWallet().GetAddress()
	collateral := apollob.AddCollateral(utxos[4])

	return utxos, changeAddress, collateral, bfc
}
