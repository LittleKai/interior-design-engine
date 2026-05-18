import { registerElement } from "./registry.js";
import doorShaker from "./elements/door-shaker.js";
import doorFlat from "./elements/door-flat.js";
import drawerFront from "./elements/drawer-front.js";
import handleBar from "./elements/handle-bar.js";
import handleKnob from "./elements/handle-knob.js";
import rodHanging from "./elements/rod-hanging.js";
import shelfFixed from "./elements/shelf-fixed.js";
import voidCavity from "./elements/void-cavity.js";

const BUILTIN_ELEMENTS = [
  doorShaker,
  doorFlat,
  drawerFront,
  handleBar,
  handleKnob,
  rodHanging,
  shelfFixed,
  voidCavity
];

let registered = false;

export function registerBuiltinElements() {
  if (registered) return;
  BUILTIN_ELEMENTS.forEach((spec) => registerElement(spec));
  registered = true;
}

export { registerElement, getElement, hasElement, listElements, factoryElement, clearRegistry } from "./registry.js";
