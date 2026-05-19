import { cm } from "../core/dom.js";
import { normalizeModel } from "../core/model.js";
import { renderSvgView, svgToPngDataUrl } from "../renderers/svg-renderer.js";
import { renderStatic3dCanvas } from "../renderers/iso-renderer.js";

const TEMPLATE_CATALOG_SUMMARY_VI = [
  "DANH MUC TEMPLATE UU TIEN: upper-2door, upper-glass-2door, sliding-2door, sliding-3door, ac-recess-fold, open-bookshelf, l-desk-return.",
  "Khi mo ta thiet ke, uu tien dung module co tpl phu hop thay vi box tho. Neu khong co template match thi moi dung module legacy."
].join("\n");

function compactItems(items, language) {
  return (items || [])
    .filter((item) => !item.hideFromPrompt)
    .map((item) => {
      const name = item.label || item.type || item.id;
      if (language === "vi") {
        return `${name}: x ${cm(item.x)}, y ${cm(item.y)}, z ${cm(item.z)}, rộng ${cm(item.width)}, cao ${cm(item.height)}, sâu ${cm(item.depth)}`;
      }
      return `${name}: x ${cm(item.x)}, y ${cm(item.y)}, z ${cm(item.z)}, ${cm(item.width)} wide, ${cm(item.height)} high, ${cm(item.depth)} deep`;
    })
    .slice(0, 44);
}

export function buildAiPrompt(model, options) {
  const promptOptions = Object.assign({
    language: "en",
    colorScheme: "",
    colorSchemeVi: "gỗ sồi ấm kết hợp gỗ óc chó, tay nắm đen mờ",
    colorSchemeEn: "warm oak and walnut wood, matte black handles",
    material: "",
    materialVi: "veneer gỗ tự nhiên, hoàn thiện satin, vân gỗ nhẹ và chân thực",
    materialEn: "natural wood veneer, satin finish, subtle visible grain",
    roomLayout: "",
    roomLayoutVi: "phòng ngủ hiện đại diện tích nhỏ, hệ tủ đặt sát một mảng tường",
    roomLayoutEn: "modern compact bedroom with the cabinet built against one wall",
    camera: "",
    cameraVi: "góc chụp ngang tầm mắt, ống kính 28mm, phối cảnh nội thất chân thực",
    cameraEn: "eye-level interior photography, 28mm lens, realistic perspective",
    lighting: "",
    lightingVi: "ánh sáng tự nhiên mềm từ cửa sổ gần đó kết hợp ánh sáng nội thất ấm",
    lightingEn: "soft daylight from a nearby window plus warm ambient interior lighting",
    style: "",
    styleVi: "ảnh nội thất chân thực của hệ tủ áo built-in kết hợp khu làm việc",
    styleEn: "photorealistic built-in wardrobe and workstation interior",
    extra: ""
  }, options || {});
  const language = promptOptions.language === "vi" ? "vi" : "en";
  const pick = (key) => promptOptions[`${key}${language === "vi" ? "Vi" : "En"}`] || promptOptions[key];

  const moduleSummary = compactItems(model.modules, language).join("; ");
  const detailSummary = compactItems(model.details, language).join("; ");

  if (language === "vi") {
    const negativeVi = [
      "không thay đổi tỷ lệ kích thước đã đo",
      "không bỏ khu bàn làm việc chữ L nếu có trong bản vẽ",
      "không bỏ ô chờ máy lạnh nếu có trong bản vẽ",
      "không tự thêm khoang tủ ngoài thiết kế",
      "tránh phối cảnh méo, cánh tủ cong vênh, chi tiết lơ lửng, bản lề phi thực tế, chiều sâu sai"
    ].join(", ");

    return [
      `Tạo một ảnh nội thất chân thực dựa chính xác trên thiết kế hệ tủ trong ảnh tham chiếu.`,
      `Kích thước tổng thể: rộng ${cm(model.width)}, cao ${cm(model.height)}, sâu ${cm(model.depth)} cho hệ tủ chính.`,
      `Định hướng hình ảnh: ${pick("style")}.`,
      `Màu sắc và hoàn thiện: ${pick("colorScheme")}.`,
      `Vật liệu: ${pick("material")}.`,
      `Bố trí phòng: ${pick("roomLayout")}.`,
      `Góc máy: ${pick("camera")}.`,
      `Ánh sáng: ${pick("lighting")}.`,
      `Các khu chính: ${moduleSummary}.`,
      `Chi tiết cấu tạo quan trọng: ${detailSummary}.`,
      TEMPLATE_CATALOG_SUMMARY_VI,
      `Giữ đúng tỷ lệ, vị trí, khoảng trống, cánh trượt, kệ, mặt bàn, tay nắm, thanh treo và ô máy lạnh theo các ảnh tham chiếu mặt đứng/mặt bên/mặt bằng/3D đính kèm.`,
      promptOptions.extra ? `Yêu cầu bổ sung của người dùng: ${promptOptions.extra}.` : "",
      `Yêu cầu tránh: ${negativeVi}.`
    ].filter(Boolean).join("\n");
  }

  const negativeEn = [
    "do not change the measured proportions",
    "do not remove the L-shaped desk if it appears in the reference drawings",
    "do not remove the air-conditioner opening if it appears in the reference drawings",
    "do not add extra cabinet bays outside the design",
    "avoid distorted perspective, warped doors, floating parts, impossible hinges, incorrect depth"
  ].join(", ");

  return [
    `Create a photorealistic interior image based exactly on the attached cabinetry reference design.`,
    `Overall dimensions: ${cm(model.width)} wide, ${cm(model.height)} high, ${cm(model.depth)} deep for the main cabinet system.`,
    `Image direction: ${pick("style")}.`,
    `Color and finish: ${pick("colorScheme")}.`,
    `Materials: ${pick("material")}.`,
    `Room layout: ${pick("roomLayout")}.`,
    `Camera: ${pick("camera")}.`,
    `Lighting: ${pick("lighting")}.`,
    `Main zones: ${moduleSummary}.`,
    `Important construction details: ${detailSummary}.`,
    TEMPLATE_CATALOG_SUMMARY_VI,
    `Keep all major proportions, positions, openings, sliding doors, shelves, desk surfaces, handles, rods, and AC bay consistent with the attached front/side/plan/3D reference images.`,
    promptOptions.extra ? `Additional user preference, translated from the user's note if needed: ${promptOptions.extra}.` : "",
    `Negative instructions: ${negativeEn}.`
  ].filter(Boolean).join("\n");
}

function buildAiImageGuide(model) {
  return [
    "HƯỚNG DẪN TẠO ẢNH AI",
    "",
    "1. Tải toàn bộ file reference-*.png lên công cụ AI tạo ảnh.",
    "2. Khuyến nghị dùng file ai-image-prompt-en.txt vì prompt tiếng Anh thường cho kết quả ổn định hơn với nhiều công cụ tạo ảnh.",
    "3. File ai-image-prompt-vi.txt dùng để người dùng kiểm tra nội dung bằng tiếng Việt hoặc dùng với công cụ hỗ trợ tiếng Việt tốt.",
    "4. Chọn chế độ image-to-image hoặc reference image nếu có.",
    "5. Ưu tiên giữ đúng tỷ lệ, vị trí khoang tủ, cánh, kệ, bàn, tay nắm và các khoảng trống kỹ thuật.",
    "",
    `Kích thước model: rộng ${cm(model.width)}, cao ${cm(model.height)}, sâu ${cm(model.depth)}.`,
    "File design-model.json dùng để lưu dữ liệu kỹ thuật hoặc đưa lại vào Interior Design Engine."
  ].join("\n");
}

export async function createAiImagePackage(options) {
  const settings = Object.assign({
    views: ["front", "side", "plan", "3d"],
    imageWidth: 1600,
    imageHeight: 1100,
    promptOptions: {}
  }, options || {});
  const model = normalizeModel(settings.model || {});
  const files = [];

  for (const view of settings.views) {
    if (view === "3d") {
      const canvas = renderStatic3dCanvas(model, settings.imageWidth, settings.imageHeight, settings.view3d);
      files.push({
        name: "reference-3d.png",
        type: "image/png",
        view,
        dataUrl: canvas.toDataURL("image/png")
      });
    } else {
      const svg = renderSvgView(model, view);
      files.push({
        name: `reference-${view}.png`,
        type: "image/png",
        view,
        dataUrl: await svgToPngDataUrl(svg, settings.imageWidth, settings.imageHeight)
      });
    }
  }

  const promptEn = buildAiPrompt(model, Object.assign({}, settings.promptOptions, { language: "en" }));
  const promptVi = buildAiPrompt(model, Object.assign({}, settings.promptOptions, { language: "vi" }));
  files.push({
    name: "ai-image-prompt-en.txt",
    type: "text/plain",
    view: "prompt-en",
    text: promptEn,
    dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(promptEn)}`
  });
  files.push({
    name: "ai-image-prompt-vi.txt",
    type: "text/plain",
    view: "prompt-vi",
    text: promptVi,
    dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(promptVi)}`
  });
  const guide = buildAiImageGuide(model);
  files.push({
    name: "huong-dan-tao-anh-ai.txt",
    type: "text/plain",
    view: "guide",
    text: guide,
    dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(guide)}`
  });
  files.push({
    name: "design-model.json",
    type: "application/json",
    view: "model",
    text: JSON.stringify(model, null, 2),
    dataUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(model, null, 2))}`
  });

  return { model, files, prompt: promptEn, promptEn, promptVi };
}

function downloadFile(file) {
  const link = document.createElement("a");
  link.href = file.dataUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadAiImagePackage(options) {
  const pkg = await createAiImagePackage(options);
  pkg.files.forEach((file, index) => {
    setTimeout(() => downloadFile(file), index * 160);
  });
  return pkg;
}
