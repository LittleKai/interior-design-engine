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
    faces: defaultFaces(palette),
    opacity: item.opacity
  }];
}
