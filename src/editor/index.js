import { el } from "../core/dom.js";
import { t, pickLang } from "../core/i18n.js";
import { normalizeModel } from "../core/model.js";
import { render } from "../ui/main-renderer.js";
import { enableSelection, setSelected as setSelectedNode, clearSelected } from "./selection.js";
import { attachPropertyPanel } from "./property-panel.js";
import { History } from "./history.js";
import { bindEditorKeyboard } from "./keyboard.js";
import { attachHistoryPanel } from "./history-panel.js";

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
  let historyPanel = null;
  let selectedId = null;
  let previewModel = null;
  let previewEntry = null;
  let isPreviewMode = false;

  function deleteItem(sourceModel, id) {
    const next = structuredClone(sourceModel);
    next.modules = (next.modules || []).filter((item) => item.id !== id);
    next.details = (next.details || []).filter((item) => item.id !== id);
    next.runs = (next.runs || []).map((run) => Object.assign({}, run, {
      modules: (run.modules || []).filter((item) => item.id !== id)
    }));
    return next;
  }

  const previewBanner = el("div", { class: "ide-preview-banner" });
  const previewText = el("span", { text: t("history.banner", language) });
  const previewRestore = el("button", { class: "ide-editor-btn", type: "button", text: t("history.restore", language) });
  const previewClose = el("button", { class: "ide-editor-btn", type: "button", text: t("history.close", language) });
  previewBanner.appendChild(previewText);
  previewBanner.appendChild(previewRestore);
  previewBanner.appendChild(previewClose);

  function refreshToolbar() {
    btnUndo.disabled = isPreviewMode || !history.canUndo();
    btnRedo.disabled = isPreviewMode || !history.canRedo();
    btnDelete.disabled = isPreviewMode || !selectedId;
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
    const result = render({ mount: canvasArea, model: previewModel || model, language, activeIndex: activeTabIndex() });
    if (isPreviewMode) {
      canvasArea.prepend(previewBanner);
    }
    const svgs = result.root.querySelectorAll(".ide-svg");
    const detachers = [];
    svgs.forEach((svg) => {
      detachers.push(enableSelection(svg, (id) => {
        if (isPreviewMode) return;
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
    history.push(model, source?.label ? { label: source.label } : undefined);
    if (propertyPanel) propertyPanel.setModel(model, { rebuild: source?.type !== "edit" });
    if (historyPanel) historyPanel.refresh();
    rerender();
    refreshToolbar();
    userOnChange(model, source || {});
  }

  function exitPreview() {
    previewModel = null;
    previewEntry = null;
    isPreviewMode = false;
    if (propertyPanel) {
      propertyPanel.setReadOnly(false);
      propertyPanel.setModel(model);
    }
    rerender();
    refreshToolbar();
  }

  function restoreHistoryIndex(index) {
    const restored = history.restoreAt(index);
    if (!restored) return;
    model = restored;
    selectedId = null;
    previewModel = null;
    previewEntry = null;
    isPreviewMode = false;
    if (propertyPanel) {
      propertyPanel.setReadOnly(false);
      propertyPanel.setModel(model);
      propertyPanel.setSelected(null);
    }
    if (historyPanel) historyPanel.refresh();
    rerender();
    refreshToolbar();
    userOnChange(model, { type: "restore", index });
  }

  propertyPanel = attachPropertyPanel({
    mount: sidebar,
    model,
    language,
    onChange: (next, detail) => applyChange(next, { type: "edit", ...detail })
  });

  historyPanel = attachHistoryPanel({
    mount: sidebar,
    history,
    language,
    onPreview: (entryModel, entry) => {
      previewModel = normalizeModel(entryModel);
      previewEntry = entry;
      isPreviewMode = true;
      selectedId = null;
      if (propertyPanel) {
        propertyPanel.setModel(previewModel);
        propertyPanel.setSelected(null);
        propertyPanel.setReadOnly(true);
      }
      rerender();
      refreshToolbar();
    },
    onRestore: (index) => restoreHistoryIndex(index)
  });

  rerender();
  refreshToolbar();

  btnUndo.addEventListener("click", () => {
    if (isPreviewMode) return;
    const prev = history.undo();
    if (!prev) return;
    model = prev;
    if (propertyPanel) propertyPanel.setModel(model);
    if (historyPanel) historyPanel.refresh();
    rerender();
    refreshToolbar();
    userOnChange(model, { type: "undo" });
  });

  btnRedo.addEventListener("click", () => {
    if (isPreviewMode) return;
    const next = history.redo();
    if (!next) return;
    model = next;
    if (propertyPanel) propertyPanel.setModel(model);
    if (historyPanel) historyPanel.refresh();
    rerender();
    refreshToolbar();
    userOnChange(model, { type: "redo" });
  });

  btnDelete.addEventListener("click", () => {
    if (isPreviewMode) return;
    if (!selectedId) return;
    const next = deleteItem(model, selectedId);
    const removedId = selectedId;
    selectedId = null;
    applyChange(next, { type: "delete", id: removedId });
  });

  previewClose.addEventListener("click", exitPreview);
  previewRestore.addEventListener("click", () => {
    if (!previewEntry) return;
    const index = history.list().findIndex((entry) => entry.id === previewEntry.id);
    restoreHistoryIndex(index);
  });

  const renderCompleteHandler = (event) => {
    const url = event.detail?.url;
    if (!url) return;
    history.attachRenderUrl(history.currentEntryId(), url);
    if (historyPanel) historyPanel.refresh();
  };
  window.addEventListener("interior:render-complete", renderCompleteHandler);

  const keyboardCleanup = bindEditorKeyboard({
    onUndo: () => { if (!isPreviewMode) btnUndo.click(); },
    onRedo: () => { if (!isPreviewMode) btnRedo.click(); },
    onDelete: () => { if (!isPreviewMode) btnDelete.click(); },
    onEscape: () => {
      if (isPreviewMode) {
        exitPreview();
        return;
      }
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
      window.removeEventListener("interior:render-complete", renderCompleteHandler);
      if (keyboardCleanup) keyboardCleanup();
      if (historyPanel) historyPanel.destroy();
      if (propertyPanel) propertyPanel.destroy();
      mount.innerHTML = "";
    }
  };
}
