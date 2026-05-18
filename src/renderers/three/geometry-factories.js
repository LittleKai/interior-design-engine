import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const PANEL_CATALOGS = new Set(["door-shaker", "door-flat", "drawer-front"]);

export function createGeometry(item) {
  const w = Math.max(0.1, item.width);
  const h = Math.max(0.1, item.height);
  const d = Math.max(0.1, item.depth);
  const catalogId = item.catalogId;

  if (catalogId === "rod-hanging") {
    const length = Math.max(w, h, d);
    const radius = Math.max(0.6, Math.min(Math.max(h, d), w) * 0.4);
    const geo = new THREE.CylinderGeometry(radius, radius, length, 32);
    geo.rotateZ(Math.PI / 2);
    return geo;
  }

  if (catalogId === "handle-knob") {
    const radius = Math.max(0.6, Math.min(w, h, d) / 2);
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(radius * 0.85, 0),
      new THREE.Vector2(radius, radius * 0.45),
      new THREE.Vector2(radius * 0.85, radius * 0.85),
      new THREE.Vector2(radius * 0.4, radius),
      new THREE.Vector2(0, radius)
    ];
    return new THREE.LatheGeometry(points, 24);
  }

  if (catalogId === "handle-bar") {
    return new THREE.BoxGeometry(w, h, d);
  }

  if (catalogId === "void-cavity" || item.kind === "void") {
    return new THREE.BoxGeometry(w, h, d);
  }

  if (catalogId === "shelf-fixed") {
    return new THREE.BoxGeometry(w, h, d);
  }

  if (PANEL_CATALOGS.has(catalogId)) {
    const radius = Math.min(0.2, Math.min(w, h, d) / 2 - 0.01);
    return new RoundedBoxGeometry(w, h, d, 2, Math.max(0.02, radius));
  }

  return new THREE.BoxGeometry(w, h, d);
}
