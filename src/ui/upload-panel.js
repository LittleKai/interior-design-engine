import { el } from "../core/dom.js";
import { t, pickLang } from "../core/i18n.js";
import { analyzeImage } from "../ai/image-analyzer.js";
import { attachCompareSlider } from "./compare-slider.js";

export function attachUploadPanel(options) {
  const mount = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
  if (!mount) throw new Error("attachUploadPanel: mount not found");
  const language = pickLang(options.language);
  const onModel = typeof options.onModel === "function" ? options.onModel : null;

  const panel = el("section", { class: "ide-upload-panel" });
  panel.appendChild(el("h2", { class: "ide-upload-title", text: t("upload.title", language) }));
  panel.appendChild(el("p", { class: "ide-upload-desc", text: t("upload.desc", language) }));

  const dropZone = el("label", { class: "ide-upload-drop" });
  const fileInput = el("input", { type: "file", accept: "image/*", class: "ide-upload-file" });
  const dropMsg = el("span", { class: "ide-upload-droplabel", text: t("upload.dropLabel", language) });
  const preview = el("img", { class: "ide-upload-preview", alt: "preview" });
  preview.style.display = "none";
  dropZone.appendChild(fileInput);
  dropZone.appendChild(dropMsg);
  dropZone.appendChild(preview);
  panel.appendChild(dropZone);

  const hintsField = el("textarea", {
    class: "ide-upload-hints",
    placeholder: t("upload.hintsPlaceholder", language),
    rows: 3
  });
  panel.appendChild(el("label", { class: "ide-upload-fieldlabel", text: t("upload.hintsLabel", language) }));
  panel.appendChild(hintsField);

  const actions = el("div", { class: "ide-upload-actions" });
  const submit = el("button", { type: "button", class: "ide-upload-submit", text: t("upload.btnAnalyze", language) });
  const status = el("span", { class: "ide-upload-status", text: "" });
  actions.appendChild(submit);
  actions.appendChild(status);
  panel.appendChild(actions);

  const result = el("div", { class: "ide-upload-result" });
  panel.appendChild(result);

  let selectedFile = null;
  let beforeUrl = null;

  function setStatus(stage) {
    if (!stage) { status.textContent = ""; return; }
    if (stage === "resizing") status.textContent = t("upload.statusResizing", language);
    else if (stage === "uploading") status.textContent = t("upload.statusUploading", language);
    else if (stage === "analyzing") status.textContent = t("upload.statusAnalyzing", language);
    else if (stage === "done") status.textContent = t("upload.statusDone", language);
    else if (stage === "error") status.textContent = t("upload.statusError", language);
  }

  function pickFile(file) {
    selectedFile = file;
    if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    beforeUrl = URL.createObjectURL(file);
    preview.src = beforeUrl;
    preview.style.display = "block";
    dropMsg.textContent = file.name;
  }

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) pickFile(file);
  });
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("is-drag");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-drag"));
  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("is-drag");
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) pickFile(file);
  });

  submit.addEventListener("click", async () => {
    if (!selectedFile) {
      setStatus("error");
      status.textContent = t("upload.errNoFile", language);
      return;
    }
    submit.disabled = true;
    result.innerHTML = "";
    try {
      const analyzed = await analyzeImage(selectedFile, {
        hints: hintsField.value,
        token: options.token,
        apiBase: options.apiBase,
        uploadApi: options.uploadApi,
        onProgress: ({ stage }) => setStatus(stage)
      });
      setStatus("done");
      if (onModel) onModel(analyzed.model, analyzed);
      renderResult(analyzed);
    } catch (error) {
      setStatus("error");
      status.textContent = error.message || t("upload.statusError", language);
    } finally {
      submit.disabled = false;
    }
  });

  function renderResult(analyzed) {
    result.innerHTML = "";
    const summary = el("p", { class: "ide-upload-summary" });
    summary.textContent = `${analyzed.model.title || "Model"} — ${t("upload.modelMeta", language)}: ${analyzed.meta?.usedModel || "?"}${analyzed.meta?.cached ? ` (${t("upload.cached", language)})` : ""}`;
    result.appendChild(summary);

    if (typeof options.renderPreview === "function") {
      const previewMount = el("div", { class: "ide-upload-preview-mount" });
      result.appendChild(previewMount);
      Promise.resolve(options.renderPreview({ mount: previewMount, model: analyzed.model, beforeUrl }))
        .then((afterDataUrl) => {
          if (afterDataUrl && beforeUrl) {
            const compareMount = el("div", { class: "ide-upload-compare-mount" });
            result.appendChild(compareMount);
            attachCompareSlider({
              mount: compareMount,
              before: beforeUrl,
              after: afterDataUrl,
              beforeLabel: t("upload.labelBefore", language),
              afterLabel: t("upload.labelAfter", language)
            });
          }
        })
        .catch(() => { /* ignore */ });
    }
  }

  mount.appendChild(panel);
  return {
    destroy() {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
      panel.remove();
    }
  };
}
