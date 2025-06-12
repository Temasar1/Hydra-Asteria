import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../../onchain/src/plutus.json" with { type: 'json' };
const asteriaValidator = plutusBlueprint.validators.find(({ title }) => title === "spacetime.spacetime.spend");
const SPACETIME_SCRIPT = asteriaValidator.compiledCode;
function applyParamtoSpacetime(pelletScriptAddress, asteriaScriptAddress, admin_token, max_speed, max_ship_fuel, fuel_per_step) {
    const cborScript = applyParamsToScript(SPACETIME_SCRIPT, [pelletScriptAddress,
        asteriaScriptAddress,
        admin_token,
        max_speed,
        max_ship_fuel,
        fuel_per_step
    ], "JSON");
    const plutusScript = {
        code: cborScript,
        version: "V3"
    };
    return { plutusScript, cborScript };
}
;
export { applyParamtoSpacetime };
