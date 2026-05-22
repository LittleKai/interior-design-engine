import { render } from "./ui/main-renderer.js";
import { reviewModel, attachDesignReviewPanel } from "./ui/review-panel.js";
import { attachAiImageExportPanel } from "./ui/ai-export-panel.js";
import { attachUploadPanel } from "./ui/upload-panel.js";
import { attachCompareSlider } from "./ui/compare-slider.js";
import { buildAiPrompt, createAiImagePackage, downloadAiImagePackage } from "./ai/prompt-builder.js";
import { analyzeImage, generateRender } from "./ai/image-analyzer.js";
import { getDesignDirections, buildIntakeChecklist } from "./core/i18n.js";
import { validateModel } from "./core/validation.js";
import { enableEditor } from "./editor/index.js";
import { loadTemplateCatalog, getTemplate } from "./template-engine/loader.js";
import { listPalettes } from "./template-engine/color-tokens.js";

const InteriorDesigner = {
  render,
  createAiImagePackage,
  downloadAiImagePackage,
  attachAiImageExportPanel,
  attachDesignReviewPanel,
  attachUploadPanel,
  attachCompareSlider,
  buildAiPrompt,
  getDesignDirections,
  buildIntakeChecklist,
  validateModel,
  reviewModel,
  loadTemplateCatalog,
  getTemplate,
  listPalettes,
  analyzeImage,
  generateRender,
  enableEditor
};

if (typeof window !== "undefined") {
  window.InteriorDesigner = InteriorDesigner;
}

export default InteriorDesigner;
export {
  render,
  reviewModel,
  attachDesignReviewPanel,
  attachAiImageExportPanel,
  attachUploadPanel,
  attachCompareSlider,
  buildAiPrompt,
  createAiImagePackage,
  downloadAiImagePackage,
  getDesignDirections,
  buildIntakeChecklist,
  validateModel,
  loadTemplateCatalog,
  getTemplate,
  listPalettes,
  analyzeImage,
  generateRender,
  enableEditor
};
