import { render } from "./ui/main-renderer.js";
import { reviewModel, attachDesignReviewPanel } from "./ui/review-panel.js";
import { attachAiImageExportPanel } from "./ui/ai-export-panel.js";
import { attachUploadPanel } from "./ui/upload-panel.js";
import { attachCompareSlider } from "./ui/compare-slider.js";
import { buildAiPrompt, createAiImagePackage, downloadAiImagePackage } from "./ai/prompt-builder.js";
import { analyzeImage, generateRender } from "./ai/image-analyzer.js";
import { getDesignDirections, buildIntakeChecklist } from "./core/i18n.js";
import { registerBuiltinElements, registerElement, getElement, listElements, factoryElement } from "./catalog/index.js";
import { BoxService } from "./catalog/services/box-service.js";
import { enableEditor } from "./editor/index.js";

registerBuiltinElements();

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
  reviewModel,
  registerElement,
  getElement,
  listElements,
  factoryElement,
  BoxService,
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
  registerElement,
  getElement,
  listElements,
  factoryElement,
  BoxService,
  analyzeImage,
  generateRender,
  enableEditor
};
