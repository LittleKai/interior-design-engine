import { el } from "../core/dom.js";
import { t, pickLang } from "../core/i18n.js";
import { allItems } from "../core/model.js";

const MATERIAL_PRESETS = ["wood-oak", "wood-walnut", "laminate-white", "laminate-black-matte", "metal-brushed", "metal-black", "glass-smoked", "fabric-linen"];

function findItem(model, id) {
  if (!model || !id) return null;
  return allItems(model).find((item) => item.id === id) || null;
}

function updateItem(model, id, patch) {
  const next = structuredClone(model);
  const update = (items) => (items || []).map((item) => (item.id === id ? Object.assign({}, item, patch) : item));
  next.modules = update(next.modules);
  next.details = update(next.details);
  next.runs = (next.runs || []).map((run) => Object.assign({}, run, { modules: update(run.modules) }));
  return next;
}

function numberField(label, value, onChange) {
  const wrap = el("label", { class: "ide-prop-field" });
  wrap.appendChild(el("span", { class: "ide-prop-fieldlabel", text: label }));
  const input = el("input", { type: "number", class: "ide-prop-input", value: value != null ? String(value) : "0", step: "1" });
  input.addEventListener("input", () => {
    const num = Number(input.value);
    if (Number.isFinite(num)) onChange(num);
  });
  wrap.appendChild(input);
  return { wrap, input };
}

function textField(label, value, onChange) {
  const wrap = el("label", { class: "ide-prop-field" });
  wrap.appendChild(el("span", { class: "ide-prop-fieldlabel", text: label }));
  const input = el("input", { type: "text", class: "ide-prop-input", value: value || "" });
  input.addEventListener("input", () => onChange(input.value));
  wrap.appendChild(input);
  return { wrap, input };
}

function colorField(label, value, onChange) {
  const wrap = el("label", { class: "ide-prop-field" });
  wrap.appendChild(el("span", { class: "ide-prop-fieldlabel", text: label }));
  const input = el("input", { type: "color", class: "ide-prop-color", value: value || "#c89a62" });
  input.addEventListener("input", () => onChange(input.value));
  wrap.appendChild(input);
  return { wrap, input };
}

function selectField(label, value, options, onChange) {
  const wrap = el("label", { class: "ide-prop-field" });
  wrap.appendChild(el("span", { class: "ide-prop-fieldlabel", text: label }));
  const select = el("select", { class: "ide-prop-select" });
  options.forEach((opt) => {
    const option = el("option", { value: opt.value, text: opt.label });
    if (opt.value === value) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener("change", () => onChange(select.value || ""));
  wrap.appendChild(select);
  return { wrap, select };
}

export function attachPropertyPanel(options) {
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("attachPropertyPanel: mount not found");
  const language = pickLang(options.language);
  const onChange = typeof options.onChange === "function" ? options.onChange : () => {};

  let model = options.model;
  let selectedId = null;
  let readOnly = false;

  const panel = el("aside", { class: "ide-prop-panel" });
  const header = el("h3", { class: "ide-prop-title", text: t("editor.title", language) });
  const emptyHint = el("p", { class: "ide-prop-empty", text: t("editor.empty", language) });
  const form = el("div", { class: "ide-prop-form" });
  form.style.display = "none";

  panel.appendChild(header);
  panel.appendChild(emptyHint);
  panel.appendChild(form);
  mount.appendChild(panel);

  function emitChange(patch) {
    if (!selectedId) return;
    const next = updateItem(model, selectedId, patch);
    model = next;
    onChange(model, { id: selectedId, patch });
  }

  function buildForm(item) {
    form.innerHTML = "";

    const labelF = textField(t("editor.fieldLabel", language), item.label || "", (v) => emitChange({ label: v }));
    form.appendChild(labelF.wrap);

    const dimRow = el("div", { class: "ide-prop-row" });
    const xF = numberField("x", item.x, (v) => emitChange({ x: v }));
    const yF = numberField("y", item.y, (v) => emitChange({ y: v }));
    const zF = numberField("z", item.z, (v) => emitChange({ z: v }));
    [xF, yF, zF].forEach((f) => dimRow.appendChild(f.wrap));
    form.appendChild(dimRow);

    const sizeRow = el("div", { class: "ide-prop-row" });
    const wF = numberField(t("editor.fieldWidth", language), item.width, (v) => emitChange({ width: v }));
    const hF = numberField(t("editor.fieldHeight", language), item.height, (v) => emitChange({ height: v }));
    const dF = numberField(t("editor.fieldDepth", language), item.depth, (v) => emitChange({ depth: v }));
    [wF, hF, dF].forEach((f) => sizeRow.appendChild(f.wrap));
    form.appendChild(sizeRow);

    const colorF = colorField(t("editor.fieldColor", language), item.color, (v) => emitChange({ color: v }));
    form.appendChild(colorF.wrap);

    const materials = [{ value: "", label: t("editor.materialNone", language) }]
      .concat(MATERIAL_PRESETS.map((name) => ({ value: name, label: name })));
    const matF = selectField(t("editor.fieldMaterial", language), item.materialRef || "", materials, (v) => emitChange({ materialRef: v || null }));
    form.appendChild(matF.wrap);

    applyReadOnly();
  }

  function applyReadOnly() {
    form.classList.toggle("ide-prop-form--readonly", readOnly);
    form.querySelectorAll("input, select").forEach((field) => {
      field.disabled = readOnly;
    });
  }

  function showSelected(id) {
    selectedId = id;
    const item = findItem(model, id);
    if (!item) {
      form.style.display = "none";
      emptyHint.style.display = "block";
      return;
    }
    emptyHint.style.display = "none";
    form.style.display = "block";
    buildForm(item);
  }

  showSelected(null);

  return {
    setModel(next, opts) {
      model = next;
      if ((!opts || opts.rebuild !== false) && selectedId) showSelected(selectedId);
    },
    setSelected(id) { showSelected(id); },
    setReadOnly(value) {
      readOnly = Boolean(value);
      applyReadOnly();
    },
    getSelected() { return selectedId; },
    destroy() { panel.remove(); }
  };
}
