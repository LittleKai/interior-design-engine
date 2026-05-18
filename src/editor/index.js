import { el } from "../core/dom.js";
import { t, pickLang } from "../core/i18n.js";
import { normalizeModel } from "../core/model.js";
import { render } from "../ui/main-renderer.js";
import { BoxService } from "../catalog/services/box-service.js";
import { enableSelection, setSelected as setSelectedNode, clearSelected } from "./selection.js";
import { attachPropertyPanel } from "./property-panel.js";
import { History } from "./history.js";
import { bindEditorKeyboard } from "./keyboard.js";

export function enableEditor(options) {
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("enableEditor: mount not found");
  const language = pickLang(options.language);
  const userOnChange = typeof options.onChange === "function" ? options.onChange : () => {};

  let model = normalizeModel(options.model);
  const history = new History(model);

  const shell = el("div", { class: "ide-editor-shell" });
  const canvasArea = el("div", { class: "ide-editor-canvas" });
  const sidebar = el("aside", { class: "ide-editor-sidebar" });
  shell.appendChild(canvasArea);
  shell.appendChild(sidebar);
  mount.innerHTML = "";
  mount.appendChild(shell);

  const toolbar = el("div", { class: "ide-editor-toolbar" });
  const btnUndo = el("button", { class: "ide-editor-btn", type: "button", text: t("editor.undo", language) });
  const btnRedo = el("button", { class: "ide-editor-btn", type: "button", text: t("editor.redo", language) });
  const btnDelete = el("button", { class: "ide-editor-btn ide-editor-btn-danger", type: "button", text: t("editor.deleteSelected", language) });
  toolbar.appendChild(btnUndo);
  toolbar.appendChild(btnRedo);
  toolbar.appendChild(btnDelete);
  sidebar.appendChild(toolbar);

  let selectionCleanup = null;
  let propertyPanel = null;
  let selectedId = null;

  function refreshToolbar() {
    btnUndo.disabled = !history.canUndo();
    btnRedo.disabled = !history.canRedo();
    btnDelete.disabled = !selectedId;
  }

  function activeTabIndex() {
    const tabsBar = canvasArea.querySelector(".ide-tabs");
    if (!tabsBar) return 0;
    const buttons = Array.from(tabsBar.querySelectorAll(".ide-tab"));
    const active = buttons.findIndex((b) => b.classList.contains("is-active"));
    return active >= 0 ? active : 0;
  }

  function rerender() {
    if (selectionCleanup) selectionCleanup();
    const result = render({ mount: canvasArea, model, language, activeIndex: activeTabIndex() });
    const svgs = result.root.querySelectorAll(".ide-svg");
    const detachers = [];
    svgs.forEach((svg) => {
      detachers.push(enableSelection(svg, (id) => {
        selectedId = id;
        svgs.forEach((other) => setSelectedNode(other, id));
        if (propertyPanel) propertyPanel.setSelected(id);
        refreshToolbar();
      }));
    });
    if (selectedId) svgs.forEach((svg) => setSelectedNode(svg, selectedId));
    selectionCleanup = () => detachers.forEach((fn) => fn());
  }

  function applyChange(nextModel, source) {
    model = nextModel;
    history.push(model);
    if (propertyPanel) propertyPanel.setModel(model, { rebuild: source?.type !== "edit" });
    rerender();
    refreshToolbar();
    userOnChange(model, source || {});
  }

  propertyPanel = attachPropertyPanel({
    mount: sidebar,
    model,
    language,
    onChange: (next, detail) => applyChange(next, { type: "edit", ...detail })
  });

  rerender();
  refreshToolbar();

  btnUndo.addEventListener("click", () => {
    const prev = history.undo();
    if (!prev) return;
    model = prev;
    if (propertyPanel) propertyPanel.setModel(model);
    rerender();
    refreshToolbar();
    userOnChange(model, { type: "undo" });
  });

  btnRedo.addEventListener("click", () => {
    const next = history.redo();
    if (!next) return;
    model = next;
    if (propertyPanel) propertyPanel.setModel(model);
    rerender();
    refreshToolbar();
    userOnChange(model, { type: "redo" });
  });

  btnDelete.addEventListener("click", () => {
    if (!selectedId) return;
    const { model: next } = BoxService.delete(model, selectedId);
    const removedId = selectedId;
    selectedId = null;
    applyChange(next, { type: "delete", id: removedId });
  });

  const keyboardCleanup = bindEditorKeyboard({
    onUndo: () => btnUndo.click(),
    onRedo: () => btnRedo.click(),
    onDelete: () => btnDelete.click(),
    onEscape: () => {
      selectedId = null;
      canvasArea.querySelectorAll(".ide-svg").forEach((svg) => clearSelected(svg));
      if (propertyPanel) propertyPanel.setSelected(null);
      refreshToolbar();
    }
  });

  return {
    getModel() { return model; },
    setModel(next) { applyChange(normalizeModel(next), { type: "external" }); },
    destroy() {
      if (selectionCleanup) selectionCleanup();
      if (keyboardCleanup) keyboardCleanup();
      if (propertyPanel) propertyPanel.destroy();
      mount.innerHTML = "";
    }
  };
}
