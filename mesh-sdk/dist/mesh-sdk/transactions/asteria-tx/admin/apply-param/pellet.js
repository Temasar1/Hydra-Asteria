import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../../onchain/src/plutus.json" with { type: 'json' };
const pelletValidator = plutusBlueprint.validators.find(({ title }) => title === "pellet.pellet.spend");
const PELLET_SCRIPT = pelletValidator.compiledCode;
function applyParamtoPellet(admin_token) {
    const cborScript = applyParamsToScript(PELLET_SCRIPT, [admin_token], "JSON");
    const PlutusScript = {
        code: cborScript,
        version: "V3"
    };
    return { PlutusScript, cborScript };
}
;
export { applyParamtoPellet };
