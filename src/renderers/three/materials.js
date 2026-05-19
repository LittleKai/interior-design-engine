import * as THREE from "three";

const PRESETS = {
  "wood-oak":             { type: "standard", params: { color: 0xA0826D, roughness: 0.7, metalness: 0, transparent: false, opacity: 1 } },
  "wood-walnut":          { type: "standard", params: { color: 0x5C4033, roughness: 0.65, metalness: 0, transparent: false, opacity: 1 } },
  "laminate-white":       { type: "standard", params: { color: 0xF5F5F5, roughness: 0.5, metalness: 0, transparent: false, opacity: 1 } },
  "laminate-black-matte": { type: "standard", params: { color: 0x2C2C2C, roughness: 0.9, metalness: 0, transparent: false, opacity: 1 } },
  "glass-smoked":         { type: "physical", params: { color: 0x222222, transmission: 0.8, thickness: 0.01, ior: 1.5, opacity: 0.85, transparent: true, roughness: 0.05, metalness: 0 } },
  "metal-brushed":        { type: "standard", params: { color: 0xC0C0C0, roughness: 0.2, metalness: 1.0, transparent: false, opacity: 1 } },
  "metal-black":          { type: "standard", params: { color: 0x1A1A1A, roughness: 0.3, metalness: 0.9, transparent: false, opacity: 1 } },
  "fabric-linen":         { type: "physical", params: { color: 0xCBB994, sheen: 1, sheenColor: new THREE.Color(0xFFDDB3), roughness: 0.85, metalness: 0, transparent: false, opacity: 1 } }
};

const SOLID_REFS = new Set([
  "wood-oak",
  "wood-walnut",
  "laminate-white",
  "laminate-black-matte",
  "metal-brushed",
  "metal-black",
  "fabric-linen"
]);

const BODY_KINDS = new Set([
  "panel",
  "shelf-fixed",
  "box",
  "panel-side",
  "panel-back",
  "panel-bottom",
  "panel-top"
]);

const cache = new Map();

function colorKey(value) {
  if (value == null) return "";
  if (typeof value === "number") return value.toString(16);
  return String(value);
}

export function getMaterial(materialRef, overrides) {
  let opts = overrides || {};
  let ref = materialRef && PRESETS[materialRef] ? materialRef : "laminate-white";
  let isVoid = opts.kind === "void";
  if (isVoid && SOLID_REFS.has(ref)) {
    console.warn("[ide:materials] void item with solid materialRef, treating as solid:", ref);
    isVoid = false;
  }
  if (ref === "glass-smoked" && BODY_KINDS.has(opts.kind)) {
    console.warn("[ide:materials] glass materialRef on solid body item, falling back to laminate-white:", opts.kind);
    ref = "laminate-white";
  }
  const isGlass = ref === "glass-smoked";
  const isSolidBody = SOLID_REFS.has(ref) && (BODY_KINDS.has(opts.kind) || opts.kind === undefined || opts.kind === "box");
  if (isSolidBody && opts.opacity != null && opts.opacity < 1) {
    console.warn("[ide:materials] solid body with opacity<1, forcing opaque:", ref, opts.kind, opts.opacity);
    opts = Object.assign({}, opts, { opacity: 1 });
  }
  const opacity = opts.opacity == null ? 1 : opts.opacity;
  const key = `${ref}|${colorKey(opts.color)}|${opacity}|${isVoid ? "v" : ""}`;
  if (cache.has(key)) return cache.get(key);

  const preset = PRESETS[ref];
  const params = Object.assign({}, preset.params);
  if (opts.color) {
    params.color = new THREE.Color(opts.color);
  }
  if (!isGlass && !isVoid) {
    params.opacity = 1;
    params.transparent = false;
  }
  if (opacity < 1) {
    params.opacity = opacity;
    params.transparent = true;
  }
  if (isVoid) {
    params.color = new THREE.Color(0xeae2d4);
    params.opacity = 0.32;
    params.transparent = true;
    params.depthWrite = false;
    params.roughness = 0.95;
    params.metalness = 0;
  }

  const material = preset.type === "physical"
    ? new THREE.MeshPhysicalMaterial(params)
    : new THREE.MeshStandardMaterial(params);
  cache.set(key, material);
  return material;
}

export function listMaterialPresets() {
  return Object.keys(PRESETS);
}

export function releaseMaterials() {
  cache.forEach((mat) => mat.dispose());
  cache.clear();
}
