import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../../onchain/src/plutus.json" with { type: 'json' };
const asteriaValidator = plutusBlueprint.validators.find(({ title }) => title === "asteria.asteria.spend");
const ASTERIA_SCRIPT = asteriaValidator.compiledCode;
function applyParamtoAsteria(pelletScriptAddress, admin_token, ship_mint_lovelace_fee, max_asteria_mining, min_asteria_distance, initial_fuel) {
    const cborScript = applyParamsToScript(ASTERIA_SCRIPT, [
        pelletScriptAddress,
        admin_token,
        ship_mint_lovelace_fee,
        max_asteria_mining,
        min_asteria_distance,
        initial_fuel
    ], "JSON");
    const PlutusScript = {
        code: cborScript,
        version: "V3"
    };
    return { PlutusScript, cborScript };
}
;
export { applyParamtoAsteria };
