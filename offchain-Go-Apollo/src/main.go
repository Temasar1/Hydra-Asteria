package main

import (
	"encoding/hex"
	"fmt"
	"log"
	"os"

	"github.com/Salvionied/apollo"
	"github.com/Salvionied/apollo/constants"
	"github.com/Salvionied/apollo/serialization"
	"github.com/Salvionied/apollo/txBuilding/Backend/BlockFrostChainContext"
	"github.com/fxamacker/cbor/v2"
	"github.com/joho/godotenv"
)

func main() {
 
}

func CreateShip(position_x int, position_y string) string {
    
    utxos, changeAddress, collateral, blockchainProvider := config()

    asteriaScriptRefUtxos, err := blockchainProvider.GetUtxoFromRef("",0)
    if err != nil {
        log.Fatal("Error fetching asteria script utxo")
    }
    asteriaScriptRef := asteriaScriptRefUtxos.Output.GetScriptRef()
    if asteriaScriptRef == nil {
        log.Fatal("could not found asteria script ref in utxo ")
    }
    //asteriaPlutusScript := asteriaScriptRef
    
    shipyardScriptRefUtxos, err := blockchainProvider.GetUtxoFromRef("",0)
    if err != nil {
        log.Fatal("Error fetching asteria script utxo")
    }
    shipyardScriptRef := shipyardScriptRefUtxos.Output.GetScriptRef()
    if shipyardScriptRef == nil {
        log.Fatal("could not found asteria script ref in utxo ")
    }
    pelletScriptUtxos, err := blockchainProvider.GetUtxoFromRef("", 0)
    pelletScriptRef := pelletScriptUtxos.Output.GetScriptRef()
    if pelletScriptRef == nil {
        log.Fatal("could not found asteria script ref in utxo ")
    }
    
    fuelPolicyId := serialization.ScriptHash(*pelletScriptRef)
    fmt.Println(fuelPolicyId.Bytes())

    asteriaInputUtxos, err = blockchainProvider.AddressUtxos("asteriascriptaddresshere", true)
    if err != nil {
      log.Fatal("Error getting asteria script address")
    }
    asteriaIndex := asteriaScriptRefUtxos.Input.Index
    asteriaTxHash := string(asteriaScriptRefUtxos.Input.TransactionId)

    asteriaInput, err:= blockchainProvider.GetUtxoFromRef(asteriaTxHash,asteriaIndex)
    if err != nil {
        log.Fatal("could not get asteria input utxos")
    }

    asteriaDatum := asteriaInput.Output.GetDatum()


    var txHash string = " "
	return txHash
}
