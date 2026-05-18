import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { Brush, Evaluator, INTERSECTION, SUBTRACTION } from "three-bvh-csg";
import { getMaterial } from "./materials.js";

const brushCache = new Map();
const evaluator = new Evaluator();
evaluator.attributes = ["position", "normal"];

function numeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function makeBaseBrush(mesh) {
  const brush = new Brush(mesh.geometry.clone(), mesh.material);
  brush.updateMatrixWorld(true);
  return brush;
}

function cachedBrush(key, factory) {
  if (!brushCache.has(key)) {
    const brush = factory();
    brush.updateMatrixWorld(true);
    brushCache.set(key, brush);
  }
  return brushCache.get(key);
}

function roundedPanelGeometry(width, height, depth, radius, corner) {
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const rounded = {
    topLeft: corner === "all" || corner === "topLeft",
    topRight: corner === "all" || corner === "topRight",
    bottomLeft: corner === "all" || corner === "bottomLeft",
    bottomRight: corner === "all" || corner === "bottomRight"
  };
  const shape = new THREE.Shape();
  shape.moveTo(left + (rounded.bottomLeft ? r : 0), bottom);
  shape.lineTo(right - (rounded.bottomRight ? r : 0), bottom);
  if (rounded.bottomRight) shape.quadraticCurveTo(right, bottom, right, bottom + r);
  shape.lineTo(right, top - (rounded.topRight ? r : 0));
  if (rounded.topRight) shape.quadraticCurveTo(right, top, right - r, top);
  shape.lineTo(left + (rounded.topLeft ? r : 0), top);
  if (rounded.topLeft) shape.quadraticCurveTo(left, top, left, top - r);
  shape.lineTo(left, bottom + (rounded.bottomLeft ? r : 0));
  if (rounded.bottomLeft) shape.quadraticCurveTo(left, bottom, left + r, bottom);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function resultMesh(result, baseMesh) {
  const mesh = new THREE.Mesh(result.geometry, baseMesh.material);
  mesh.position.copy(baseMesh.position);
  mesh.rotation.copy(baseMesh.rotation);
  mesh.scale.copy(baseMesh.scale);
  mesh.castShadow = baseMesh.castShadow;
  mesh.receiveShadow = baseMesh.receiveShadow;
  mesh.userData = Object.assign({}, baseMesh.userData);
  return mesh;
}

function subtract(baseMesh, item, hint, cutterFactory) {
  const baseBrush = makeBaseBrush(baseMesh);
  const cutter = cachedBrush(`${item.width}:${item.height}:${item.depth}:${hint}`, cutterFactory);
  const result = evaluator.evaluate(baseBrush, cutter, SUBTRACTION);
  return resultMesh(result, baseMesh);
}

function applyRoundCorner(baseMesh, item, parts, hint) {
  const radius = Math.max(0.1, numeric(parts[2], 0));
  const corner = parts[1];
  if (!["topLeft", "topRight", "bottomLeft", "bottomRight", "all"].includes(corner) || radius <= 0) {
    console.warn("[ide:csg] unknown hint:", hint);
    return [baseMesh];
  }

  const baseBrush = makeBaseBrush(baseMesh);
  const rounded = cachedBrush(`${item.width}:${item.height}:${item.depth}:${hint}`, () => {
    const geometry = corner === "all"
      ? new RoundedBoxGeometry(item.width, item.height, item.depth, Math.max(3, Math.min(12, Math.round(radius / 2))), radius)
      : roundedPanelGeometry(item.width, item.height, item.depth, radius, corner);
    return new Brush(geometry, baseMesh.material);
  });
  const result = evaluator.evaluate(baseBrush, rounded, INTERSECTION);
  return [resultMesh(result, baseMesh)];
}

function applyDrawerCutout(baseMesh, item, parts, hint) {
  const edge = parts[1];
  const size = Math.max(0.1, numeric(parts[2], 0));
  if (!["front", "back", "top", "bottom"].includes(edge) || size <= 0) {
    console.warn("[ide:csg] unknown hint:", hint);
    return [baseMesh];
  }

  const marginX = item.width * 0.12;
  const marginY = item.height * 0.12;
  const cutWidth = Math.max(1, item.width - marginX * 2);
  const cutHeight = Math.max(1, Math.min(item.height - marginY * 2, item.height * 0.42));
  const cutDepth = Math.max(1, Math.min(size, item.depth + 2));

  return [subtract(baseMesh, item, hint, () => {
    const geometry = edge === "top" || edge === "bottom"
      ? new THREE.BoxGeometry(cutWidth, cutDepth, Math.max(1, item.depth * 0.7))
      : new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);
    const brush = new Brush(geometry, baseMesh.material);
    if (edge === "front") brush.position.z += item.depth / 2 - cutDepth / 2;
    if (edge === "back") brush.position.z -= item.depth / 2 - cutDepth / 2;
    if (edge === "top") brush.position.y += item.height / 2 - cutDepth / 2;
    if (edge === "bottom") brush.position.y -= item.height / 2 - cutDepth / 2;
    return brush;
  })];
}

function applyGlassCutout(baseMesh, item, parts, hint) {
  const x = numeric(parts[1], NaN);
  const y = numeric(parts[2], NaN);
  const width = numeric(parts[3], NaN);
  const height = numeric(parts[4], NaN);
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) {
    console.warn("[ide:csg] unknown hint:", hint);
    return [baseMesh];
  }

  const localX = -item.width / 2 + x + width / 2;
  const localY = -item.height / 2 + y + height / 2;
  const cutDepth = Math.max(item.depth + 2, 2);
  const doorMesh = subtract(baseMesh, item, hint, () => {
    const geometry = new THREE.BoxGeometry(width, height, cutDepth);
    const brush = new Brush(geometry, baseMesh.material);
    brush.position.set(localX, localY, 0);
    return brush;
  });

  const glassDepth = Math.max(0.4, Math.min(item.depth * 0.4, 1.2));
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, glassDepth),
    getMaterial("glass-smoked", { opacity: 0.85 })
  );
  glass.position.set(
    baseMesh.position.x + localX,
    baseMesh.position.y + localY,
    baseMesh.position.z
  );
  glass.castShadow = false;
  glass.receiveShadow = baseMesh.receiveShadow;
  glass.userData = Object.assign({}, baseMesh.userData, { materialRef: "glass-smoked" });
  return [doorMesh, glass];
}

export function applyCsgHints(baseMesh, hints, item) {
  if (!Array.isArray(hints) || hints.length === 0) return [baseMesh];

  let meshes = [baseMesh];
  hints.forEach((hint) => {
    if (typeof hint !== "string") {
      console.warn("[ide:csg] unknown hint:", hint);
      return;
    }
    const parts = hint.split(":");
    const current = meshes[0];
    const extraMeshes = meshes.slice(1);
    if (parts[0] === "roundCorner" && parts.length === 3) {
      meshes = applyRoundCorner(current, item, parts, hint).concat(extraMeshes);
    } else if (parts[0] === "drawerCutout" && parts.length === 3) {
      meshes = applyDrawerCutout(current, item, parts, hint).concat(extraMeshes);
    } else if (parts[0] === "glassCutout" && parts.length === 5) {
      meshes = applyGlassCutout(current, item, parts, hint).concat(extraMeshes);
    } else {
      console.warn("[ide:csg] unknown hint:", hint);
    }
  });
  return meshes;
}

export function clearCsgCache() {
  brushCache.forEach((brush) => {
    if (brush.disposeCacheData) brush.disposeCacheData();
    if (brush.geometry) brush.geometry.dispose();
  });
  brushCache.clear();
}
