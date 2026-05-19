import { evalExpr, evalIfExpr } from "./expression.js";
import { resolveToken } from "./color-tokens.js";

const NUMERIC_FIELDS = new Set(["x", "y", "z", "w", "h", "d", "x1", "y1", "x2", "y2", "rx", "sw", "fontSize", "opacity"]);
const COLOR_FIELDS = new Set(["fill", "stroke"]);

function defaultsFrom(defs) {
  const out = {};
  Object.entries(defs || {}).forEach(([key, def]) => {
    out[key] = def && Object.prototype.hasOwnProperty.call(def, "default") ? def.default : undefined;
  });
  return out;
}

function resolveValue(value, ctx, key) {
  if (typeof value === "string" && value.trim().startsWith("{{")) return evalExpr(value, ctx);
  if (typeof value === "string" && value.startsWith("$")) return resolveToken(ctx.palette, value.slice(1)) || value;
  if (NUMERIC_FIELDS.has(key) && typeof value === "string") return evalExpr(value, ctx);
  return value;
}

function resolveShape(shape, ctx) {
  if (shape.if && !evalIfExpr(shape.if, ctx)) return null;
  const out = {};
  Object.entries(shape).forEach(([key, value]) => {
    if (key === "if") return;
    if (key === "faces" && value && typeof value === "object") {
      out.faces = {};
      Object.entries(value).forEach(([face, color]) => {
        out.faces[face] = resolveValue(color, ctx, face);
      });
      return;
    }
    if (COLOR_FIELDS.has(key) || NUMERIC_FIELDS.has(key) || typeof value === "string") {
      out[key] = resolveValue(value, ctx, key);
    } else {
      out[key] = value;
    }
  });
  return out;
}

function resolveParams(template, instance) {
  const params = Object.assign({}, defaultsFrom(template.params), instance.params || {});
  Object.entries(template.params || {}).forEach(([key, def]) => {
    if (typeof params[key] !== "number") return;
    if (Number.isFinite(def.min) && params[key] < def.min) params[key] = def.min;
    if (Number.isFinite(def.max) && params[key] > def.max) params[key] = def.max;
  });
  return params;
}

export function renderTemplate(template, instance = {}, view = "front", palette = "wood-oak") {
  if (!template) return [];
  const params = resolveParams(template, instance);
  const style = Object.assign({}, defaultsFrom(template.style), instance.style || {});
  const ctx = { params, style, palette };
  const key = view === "3d" ? "isoBoxes" : `${view}Svg`;
  return (template[key] || []).map((shape) => resolveShape(shape, ctx)).filter(Boolean);
}
