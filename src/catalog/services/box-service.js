function clone(model) {
  return typeof structuredClone === "function"
    ? structuredClone(model)
    : JSON.parse(JSON.stringify(model));
}

function nextId(items, group) {
  let max = 0;
  items.forEach((item) => {
    const match = typeof item.id === "string" && item.id.match(new RegExp(`^${group}-(\\d+)$`));
    if (match) max = Math.max(max, Number(match[1]));
  });
  return `${group}-${max + 1}`;
}

function targetGroup(props) {
  return props && props.group === "module" ? "module" : "detail";
}

function targetCollection(model, group) {
  return group === "module" ? model.modules : model.details;
}

export const BoxService = {
  create(model, props) {
    if (!props) throw new Error("BoxService.create: props required");
    const next = clone(model || {});
    next.modules = next.modules || [];
    next.details = next.details || [];
    const group = targetGroup(props);
    const collection = targetCollection(next, group);
    const id = props.id || nextId(collection, group);
    const item = Object.assign({ id, group, kind: "box" }, props, { id, group });
    collection.push(item);
    return { model: next, item };
  },

  update(model, id, patch) {
    const next = clone(model || {});
    next.modules = next.modules || [];
    next.details = next.details || [];
    const collections = [next.modules, next.details];
    let updated = null;
    for (const collection of collections) {
      const idx = collection.findIndex((item) => item.id === id);
      if (idx >= 0) {
        collection[idx] = Object.assign({}, collection[idx], patch || {}, { id });
        updated = collection[idx];
        break;
      }
    }
    return { model: next, item: updated };
  },

  delete(model, id) {
    const next = clone(model || {});
    next.modules = (next.modules || []).filter((item) => item.id !== id);
    next.details = (next.details || []).filter((item) => item.id !== id);
    return { model: next };
  },

  intersect(boxA, boxB) {
    if (!boxA || !boxB) return null;
    const xMin = Math.max(boxA.x, boxB.x);
    const yMin = Math.max(boxA.y, boxB.y);
    const zMin = Math.max(boxA.z, boxB.z);
    const xMax = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yMax = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);
    const zMax = Math.min(boxA.z + boxA.depth, boxB.z + boxB.depth);
    if (xMax <= xMin || yMax <= yMin || zMax <= zMin) return null;
    return {
      x: xMin,
      y: yMin,
      z: zMin,
      width: xMax - xMin,
      height: yMax - yMin,
      depth: zMax - zMin
    };
  },

  contains(parent, child) {
    if (!parent || !child) return false;
    return (
      child.x >= parent.x &&
      child.y >= parent.y &&
      child.z >= parent.z &&
      child.x + child.width <= parent.x + parent.width &&
      child.y + child.height <= parent.y + parent.height &&
      child.z + child.depth <= parent.z + parent.depth
    );
  }
};
