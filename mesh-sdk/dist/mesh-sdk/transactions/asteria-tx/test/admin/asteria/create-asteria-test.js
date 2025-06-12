import { createAsteria } from "../../../admin/asteria/create-asteria.js";
const txHash = await createAsteria();
console.log(txHash);
