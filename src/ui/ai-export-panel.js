import { el } from "../core/dom.js";
import { normalizeModel } from "../core/model.js";
import { DESIGN_DIRECTIONS, t, pickLang } from "../core/i18n.js";
import { buildAiPrompt, downloadAiImagePackage } from "../ai/prompt-builder.js";

const COLOR_OPTIONS = [
  { vi: "gỗ sồi ấm kết hợp gỗ óc chó, tay nắm đen mờ", en: "warm oak and walnut wood, matte black handles" },
  { vi: "laminate trắng mờ kết hợp mặt bàn gỗ sồi sáng", en: "matte white laminate with pale oak desktop" },
  { vi: "veneer óc chó tối màu kết hợp kính khói và phụ kiện đen", en: "dark walnut veneer with smoked glass accents and black hardware" },
  { vi: "gỗ tần bì sáng kết hợp tay nắm kim loại màu champagne", en: "light ash wood with champagne metal handles" }
];

const MATERIAL_OPTIONS = [
  { vi: "veneer gỗ tự nhiên, hoàn thiện satin, vân gỗ nhẹ và chân thực", en: "natural wood veneer, satin finish, subtle visible grain" },
  { vi: "laminate chống trầy, bề mặt phẳng sạch, phù hợp nội thất gia đình", en: "high pressure laminate, clean flat panels, durable residential furniture boards" },
  { vi: "cốt plywood phủ veneer, phụ kiện kim loại đen sắc nét", en: "premium plywood core with veneer, crisp black metal hardware" },
  { vi: "MDF sơn mờ, bề mặt liền mạch, phong cách built-in hiện đại", en: "painted MDF, soft matte finish, seamless modern built-in look" }
];

const ROOM_OPTIONS = [
  { vi: "phòng ngủ hiện đại diện tích nhỏ, hệ tủ đặt sát một mảng tường", en: "modern compact bedroom with the cabinet built against one wall" },
  { vi: "phòng ngủ căn hộ nhỏ, giường đặt đối diện tủ, lối đi rõ ràng", en: "small apartment bedroom, bed on the opposite side, clear walkway" },
  { vi: "phòng ngủ kết hợp góc làm việc tối giản, tường trung tính, sàn gỗ", en: "minimal home office bedroom combo, neutral wall paint, timber floor" },
  { vi: "phòng ngủ trẻ em có góc học tập, trang trí trung tính, lưu trữ gọn gàng", en: "children bedroom with study area, soft neutral decor, organized storage" }
];

const LIGHTING_OPTIONS = [
  { vi: "ánh sáng tự nhiên mềm từ cửa sổ gần đó kết hợp ánh sáng nội thất ấm", en: "soft daylight from a nearby window plus warm ambient interior lighting" },
  { vi: "ánh sáng ban mai rõ, bóng đổ sạch, cảm giác nhà ở chân thực", en: "bright morning daylight, clean shadows, realistic residential lighting" },
  { vi: "ánh sáng showroom đều, nhiệt màu trung tính, thể hiện rõ vật liệu", en: "even showroom lighting, neutral color temperature, high material clarity" },
  { vi: "ánh sáng chiều ấm, không khí phòng ngủ ấm cúng, bóng mềm chân thực", en: "warm evening lighting, cozy bedroom ambience, realistic soft shadows" }
];

function optionSelect(label, values, selected) {
  const id = `ide-export-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const select = el("select", { id });
  values.forEach((value) => {
    select.appendChild(el("option", {
      value,
      text: value,
      selected: value === selected ? "selected" : null
    }));
  });
  return el("div", { class: "ide-export-field" }, [
    el("label", { for: id, text: label }),
    select
  ]);
}

export function attachAiImageExportPanel(options) {
  const settings = Object.assign({
    mount: null,
    model: null,
    language: "vi",
    title: null,
    description: null
  }, options || {});
  const language = pickLang(settings.language);
  const mount = typeof settings.mount === "string" ? document.querySelector(settings.mount) : settings.mount;
  if (!mount) throw new Error("InteriorDesigner.attachAiImageExportPanel: mount element not found.");

  const panel = el("section", { class: "ide-export-panel" });
  const directionOptions = DESIGN_DIRECTIONS.map((direction) => ({
    vi: direction.nameVi,
    en: direction.nameEn,
    promptVi: direction.promptVi,
    promptEn: direction.promptEn,
    materialVi: direction.materialVi,
    materialEn: direction.materialEn
  }));

  const labelDirection = t("export.labelDirection", language);
  const labelColor = t("export.labelColor", language);
  const labelMaterial = t("export.labelMaterial", language);
  const labelRoom = t("export.labelRoom", language);
  const labelLighting = t("export.labelLighting", language);

  const direction = optionSelect(labelDirection, directionOptions.map((item) => language === "vi" ? item.vi : item.en), language === "vi" ? directionOptions[0].vi : directionOptions[0].en);
  const color = optionSelect(labelColor, COLOR_OPTIONS.map((item) => language === "vi" ? item.vi : item.en), language === "vi" ? COLOR_OPTIONS[0].vi : COLOR_OPTIONS[0].en);
  const material = optionSelect(labelMaterial, MATERIAL_OPTIONS.map((item) => language === "vi" ? item.vi : item.en), language === "vi" ? MATERIAL_OPTIONS[0].vi : MATERIAL_OPTIONS[0].en);
  const room = optionSelect(labelRoom, ROOM_OPTIONS.map((item) => language === "vi" ? item.vi : item.en), language === "vi" ? ROOM_OPTIONS[0].vi : ROOM_OPTIONS[0].en);
  const lighting = optionSelect(labelLighting, LIGHTING_OPTIONS.map((item) => language === "vi" ? item.vi : item.en), language === "vi" ? LIGHTING_OPTIONS[0].vi : LIGHTING_OPTIONS[0].en);

  const extra = el("textarea", { placeholder: t("export.placeholderExtra", language) });
  const promptEnBox = el("textarea", { readonly: "readonly" });
  const promptViBox = el("textarea", { readonly: "readonly" });
  const status = el("span", { class: "ide-export-status", text: t("export.statusInitial", language) });
  const promptStatus = el("span", { class: "ide-export-status", text: t("export.promptStatus", language) });
  const downloadButton = el("button", { class: "ide-export-button", type: "button", text: t("export.btnDownload", language) });
  const refreshButton = el("button", { class: "ide-export-button", type: "button", text: t("export.btnRefresh", language) });
  const copyButton = el("button", { class: "ide-export-button ide-export-button-secondary", type: "button", text: t("export.btnCopy", language) });
  const exportTabButton = el("button", { class: "ide-export-tab is-active", type: "button", text: t("export.tabExport", language) });
  const promptTabButton = el("button", { class: "ide-export-tab", type: "button", text: t("export.tabPrompt", language) });
  const exportPane = el("div", { class: "ide-export-pane is-active" });
  const promptPane = el("div", { class: "ide-export-pane" });

  function selectedPreset(field, presets) {
    const select = field.querySelector("select");
    return presets[select.selectedIndex] || presets[0];
  }

  function readOptions() {
    const selectedDirection = selectedPreset(direction, directionOptions);
    const selectedColor = selectedPreset(color, COLOR_OPTIONS);
    const selectedMaterial = selectedPreset(material, MATERIAL_OPTIONS);
    const selectedRoom = selectedPreset(room, ROOM_OPTIONS);
    const selectedLighting = selectedPreset(lighting, LIGHTING_OPTIONS);
    return {
      colorSchemeVi: `${selectedColor.vi}; định hướng ${selectedDirection.promptVi}`,
      colorSchemeEn: `${selectedColor.en}; ${selectedDirection.promptEn}`,
      materialVi: `${selectedMaterial.vi}; ${selectedDirection.materialVi}`,
      materialEn: `${selectedMaterial.en}; ${selectedDirection.materialEn}`,
      roomLayoutVi: selectedRoom.vi,
      roomLayoutEn: selectedRoom.en,
      lightingVi: selectedLighting.vi,
      lightingEn: selectedLighting.en,
      styleVi: `ảnh nội thất chân thực theo hướng ${selectedDirection.vi}, đúng thiết kế kỹ thuật, vật liệu rõ ràng, không tự thay đổi bố cục`,
      styleEn: `photorealistic ${selectedDirection.en} interior image, faithful to the technical cabinetry design, clear material detail, no layout changes`,
      extra: extra.value.trim()
    };
  }

  function refreshPrompt() {
    const model = normalizeModel(settings.model);
    const selectedOptions = readOptions();
    promptEnBox.value = buildAiPrompt(model, Object.assign({}, selectedOptions, { language: "en" }));
    promptViBox.value = buildAiPrompt(model, Object.assign({}, selectedOptions, { language: "vi" }));
  }

  function setExportTab(name) {
    const isExport = name === "export";
    exportTabButton.classList.toggle("is-active", isExport);
    promptTabButton.classList.toggle("is-active", !isExport);
    exportPane.classList.toggle("is-active", isExport);
    promptPane.classList.toggle("is-active", !isExport);
  }

  exportTabButton.addEventListener("click", () => setExportTab("export"));
  promptTabButton.addEventListener("click", () => setExportTab("prompt"));
  refreshButton.addEventListener("click", refreshPrompt);
  copyButton.addEventListener("click", async () => {
    refreshPrompt();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(promptEnBox.value);
    } else {
      promptEnBox.select();
      document.execCommand("copy");
    }
    promptStatus.textContent = t("export.copyDone", language);
  });
  downloadButton.addEventListener("click", async () => {
    downloadButton.disabled = true;
    refreshPrompt();
    status.textContent = t("export.statusGenerating", language);
    const pkg = await downloadAiImagePackage({
      model: settings.model,
      promptOptions: readOptions()
    });
    promptEnBox.value = pkg.promptEn;
    promptViBox.value = pkg.promptVi;
    const doneTpl = t("export.statusDone", language);
    status.textContent = typeof doneTpl === "function" ? doneTpl(pkg.files.length) : `${pkg.files.length}`;
    downloadButton.disabled = false;
  });

  panel.appendChild(el("h2", { text: settings.title || t("export.title", language) }));
  panel.appendChild(el("p", { text: settings.description || t("export.description", language) }));
  panel.appendChild(el("div", { class: "ide-export-tabs", role: "tablist" }, [exportTabButton, promptTabButton]));

  const guideSteps = t("export.guideSteps", language) || [];
  exportPane.appendChild(el("div", { class: "ide-export-guide" }, [
    el("strong", { text: t("export.guideTitle", language) }),
    el("ol", {}, guideSteps.map((step) => el("li", { text: step })))
  ]));
  exportPane.appendChild(el("div", { class: "ide-export-actions" }, [downloadButton, status]));

  promptPane.appendChild(el("div", { class: "ide-export-grid" }, [direction, color, material, room, lighting]));
  promptPane.appendChild(el("div", { class: "ide-export-field" }, [
    el("label", { text: t("export.labelExtra", language) }),
    extra
  ]));
  promptPane.appendChild(el("div", { class: "ide-export-actions" }, [refreshButton, copyButton, promptStatus]));
  promptPane.appendChild(el("div", { class: "ide-export-field", style: "margin-top:14px" }, [
    el("label", { text: t("export.labelPromptEn", language) }),
    promptEnBox
  ]));
  promptPane.appendChild(el("div", { class: "ide-export-field", style: "margin-top:14px" }, [
    el("label", { text: t("export.labelPromptVi", language) }),
    promptViBox
  ]));

  panel.appendChild(exportPane);
  panel.appendChild(promptPane);
  mount.innerHTML = "";
  mount.appendChild(panel);
  refreshPrompt();
  return panel;
}
