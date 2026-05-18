const SELECTED_CLASS = "ide-selected";

export function enableSelection(svgRoot, onSelect) {
  if (!svgRoot) return () => {};
  const handler = (event) => {
    const node = event.target.closest("[data-detail-id]");
    if (!node) {
      clearSelected(svgRoot);
      if (typeof onSelect === "function") onSelect(null);
      return;
    }
    const id = node.getAttribute("data-detail-id");
    setSelected(svgRoot, id);
    if (typeof onSelect === "function") onSelect(id);
  };
  svgRoot.addEventListener("click", handler);
  return () => svgRoot.removeEventListener("click", handler);
}

export function setSelected(svgRoot, id) {
  if (!svgRoot) return;
  clearSelected(svgRoot);
  if (!id) return;
  const nodes = svgRoot.querySelectorAll(`[data-detail-id="${id}"]`);
  nodes.forEach((node) => node.classList.add(SELECTED_CLASS));
}

export function clearSelected(svgRoot) {
  if (!svgRoot) return;
  svgRoot.querySelectorAll(`.${SELECTED_CLASS}`).forEach((node) => node.classList.remove(SELECTED_CLASS));
}
