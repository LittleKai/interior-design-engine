import test from "node:test";
import assert from "node:assert/strict";
import { validateModel } from "../core/validation.js";

test("valid legacy modules model passes and returns normalized runs", () => {
  const result = validateModel({
    width: 100,
    height: 200,
    depth: 60,
    modules: [{ id: "wardrobe", width: 100, height: 200, depth: 60 }]
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.normalized.runs.length, 1);
  assert.equal(result.normalized.runs[0].id, "default");
  assert.equal(result.normalized.modules.length, 1);
});

test("valid runs model passes", () => {
  const result = validateModel({
    width: 220,
    height: 240,
    depth: 180,
    runs: [
      {
        id: "main",
        origin: { x: 0, z: 0 },
        direction: "east",
        modules: [{ width: 120, height: 90, depth: 60 }]
      },
      {
        id: "return",
        origin: { x: 120, z: 0 },
        direction: "north",
        modules: [{ width: 100, height: 90, depth: 60 }]
      }
    ]
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.normalized.runs.length, 2);
});

test("missing dimensions fail with clear errors", () => {
  const result = validateModel({
    width: 100,
    modules: [{ width: 100, height: 200, depth: 60 }]
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /height must be a finite number greater than 0/);
  assert.match(result.errors.join("\n"), /depth must be a finite number greater than 0/);
});

test("zero or negative item dimensions fail", () => {
  const result = validateModel({
    width: 100,
    height: 200,
    depth: 60,
    modules: [{ id: "bad-module", width: 0, height: 200, depth: 60 }],
    details: [{ id: "bad-detail", width: 10, height: -1, depth: 2 }]
  });

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /modules\[0\]\.width must be a finite number greater than 0/);
  assert.match(result.errors.join("\n"), /details\[0\]\.height must be a finite number greater than 0/);
});

test("unknown palette warns and normalizes to wood-oak", () => {
  const result = validateModel({
    width: 100,
    height: 200,
    depth: 60,
    palette: "purple-gloss",
    modules: [{ width: 100, height: 200, depth: 60 }]
  });

  assert.equal(result.valid, true);
  assert.equal(result.normalized.palette, "wood-oak");
  assert.match(result.warnings.join("\n"), /Unknown palette "purple-gloss"/);
});

test("void item with solid material returns warning", () => {
  const result = validateModel({
    width: 100,
    height: 200,
    depth: 60,
    modules: [{ width: 100, height: 200, depth: 60 }],
    details: [{ id: "opening", kind: "void", materialRef: "wood-oak", width: 30, height: 40, depth: 10 }]
  });

  assert.equal(result.valid, true);
  assert.match(result.warnings.join("\n"), /opening: kind "void" with solid materialRef "wood-oak"/);
});
