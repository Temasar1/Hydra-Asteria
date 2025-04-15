
import { applyParamsToScript} from "@meshsdk/core-cst";
import  plutusBlueprint from "../../../../onchain/src/plutus.json" with {type: 'json'};
import { Integer, PlutusScript, ScriptHash} from "@meshsdk/core";

const asteriaValidator = plutusBlueprint.validators.find(
        ({ title }) => title === "spacetime.spacetime.spend"
    );

const SPACETIME_SCRIPT = asteriaValidator!.compiledCode;

function spacetimeScriptAppliedParam (
   pelletScriptAddress:ScriptHash,
   asteriaScriptAddress:ScriptHash,
   admin_token:any,
   max_speed:any,
   fuel_per_step:Integer,
   initial_fuel:Integer,
   min_asteria_distance:Integer
){
    const appliedSpacetimeParam = applyParamsToScript(
        SPACETIME_SCRIPT!,
        [   pelletScriptAddress,
            asteriaScriptAddress,
            admin_token,
            max_speed,
            fuel_per_step,
            initial_fuel,
            min_asteria_distance
        ],
        "JSON"
        );

    const spacetimePlutusScript: PlutusScript = {
        code: appliedSpacetimeParam,
        version: "V3"
    };
    return {spacetimePlutusScript,appliedSpacetimeParam};
};

export {spacetimeScriptAppliedParam};