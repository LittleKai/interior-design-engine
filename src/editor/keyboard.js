function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function bindEditorKeyboard({ onUndo, onRedo, onDelete, onEscape }) {
  const handler = (event) => {
    if (isTypingTarget(event.target)) {
      if (event.key === "Escape" && typeof onEscape === "function") onEscape();
      return;
    }
    const ctrl = event.ctrlKey || event.metaKey;
    if (ctrl && !event.shiftKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (typeof onUndo === "function") onUndo();
      return;
    }
    if ((ctrl && event.key.toLowerCase() === "y") || (ctrl && event.shiftKey && event.key.toLowerCase() === "z")) {
      event.preventDefault();
      if (typeof onRedo === "function") onRedo();
      return;
    }
    if (event.key === "Delete") {
      if (typeof onDelete === "function") {
        event.preventDefault();
        onDelete();
      }
      return;
    }
    if (event.key === "Escape" && typeof onEscape === "function") {
      onEscape();
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
