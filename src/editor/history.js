function snapshot(model) {
  return typeof structuredClone === "function"
    ? structuredClone(model)
    : JSON.parse(JSON.stringify(model));
}

const MAX_ENTRIES = 50;

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createEntry(model, opts) {
  const timestamp = Date.now();
  return {
    id: createId(),
    model: snapshot(model),
    timestamp,
    label: opts?.label || `Snapshot ${new Date(timestamp).toLocaleTimeString()}`,
    renderUrl: opts?.renderUrl || undefined
  };
}

export class History {
  constructor(initial) {
    this.stack = initial ? [createEntry(initial, { label: "Initial" })] : [];
    this.cursor = this.stack.length - 1;
  }

  push(model, opts) {
    if (!model) return null;
    if (this.cursor < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.cursor + 1);
    }
    const entry = createEntry(model, opts || {});
    this.stack.push(entry);
    if (this.stack.length > MAX_ENTRIES) {
      this.stack.shift();
    }
    this.cursor = this.stack.length - 1;
    return entry.id;
  }

  attachRenderUrl(entryId, url) {
    const entry = this.stack.find((item) => item.id === entryId);
    if (entry) entry.renderUrl = url;
  }

  list() {
    return this.stack.map((entry) => ({ ...entry, model: snapshot(entry.model) }));
  }

  peekAt(index) {
    const entry = this.stack[index];
    return entry ? { ...entry, model: snapshot(entry.model) } : null;
  }

  currentEntryId() {
    return this.stack[this.cursor]?.id || null;
  }

  restoreAt(index) {
    if (index < 0 || index >= this.stack.length) return null;
    this.cursor = index;
    return snapshot(this.stack[this.cursor].model);
  }

  undo() {
    if (!this.canUndo()) return null;
    this.cursor -= 1;
    return snapshot(this.stack[this.cursor].model);
  }

  redo() {
    if (!this.canRedo()) return null;
    this.cursor += 1;
    return snapshot(this.stack[this.cursor].model);
  }

  canUndo() {
    return this.cursor > 0;
  }

  canRedo() {
    return this.cursor < this.stack.length - 1;
  }

  size() {
    return this.stack.length;
  }
}
