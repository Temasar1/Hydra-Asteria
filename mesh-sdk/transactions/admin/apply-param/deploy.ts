
import { applyParamsToScript } from "@meshsdk/core-cst";
import plutusBlueprint from "../../../../onchain/src/plutus.json" with {type: 'json'}; 
import { PlutusScript } from "@meshsdk/core";

const asteriaValidator = plutusBlueprint.validators.find(
        ({ title }) => title === "deploy.deploy.spend"
  );

const DEPLOY_SCRIPT = asteriaValidator!.compiledCode;

function deployScriptAppliedParam( admin_token:any){
    const appliedDeployParam   = applyParamsToScript(
      DEPLOY_SCRIPT,
      [admin_token],
      "JSON"
    );

  const deployPlutusScript : PlutusScript = {
    code: appliedDeployParam,
    version: "V3"
  };
return {deployPlutusScript,appliedDeployParam};
};

export {deployScriptAppliedParam};