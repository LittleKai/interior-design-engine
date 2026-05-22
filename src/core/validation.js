import { normalizeModel, allItems } from "./model.js";
import { debugLog } from "./debug.js";
import { DEFAULT_PALETTE, hasPalette } from "../template-engine/color-tokens.js";
import { getTemplate } from "../template-engine/loader.js";

const RUN_DIRECTIONS = new Set(["east", "north", "west", "south"]);
const SOLID_MATERIAL_REFS = new Set([
  "wood-oak",
  "wood-walnut",
  "laminate-white",
  "laminate-black-matte",
  "metal-brushed",
  "metal-black",
  "fabric-linen"
]);
const SOLID_BODY_KINDS = new Set([
  "panel",
  "shelf-fixed",
  "box",
  "panel-side",
  "panel-back",
  "panel-bottom",
  "panel-top"
]);

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function hasPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function addDimensionErrors(errors, item, path) {
  ["width", "height", "depth"].forEach((key) => {
    if (!hasPositiveNumber(item[key])) {
      errors.push(`${path}.${key} must be a finite number greater than 0.`);
    }
  });
}

function validateRunsSource(source, errors) {
  if (!Array.isArray(source.runs)) return;
  source.runs.forEach((run, index) => {
    const path = `runs[${index}]`;
    if (!isObject(run.origin)) {
      errors.push(`${path}.origin must be an object with finite x and z.`);
    } else {
      if (!Number.isFinite(run.origin.x)) errors.push(`${path}.origin.x must be a finite number.`);
      if (!Number.isFinite(run.origin.z)) errors.push(`${path}.origin.z must be a finite number.`);
    }
    if (!RUN_DIRECTIONS.has(run.direction)) {
      errors.push(`${path}.direction must be one of east, north, west, south.`);
    }
    if (!Array.isArray(run.modules) || run.modules.length === 0) {
      errors.push(`${path}.modules must be a non-empty array.`);
    }
  });
}

function addMaterialWarnings(model, warnings) {
  allItems(model).forEach((item) => {
    if (item.kind === "void" && SOLID_MATERIAL_REFS.has(item.materialRef)) {
      warnings.push(`${item.id || item.label || "item"}: kind "void" with solid materialRef "${item.materialRef}".`);
    }
    if (item.materialRef === "glass-smoked" && SOLID_BODY_KINDS.has(item.kind)) {
      warnings.push(`${item.id || item.label || "item"}: glass-smoked used on solid body kind "${item.kind}".`);
    }
  });
}

function addTemplateWarnings(model, warnings) {
  allItems(model).forEach((item) => {
    if (!item._isTemplate || !item.tpl) return;
    const inlineTemplate = model.inlineTemplates && model.inlineTemplates[item.tpl];
    if (!inlineTemplate && !getTemplate(item.tpl)) {
      warnings.push(`${item.id || item.label || "item"}: template "${item.tpl}" could not be resolved; renderer may fall back.`);
    }
  });
}

export function validateModel(input, options = {}) {
  debugLog("validation", "start", { strict: !!options.strict });
  const errors = [];
  const warnings = [];
  const source = isObject(input) ? input : {};
  const normalized = normalizeModel(source);

  if (!isObject(input)) {
    errors.push("model must be a non-array object.");
  }

  ["width", "height", "depth"].forEach((key) => {
    if (!hasPositiveNumber(source[key])) {
      errors.push(`${key} must be a finite number greater than 0.`);
    }
  });

  const hasModules = Array.isArray(source.modules) && source.modules.length > 0;
  const hasRuns = Array.isArray(source.runs) && source.runs.length > 0;
  if (!hasModules && !hasRuns) {
    errors.push("model must include non-empty modules[] or runs[].");
  }

  validateRunsSource(source, errors);
  normalized.runs.forEach((run, runIndex) => {
    run.modules.forEach((item, moduleIndex) => {
      addDimensionErrors(errors, item, `runs[${runIndex}].modules[${moduleIndex}]`);
    });
  });
  (normalized.modules || []).forEach((item, index) => {
    addDimensionErrors(errors, item, `modules[${index}]`);
  });
  (normalized.details || []).forEach((item, index) => {
    addDimensionErrors(errors, item, `details[${index}]`);
  });

  if (source.palette && !hasPalette(source.palette)) {
    warnings.push(`Unknown palette "${source.palette}", using ${DEFAULT_PALETTE}.`);
  }
  addMaterialWarnings(normalized, warnings);
  addTemplateWarnings(normalized, warnings);

  normalized._validationWarnings = Array.from(new Set([...(normalized._validationWarnings || []), ...warnings]));
  const result = {
    valid: errors.length === 0,
    errors,
    warnings: normalized._validationWarnings,
    normalized
  };
  debugLog("validation", "done", { valid: result.valid, errors: errors.length, warnings: result.warnings.length });
  return result;
}
