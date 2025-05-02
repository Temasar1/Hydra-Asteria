import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../onchain/src/plutus.json" with { type: 'json' };
const asteriaValidator = plutusBlueprint.validators.find(({ title }) => title === "spacetime.spacetime.spend");
const SPACETIME_SCRIPT = asteriaValidator.compiledCode;
function spacetimeScriptAppliedParam(pelletScriptAddress, asteriaScriptAddress, admin_token, max_speed, fuel_per_step, initial_fuel, min_asteria_distance) {
    const appliedSpacetimeParam = applyParamsToScript(SPACETIME_SCRIPT, [pelletScriptAddress,
        asteriaScriptAddress,
        admin_token,
        max_speed,
        fuel_per_step,
        initial_fuel,
        min_asteria_distance
    ], "JSON");
    const spacetimePlutusScript = {
        code: appliedSpacetimeParam,
        version: "V3"
    };
    return { spacetimePlutusScript, appliedSpacetimeParam };
}
;
export { spacetimeScriptAppliedParam };
