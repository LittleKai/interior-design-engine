function snapshot(model) {
  return typeof structuredClone === "function"
    ? structuredClone(model)
    : JSON.parse(JSON.stringify(model));
}

const MAX_ENTRIES = 50;

export class History {
  constructor(initial) {
    this.stack = initial ? [snapshot(initial)] : [];
    this.cursor = this.stack.length - 1;
  }

  push(model) {
    if (!model) return;
    if (this.cursor < this.stack.length - 1) {
      this.stack = this.stack.slice(0, this.cursor + 1);
    }
    this.stack.push(snapshot(model));
    if (this.stack.length > MAX_ENTRIES) {
      this.stack.shift();
    }
    this.cursor = this.stack.length - 1;
  }

  undo() {
    if (!this.canUndo()) return null;
    this.cursor -= 1;
    return snapshot(this.stack[this.cursor]);
  }

  redo() {
    if (!this.canRedo()) return null;
    this.cursor += 1;
    return snapshot(this.stack[this.cursor]);
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
