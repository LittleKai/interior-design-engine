import { evalExpr, evalIfExpr } from "./expression.js";
import { resolveToken } from "./color-tokens.js";

const NUMERIC_FIELDS = new Set(["x", "y", "z", "w", "h", "d", "x1", "y1", "x2", "y2", "rx", "sw", "fontSize", "opacity", "radius", "r", "length"]);
const COLOR_FIELDS = new Set(["fill", "stroke"]);
const BOX_TYPES = new Set(["box", "roundedBox", "cylinder"]);

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

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function primitiveBounds(shape) {
  const type = shape?.type || "box";
  if (type === "cylinder") {
    const radius = finiteNumber(shape.radius, finiteNumber(shape.r, 0));
    const diameter = Math.max(0, radius * 2);
    const length = Math.max(0, finiteNumber(shape.length, 0));
    const axis = ["x", "y", "z"].includes(shape.axis) ? shape.axis : "z";
    const x = finiteNumber(shape.x);
    const y = finiteNumber(shape.y);
    const z = finiteNumber(shape.z);
    if (axis === "x") return { ...shape, axis, radius, length, x, y, z, w: length, h: diameter, d: diameter };
    if (axis === "y") return { ...shape, axis, radius, length, x, y, z, w: diameter, h: length, d: diameter };
    return { ...shape, axis, radius, length, x, y, z, w: diameter, h: diameter, d: length };
  }
  return {
    ...shape,
    type,
    x: finiteNumber(shape.x),
    y: finiteNumber(shape.y),
    z: finiteNumber(shape.z),
    w: finiteNumber(shape.w),
    h: finiteNumber(shape.h),
    d: finiteNumber(shape.d)
  };
}

function resolveParams(template, instance) {
  const params = Object.assign({}, defaultsFrom(template.params), instance.params || {});
  const warnings = Array.isArray(instance.warnings) ? instance.warnings : instance._validationWarnings;
  Object.entries(template.params || {}).forEach(([key, def]) => {
    if (typeof params[key] !== "number") return;
    if (Array.isArray(warnings) && Number.isFinite(def.min) && params[key] < def.min) {
      warnings.push(`${template.id || "template"}.${key}=${params[key]} is below suggested min ${def.min}.`);
    }
    if (Array.isArray(warnings) && Number.isFinite(def.max) && params[key] > def.max) {
      warnings.push(`${template.id || "template"}.${key}=${params[key]} is above suggested max ${def.max}.`);
    }
  });
  return params;
}

export function renderTemplate(template, instance = {}, view = "front", palette = "wood-oak") {
  if (!template) return [];
  const params = resolveParams(template, instance);
  const style = Object.assign({}, defaultsFrom(template.style), instance.style || {});
  const ctx = { params, style, palette };
  return (template.boxes || template.isoBoxes || [])
    .map((shape) => resolveShape(shape, ctx))
    .filter((shape) => shape && BOX_TYPES.has(shape.type || "box"));
}

export function projectBoxToView(box, view) {
  const primitive = primitiveBounds(box);
  if (!primitive || primitive.w <= 0 || primitive.h <= 0 || primitive.d <= 0) return null;
  const radius = primitive.type === "roundedBox" && Number.isFinite(primitive.radius) ? primitive.radius : undefined;
  const cylinderKind = primitive.type === "cylinder"
    && ((view === "front" && primitive.axis === "z") || (view === "side" && primitive.axis === "x") || (view === "plan" && primitive.axis === "y"))
    ? "ellipse"
    : undefined;
  const extra = {
    ...(radius !== undefined ? { radius } : {}),
    ...(cylinderKind ? { kind: cylinderKind } : {})
  };
  if (view === "side") {
    return { x: primitive.z, y: primitive.y, w: primitive.d, h: primitive.h, fill: primitive.faces && primitive.faces.left, depthKey: -primitive.x, ...extra };
  }
  if (view === "plan") {
    return { x: primitive.x, y: primitive.z, w: primitive.w, h: primitive.d, fill: primitive.faces && primitive.faces.top, depthKey: primitive.y, ...extra };
  }
  return { x: primitive.x, y: primitive.y, w: primitive.w, h: primitive.h, fill: primitive.faces && primitive.faces.front, depthKey: primitive.z, ...extra };
}
