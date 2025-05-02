import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../onchain/src/plutus.json" with { type: 'json' };
const pelletValidator = plutusBlueprint.validators.find(({ title }) => title === "pellet.pellet.spend");
const PELLET_SCRIPT = pelletValidator.compiledCode;
function pelletScriptApliedParam(admin_token) {
    const appliedPelletParam = applyParamsToScript(PELLET_SCRIPT, [admin_token], "JSON");
    const pelletPlutusScript = {
        code: appliedPelletParam,
        version: "V3"
    };
    return { pelletPlutusScript, appliedPelletParam };
}
;
export { pelletScriptApliedParam };
