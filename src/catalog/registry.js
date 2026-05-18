const ELEMENTS = new Map();

export function registerElement(spec) {
  if (!spec || !spec.name) {
    throw new Error("registerElement: spec.name is required");
  }
  ELEMENTS.set(spec.name, spec);
  return spec;
}

export function getElement(name) {
  return ELEMENTS.get(name) || null;
}

export function hasElement(name) {
  return ELEMENTS.has(name);
}

export function listElements(filter) {
  const prototype = filter && filter.prototype;
  const all = Array.from(ELEMENTS.values());
  if (!prototype) return all;
  return all.filter((spec) => spec.prototype === prototype);
}

export function factoryElement(name, opts) {
  const spec = getElement(name);
  if (!spec) throw new Error(`factoryElement: unknown element "${name}"`);
  const overrides = opts || {};
  return Object.assign(
    {
      catalogId: spec.name,
      type: spec.name,
      kind: "box",
      group: spec.prototype === "module" ? "module" : "detail"
    },
    spec.properties || {},
    overrides
  );
}

export function clearRegistry() {
  ELEMENTS.clear();
}
