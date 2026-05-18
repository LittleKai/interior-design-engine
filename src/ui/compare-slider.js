import { el } from "../core/dom.js";

export function attachCompareSlider({ mount, before, after, beforeLabel, afterLabel }) {
  const target = typeof mount === "string" ? document.querySelector(mount) : mount;
  if (!target) throw new Error("attachCompareSlider: mount not found");

  const root = el("div", { class: "ide-compare-slider" });
  const beforeImg = el("img", { class: "ide-compare-img ide-compare-before", src: before, alt: beforeLabel || "before" });
  const afterImg = el("img", { class: "ide-compare-img ide-compare-after", src: after, alt: afterLabel || "after" });
  const afterWrap = el("div", { class: "ide-compare-after-wrap" }, [afterImg]);
  const handle = el("button", { class: "ide-compare-handle", type: "button", "aria-label": "Compare slider" });

  if (beforeLabel) root.appendChild(el("span", { class: "ide-compare-label ide-compare-label-before", text: beforeLabel }));
  if (afterLabel) root.appendChild(el("span", { class: "ide-compare-label ide-compare-label-after", text: afterLabel }));
  root.appendChild(beforeImg);
  root.appendChild(afterWrap);
  root.appendChild(handle);

  let position = 50;
  function setPosition(pct) {
    position = Math.max(0, Math.min(100, pct));
    afterWrap.style.clipPath = `inset(0 0 0 ${position}%)`;
    handle.style.left = `${position}%`;
  }
  setPosition(50);

  let dragging = false;
  function onMove(clientX) {
    const rect = root.getBoundingClientRect();
    setPosition(((clientX - rect.left) / rect.width) * 100);
  }
  handle.addEventListener("pointerdown", (event) => {
    dragging = true;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    onMove(event.clientX);
  });
  handle.addEventListener("pointerup", (event) => {
    dragging = false;
    try { handle.releasePointerCapture(event.pointerId); } catch (e) { /* ignore */ }
  });
  root.addEventListener("click", (event) => {
    if (event.target === handle) return;
    onMove(event.clientX);
  });
  handle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") setPosition(position - 4);
    else if (event.key === "ArrowRight") setPosition(position + 4);
  });

  target.appendChild(root);
  return {
    setPosition,
    destroy() { root.remove(); }
  };
}
