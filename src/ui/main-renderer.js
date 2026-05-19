import { el, cm } from "../core/dom.js";
import { normalizeModel } from "../core/model.js";
import { t, pickLang } from "../core/i18n.js";
import { renderSvgView } from "../renderers/svg-renderer.js";
import { IsoRenderer } from "../renderers/iso-renderer.js";
import { listPalettes } from "../template-engine/color-tokens.js";
import { prepareModelForRender } from "../template-engine/dispatcher.js";

const DEFAULT_TABS = ["front", "side", "plan", "3d", "specs"];

function mount3dTab(view, model, language) {
  view.appendChild(el("p", { class: "ide-note", text: t("notes.view3d", language) }));
  const wrap = el("div", { class: "ide-canvas-wrap ide-canvas-wrap-3d" });
  view.appendChild(wrap);

  const stage = el("div", { class: "ide-three-stage" });
  wrap.appendChild(stage);

  const toolbar = el("div", { class: "ide-three-toolbar" });
  const btnDim = el("button", { class: "ide-three-toggle", type: "button", text: t("view3d.dimensionsOn", language) });
  const paletteSelect = el("select", {
    class: "ide-three-toggle",
    title: t("view3d.paletteHint", language),
    "aria-label": t("view3d.paletteLabel", language)
  });
  listPalettes(language).forEach((palette) => {
    const option = el("option", { value: palette.id, text: palette.label });
    if (palette.id === model.palette) option.selected = true;
    paletteSelect.appendChild(option);
  });
  toolbar.appendChild(btnDim);
  toolbar.appendChild(paletteSelect);
  view.appendChild(toolbar);
  view.appendChild(el("p", { class: "ide-hint", text: t("notes.view3dHint", language) }));

  let dimVisible = false;
  const renderer = new IsoRenderer(stage, { palette: model.palette });

  requestAnimationFrame(() => {
    renderer.mount();
    renderer.update(model);
  });

  btnDim.addEventListener("click", () => {
    dimVisible = !dimVisible;
    renderer.setDimensionsVisible(dimVisible);
    btnDim.classList.toggle("is-active", dimVisible);
    btnDim.textContent = t(dimVisible ? "view3d.dimensionsOff" : "view3d.dimensionsOn", language);
  });
  paletteSelect.addEventListener("change", () => {
    model.palette = paletteSelect.value;
    renderer.setPalette(paletteSelect.value);
  });
}

function renderSpecs(model, language) {
  const grid = el("div", { class: "ide-spec-grid" });
  const specs = [
    [t("specs.totalWidth", language), cm(model.width), t("specs.totalWidthNote", language)],
    [t("specs.totalHeight", language), cm(model.height), t("specs.totalHeightNote", language)],
    [t("specs.totalDepth", language), cm(model.depth), t("specs.totalDepthNote", language)],
    [t("specs.moduleCount", language), String(model.modules.length), t("specs.moduleCountNote", language)],
    [t("specs.detailCount", language), String((model.details || []).length), t("specs.detailCountNote", language)]
  ].concat(model.specs || []);

  specs.forEach(([label, value, note]) => {
    grid.appendChild(el("div", { class: "ide-spec-card" }, [
      el("div", { class: "ide-spec-label", text: label }),
      el("div", { class: "ide-spec-value", text: value }),
      el("div", { class: "ide-spec-note", text: note || "" })
    ]));
  });
  return grid;
}

export function render(options) {
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("InteriorDesigner.render: mount element not found.");

  const language = pickLang(options.language);
  const model = normalizeModel(options.model);
  prepareModelForRender(model).catch((error) => console.warn("Template catalog load failed:", error));
  const tabs = options.tabs || DEFAULT_TABS;
  const activeIndex = Number.isInteger(options.activeIndex) && options.activeIndex >= 0 && options.activeIndex < tabs.length
    ? options.activeIndex
    : 0;
  const root = el("div", { class: "ide-root" });
  const shell = el("div", { class: "ide-shell" });
  root.appendChild(shell);

  shell.appendChild(el("header", { class: "ide-header" }, [
    el("div", {}, [
      el("h1", { class: "ide-title", text: model.title }),
      el("p", { class: "ide-subtitle", text: model.subtitle })
    ]),
    el("div", { class: "ide-badge" }, [
      el("div", { text: `${t("headerBadge.width", language)}: ${cm(model.width)}` }),
      el("div", { text: `${t("headerBadge.height", language)}: ${cm(model.height)}` }),
      el("div", { text: `${t("headerBadge.depth", language)}: ${cm(model.depth)}` })
    ])
  ]));

  const nav = el("nav", { class: "ide-tabs" });
  const views = el("main", {});
  shell.appendChild(nav);
  shell.appendChild(views);

  tabs.forEach((tab, index) => {
    const tabLabel = t(`tabs.${tab}`, language) || tab;
    const button = el("button", {
      class: `ide-tab${index === activeIndex ? " is-active" : ""}`,
      type: "button",
      text: tabLabel
    });
    const view = el("section", { class: `ide-view${index === activeIndex ? " is-active" : ""}` });

    button.addEventListener("click", () => {
      nav.querySelectorAll(".ide-tab").forEach((item) => item.classList.remove("is-active"));
      views.querySelectorAll(".ide-view").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      view.classList.add("is-active");
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    });

    view.appendChild(el("h2", { class: "ide-view-title", text: tabLabel }));
    if (tab === "front" || tab === "side" || tab === "plan") {
      view.appendChild(el("p", { class: "ide-note", text: t("notes.planView", language) }));
      view.appendChild(el("div", { class: "ide-canvas-wrap" }, [renderSvgView(model, tab, { language })]));
    } else if (tab === "3d") {
      mount3dTab(view, model, language);
    } else {
      view.appendChild(renderSpecs(model, language));
    }

    nav.appendChild(button);
    views.appendChild(view);
  });

  mount.innerHTML = "";
  mount.appendChild(root);
  return { model, root };
}
