import test from "node:test";
import assert from "node:assert/strict";
import { normalizeModel, itemFootprint } from "../core/model.js";

function footprints(model) {
  const normalized = normalizeModel(structuredClone(model));
  return normalized.runs.flatMap((run) => run.modules.map((item) => ({
    id: item.tpl || item.type || item.id,
    runId: item._runId,
    y: item.y,
    ...itemFootprint(item)
  })));
}

test("south run treats module x as along-axis (+z) and z as perpendicular", () => {
  const model = {
    width: 400, height: 240, depth: 250,
    runs: [{
      id: "return", origin: { x: 0, z: 0 }, direction: "south",
      modules: [
        { type: "corner", x: 0, y: 0, z: 0, width: 100, height: 86, depth: 100 },
        { type: "base", x: 100, y: 0, z: 0, width: 150, height: 86, depth: 60 }
      ]
    }]
  };
  const [corner, base] = footprints(model);
  assert.deepEqual([corner.minZ, corner.maxZ], [0, 100]);
  assert.deepEqual([corner.minX, corner.maxX], [0, 100]);
  assert.deepEqual([base.minZ, base.maxZ], [100, 250]);
  assert.deepEqual([base.minX, base.maxX], [0, 60]);
});

test("north run with origin at far end resolves inside the model", () => {
  const model = {
    width: 400, height: 240, depth: 250,
    runs: [{
      id: "return", origin: { x: 0, z: 250 }, direction: "north",
      modules: [
        { type: "corner", x: 0, y: 0, z: 0, width: 100, height: 86, depth: 100 },
        { type: "base", x: 100, y: 0, z: 0, width: 150, height: 86, depth: 60 }
      ]
    }]
  };
  const [corner, base] = footprints(model);
  assert.deepEqual([corner.minZ, corner.maxZ], [150, 250]);
  assert.deepEqual([base.minZ, base.maxZ], [0, 150]);
  assert.deepEqual([base.minX, base.maxX], [0, 60]);
});

test("east run keeps legacy along-x behavior and auto-offset fallback", () => {
  const explicit = {
    width: 300, height: 240, depth: 60,
    runs: [{
      id: "main", origin: { x: 100, z: 0 }, direction: "east",
      modules: [
        { type: "a", x: 0, y: 0, z: 0, width: 90, height: 86, depth: 60 },
        { type: "b", x: 90, y: 0, z: 0, width: 110, height: 86, depth: 60 }
      ]
    }]
  };
  const [a, b] = footprints(explicit);
  assert.deepEqual([a.minX, a.maxX], [100, 190]);
  assert.deepEqual([b.minX, b.maxX], [190, 300]);

  const autoOffset = {
    width: 200, height: 240, depth: 60,
    runs: [{
      id: "main", origin: { x: 0, z: 0 }, direction: "east",
      modules: [
        { type: "a", y: 0, width: 120, height: 86, depth: 60 },
        { type: "b", y: 0, width: 80, height: 86, depth: 60 }
      ]
    }]
  };
  const [c, d] = footprints(autoOffset);
  assert.deepEqual([c.minX, c.maxX], [0, 120]);
  assert.deepEqual([d.minX, d.maxX], [120, 200]);
});

test("re-normalizing an already normalized model keeps world coordinates", () => {
  const model = {
    width: 400, height: 240, depth: 250,
    runs: [{
      id: "return", origin: { x: 0, z: 0 }, direction: "south",
      modules: [
        { type: "corner", x: 0, y: 0, z: 0, width: 100, height: 86, depth: 100 },
        { type: "base", x: 100, y: 0, z: 0, width: 150, height: 86, depth: 60 }
      ]
    }]
  };
  const once = normalizeModel(structuredClone(model));
  const twice = normalizeModel(structuredClone(once));
  const coords = (m) => m.runs[0].modules.map((item) => [item.x, item.y, item.z]);
  assert.deepEqual(coords(twice), coords(once));
});
