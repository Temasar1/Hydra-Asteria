import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../../onchain/src/plutus.json" with { type: 'json' };
const asteriaValidator = plutusBlueprint.validators.find(({ title }) => title === "deploy.deploy.spend");
const DEPLOY_SCRIPT = asteriaValidator.compiledCode;
function applyParamtoDeploy(admin_token) {
    const cborScript = applyParamsToScript(DEPLOY_SCRIPT, [admin_token], "JSON");
    const plutusScript = {
        code: cborScript,
        version: "V3"
    };
    return { cborScript, plutusScript };
}
;
export { applyParamtoDeploy };
