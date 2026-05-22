import test from "node:test";
import assert from "node:assert/strict";
import { transformBox, resolveItemBoxes } from "../core/box-resolver.js";
import { registerInlineTemplates } from "../template-engine/loader.js";

test("transformBox keeps east-direction boxes in item world frame", () => {
  const item = { x: 10, y: 5, z: 20, _runDirection: "east" };
  assert.deepEqual(transformBox(item, { x: 2, y: 3, z: 4, w: 30, h: 40, d: 50 }), {
    x: 12,
    y: 8,
    z: 24,
    w: 30,
    h: 40,
    d: 50
  });
});

test("transformBox rotates south-direction boxes to match item footprint", () => {
  const item = { x: 100, y: 0, z: 200, _runDirection: "south" };
  assert.deepEqual(transformBox(item, { x: 10, y: 5, z: 20, w: 30, h: 40, d: 50 }), {
    x: 120,
    y: 5,
    z: 210,
    w: 50,
    h: 40,
    d: 30
  });
});

test("resolveItemBoxes resolves template boxes and preserves faces", () => {
  registerInlineTemplates({
    "unit-test-template": {
      id: "unit-test-template",
      params: {
        width: { default: 80 },
        height: { default: 60 },
        depth: { default: 35 }
      },
      boxes: [
        { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { front: "$woodFront" } },
        { x: 2, y: 3, z: 4, w: 5, h: 6, d: 7, faces: { front: "#123456" }, opacity: 0.5 }
      ]
    }
  });
  const item = { _isTemplate: true, tpl: "unit-test-template", x: 10, y: 20, z: 30, width: 90, height: 70, depth: 40 };
  const boxes = resolveItemBoxes(item, "wood-oak");
  assert.equal(boxes.length, 2);
  assert.deepEqual(boxes[0], {
    x: 10,
    y: 20,
    z: 30,
    w: 90,
    h: 70,
    d: 40,
    faces: { front: "#c9986b" },
    opacity: undefined
  });
  assert.deepEqual(boxes[1], {
    x: 12,
    y: 23,
    z: 34,
    w: 5,
    h: 6,
    d: 7,
    faces: { front: "#123456" },
    opacity: 0.5
  });
});

test("resolveItemBoxes returns one default box for non-templated items", () => {
  const boxes = resolveItemBoxes({ x: 1, y: 2, z: 3, width: 40, height: 50, depth: 60 }, "wood-oak");
  assert.equal(boxes.length, 1);
  assert.deepEqual(
    { x: boxes[0].x, y: boxes[0].y, z: boxes[0].z, w: boxes[0].w, h: boxes[0].h, d: boxes[0].d },
    { x: 1, y: 2, z: 3, w: 40, h: 50, d: 60 }
  );
  assert.equal(boxes[0].faces.front, "#c9986b");
});

test("resolveItemBoxes preserves roundedBox and cylinder primitive metadata", () => {
  registerInlineTemplates({
    "primitive-test-template": {
      id: "primitive-test-template",
      params: {
        width: { default: 80 },
        height: { default: 86 },
        depth: { default: 60 }
      },
      boxes: [
        { type: "roundedBox", x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", radius: 10, faces: { front: "$woodFront" } },
        { type: "cylinder", x: 10, y: 20, z: 30, radius: 2, length: 5, axis: "z", faces: { front: "$metal" } }
      ]
    }
  });
  const item = { _isTemplate: true, tpl: "primitive-test-template", x: 100, y: 5, z: 40, width: 90, height: 86, depth: 60 };
  const boxes = resolveItemBoxes(item, "wood-oak");
  assert.equal(boxes[0].type, "roundedBox");
  assert.equal(boxes[0].radius, 10);
  assert.equal(boxes[1].type, "cylinder");
  assert.equal(boxes[1].axis, "z");
  assert.equal(boxes[1].radius, 2);
  assert.equal(boxes[1].length, 5);
});
