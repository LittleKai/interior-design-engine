import { getInstance } from "../template-engine/dispatcher.js";
import { getTemplate } from "../template-engine/loader.js";
import { primitiveBounds, renderTemplate } from "../template-engine/interpreter.js";
import { resolveToken, DEFAULT_PALETTE } from "../template-engine/color-tokens.js";

// Translate template-local boxes, authored in the east-facing module frame, into
// world-space boxes. This mirrors itemFootprint() in model.js for multi-run layouts.
export function transformBox(item, box) {
  const primitive = primitiveBounds(box);
  const dir = item._runDirection || "east";
  const lx = primitive.x || 0;
  const ly = primitive.y || 0;
  const lz = primitive.z || 0;
  const w = primitive.w || 0;
  const h = primitive.h || 0;
  const d = primitive.d || 0;
  const meta = {
    ...(primitive.type && primitive.type !== "box" ? { type: primitive.type } : {}),
    ...(primitive.radius !== undefined ? { radius: primitive.radius } : {}),
    ...(primitive.length !== undefined ? { length: primitive.length } : {}),
    ...(primitive.axis !== undefined ? { axis: primitive.axis } : {})
  };
  if (dir === "south") {
    return { x: item.x + lz, y: item.y + ly, z: item.z + lx, w: d, h, d: w, ...meta };
  }
  if (dir === "north") {
    return { x: item.x + lz, y: item.y + ly, z: item.z - lx - w, w: d, h, d: w, ...meta };
  }
  if (dir === "west") {
    return { x: item.x - lx - w, y: item.y + ly, z: item.z + lz, w, h, d, ...meta };
  }
  return { x: item.x + lx, y: item.y + ly, z: item.z + lz, w, h, d, ...meta };
}

export function defaultFaces(palette = DEFAULT_PALETTE) {
  return {
    top: resolveToken(palette, "woodTop"),
    front: resolveToken(palette, "woodFront"),
    right: resolveToken(palette, "woodSide"),
    left: resolveToken(palette, "woodDark"),
    back: resolveToken(palette, "woodBack"),
    bottom: resolveToken(palette, "woodDark")
  };
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function expandHex(hex) {
  const value = String(hex || "").trim();
  const short = value.match(/^#([0-9a-f]{3})$/i);
  if (short) {
    return `#${short[1].split("").map((ch) => ch + ch).join("")}`;
  }
  return /^#[0-9a-f]{6}$/i.test(value) ? value : null;
}

function shadeHex(hex, amount) {
  const value = expandHex(hex);
  if (!value) return hex;
  const mix = amount >= 0 ? 255 : 0;
  const ratio = Math.abs(amount);
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);
  const next = [r, g, b].map((channel) => clampChannel(channel + (mix - channel) * ratio));
  return `#${next.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function colorFaces(color, palette = DEFAULT_PALETTE) {
  if (!color) return defaultFaces(palette);
  return {
    top: shadeHex(color, 0.08),
    front: color,
    right: shadeHex(color, -0.12),
    left: shadeHex(color, -0.18),
    back: shadeHex(color, -0.16),
    bottom: shadeHex(color, -0.22)
  };
}

export function resolveItemBoxes(item, palette = DEFAULT_PALETTE) {
  if (item._isTemplate && item.tpl) {
    const template = getTemplate(item.tpl);
    if (template) {
      return renderTemplate(template, getInstance(item), "3d", palette).map((box) => ({
        ...transformBox(item, box),
        faces: box.faces,
        opacity: box.opacity
      }));
    }
  }
  return [{
    ...transformBox(item, { x: 0, y: 0, z: 0, w: item.width, h: item.height, d: item.depth }),
    faces: item.color ? colorFaces(item.color, palette) : defaultFaces(palette),
    opacity: item.opacity
  }];
}
