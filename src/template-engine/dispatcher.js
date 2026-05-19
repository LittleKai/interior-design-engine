import { normalizeModel } from "../core/model.js";
import { loadTemplateCatalog, registerInlineTemplates } from "./loader.js";

export function getInstance(module) {
  const params = Object.assign({}, module || {});
  delete params.style;
  return {
    params: {
      width: module.width,
      height: module.height,
      depth: module.depth,
      ...params
    },
    style: module.style || {}
  };
}

export async function prepareModelForRender(model) {
  const normalized = normalizeModel(model);
  registerInlineTemplates(normalized.inlineTemplates);
  await loadTemplateCatalog();
  return normalized;
}
