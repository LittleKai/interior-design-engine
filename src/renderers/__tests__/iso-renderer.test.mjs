import test from "node:test";
import assert from "node:assert/strict";
import { shadeColor, shadeFaceColor } from "../iso-renderer.js";

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
