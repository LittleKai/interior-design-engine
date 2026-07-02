import test from "node:test";
import assert from "node:assert/strict";
import { renderTemplate, projectBoxToView } from "../interpreter.js";
import { BUILTIN_TEMPLATES } from "../builtin-templates.js";

test("renderTemplate returns resolved boxes from builtin templates", () => {
  const template = BUILTIN_TEMPLATES.find((tpl) => tpl.id === "wall-cabinet-2door");
  const boxes = renderTemplate(template, { params: { width: 100, height: 75, depth: 40 } }, "front", "wood-oak");
  assert.ok(boxes.length >= 1);
  assert.deepEqual(
    { x: boxes[0].x, y: boxes[0].y, z: boxes[0].z, w: boxes[0].w, h: boxes[0].h, d: boxes[0].d },
    { x: 0, y: 0, z: 0, w: 100, h: 75, d: 40 }
  );
});

test("projectBoxToView maps front projection with depth key", () => {
  assert.deepEqual(
    projectBoxToView({ x: 10, y: 20, z: 30, w: 80, h: 75, d: 35, faces: { front: "#ff0000" } }, "front"),
    { x: 10, y: 20, w: 80, h: 75, fill: "#ff0000", depthKey: 30 }
  );
});

test("renderTemplate keeps raw out-of-range params and reports advisory warnings", () => {
  const warnings = [];
  const template = {
    params: { height: { min: 60, max: 120, default: 80 }, width: { default: 50 }, depth: { default: 30 } },
    boxes: [{ x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}" }]
  };
  const boxes = renderTemplate(template, { params: { height: 45 }, warnings }, "front", "wood-oak");
  assert.equal(boxes[0].h, 45);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /height/);
});

test("renderTemplate resolves roundedBox and cylinder primitive fields", () => {
  const template = {
    params: { width: { default: 80 }, height: { default: 86 }, depth: { default: 60 } },
    boxes: [
      { type: "roundedBox", x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", radius: 8, faces: { front: "$woodFront" } },
      { type: "cylinder", x: "{{width - 3}}", y: 40, z: "{{depth + 1}}", radius: 1.5, length: 3, axis: "z", faces: { front: "$metal" } }
    ]
  };
  const shapes = renderTemplate(template, { params: { width: 100 } }, "front", "wood-oak");
  assert.equal(shapes[0].type, "roundedBox");
  assert.equal(shapes[0].radius, 8);
  assert.equal(shapes[0].w, 100);
  assert.equal(shapes[1].type, "cylinder");
  assert.equal(shapes[1].x, 97);
  assert.equal(shapes[1].radius, 1.5);
  assert.equal(shapes[1].length, 3);
  assert.equal(shapes[1].axis, "z");
});

test("renderTemplate skips invalid shapes and records validation warnings", () => {
  const warnings = [];
  const template = {
    id: "bad-shape-template",
    params: { width: { default: 80 }, height: { default: 86 }, depth: { default: 60 } },
    boxes: [
      { x: 0, y: 0, z: 0, w: "{{width}}", h: "{{height}}", d: "{{depth}}", faces: { front: "$woodFront" } },
      { x: "{{style.hand === 'right' ? width - 10 : 8}}", y: 0, z: 0, w: 5, h: 5, d: 5 },
      { x: 10, y: 0, z: 0, w: 5, h: 5, d: 5, faces: { front: "#111111" } }
    ]
  };
  const shapes = renderTemplate(template, { warnings }, "front", "wood-oak");
  assert.equal(shapes.length, 2);
  assert.match(warnings.join("\n"), /bad-shape-template\.boxes\[1\] skipped/);
});

test("renderTemplate accepts strict equality aliases", () => {
  const template = {
    id: "strict-equality-template",
    params: { width: { default: 80 }, height: { default: 86 }, depth: { default: 60 } },
    style: { hand: { default: "right" } },
    boxes: [
      { if: "{{style.hand === 'right'}}", x: "{{width - 10}}", y: 0, z: 0, w: 5, h: 5, d: 5 },
      { if: "{{style.hand !== 'right'}}", x: 8, y: 0, z: 0, w: 5, h: 5, d: 5 }
    ]
  };
  const shapes = renderTemplate(template, { style: { hand: "right" } }, "front", "wood-oak");
  assert.equal(shapes.length, 1);
  assert.equal(shapes[0].x, 70);
});

test("cab-base-rounded-end builtin renders without ternary crash", () => {
  const template = BUILTIN_TEMPLATES.find((tpl) => tpl.id === "cab-base-rounded-end");
  const warnings = [];
  const boxes = renderTemplate(template, { params: { width: 50, height: 86, depth: 60 }, style: { hand: "right" }, warnings }, "front", "wood-oak");
  assert.equal(warnings.length, 0);
  assert.equal(boxes.length, 3);
  assert.equal(boxes[2].type, "cylinder");
  assert.equal(boxes[2].x, 40);
});

test("projectBoxToView projects rounded boxes and front-facing cylinders", () => {
  assert.deepEqual(
    projectBoxToView({ type: "roundedBox", x: 5, y: 10, z: 0, w: 40, h: 50, d: 20, radius: 6, faces: { front: "#aaa" } }, "front"),
    { x: 5, y: 10, w: 40, h: 50, fill: "#aaa", depthKey: 0, radius: 6 }
  );
  assert.deepEqual(
    projectBoxToView({ type: "cylinder", x: 20, y: 30, z: 4, radius: 3, length: 5, axis: "z", faces: { front: "#111" } }, "front"),
    { x: 20, y: 30, w: 6, h: 6, fill: "#111", depthKey: 4, kind: "ellipse" }
  );
});
