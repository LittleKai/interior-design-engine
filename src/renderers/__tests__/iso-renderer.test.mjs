import test from "node:test";
import assert from "node:assert/strict";
import {
  cylinderEndEllipse,
  cylinderHighlightLine,
  roundedPathCommands,
  shadeColor,
  shadeFaceColor
} from "../iso-renderer.js";

test("shadeColor adjusts hex luminance and leaves non-hex colors unchanged", () => {
  assert.equal(shadeColor("#808080", 1.1), "#8d8d8d");
  assert.equal(shadeColor("#808080", 0.85), "#6d6d6d");
  assert.equal(shadeColor("rgba(120,150,170,0.3)", 0.85), "rgba(120,150,170,0.3)");
});

test("shadeFaceColor uses iso face luminance factors", () => {
  assert.equal(shadeFaceColor("top", "#808080"), "#8d8d8d");
  assert.equal(shadeFaceColor("front", "#808080"), "#808080");
  assert.equal(shadeFaceColor("right", "#808080"), "#6d6d6d");
  assert.equal(shadeFaceColor("bottom", "#808080"), "#646464");
});

test("roundedPathCommands emits quadratic arcs for selected corners", () => {
  const commands = roundedPathCommands([[0, 0], [40, 0], [40, 20], [0, 20]], 6, [2, 3]);
  assert.equal(commands.filter((command) => command[0] === "Q").length, 2);
  assert.equal(commands.at(-1)[0], "Z");
});

test("cylinder helpers produce flattened caps and a lengthwise highlight", () => {
  const ellipse = cylinderEndEllipse([0, 0], [40, 0], 8);
  assert.equal(ellipse.rx, 8);
  assert.equal(ellipse.ry, 3.68);
  assert.ok(ellipse.ry < ellipse.rx);

  const highlight = cylinderHighlightLine([0, 0], [40, 0], 8);
  assert.equal(highlight[0][0], 0);
  assert.equal(highlight[1][0], 40);
  assert.ok(highlight[0][1] > 0);
  assert.equal(highlight[0][1], highlight[1][1]);
});
