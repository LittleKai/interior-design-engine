import { svgEl } from "../../core/dom.js";

export default {
  name: "door-shaker",
  prototype: "detail",
  info: {
    titleVi: "Cánh Shaker",
    titleEn: "Shaker door",
    description: "Cánh phẳng có rãnh viền tạo khung Shaker."
  },
  properties: {
    width: 60,
    height: 200,
    depth: 2,
    materialRef: "wood-oak",
    handleSide: "right",
    frameWidth: 6
  },
  render2D({ svg, item, r, model }) {
    const fill = item.color || (model.materials && model.materials.board) || "#c89a62";
    const frameWidth = Math.max(2, Math.min(r.w, r.h) * 0.08);
    svg.appendChild(svgEl("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      fill,
      stroke: item.stroke || "#76502e",
      "stroke-width": item.strokeWidth || 1,
      opacity: item.opacity == null ? 1 : item.opacity
    }));
    if (r.w > frameWidth * 2.4 && r.h > frameWidth * 2.4) {
      svg.appendChild(svgEl("rect", {
        x: r.x + frameWidth,
        y: r.y + frameWidth,
        width: r.w - frameWidth * 2,
        height: r.h - frameWidth * 2,
        fill: "none",
        stroke: item.stroke || "#76502e",
        "stroke-width": Math.max(0.7, (item.strokeWidth || 1) * 0.8),
        opacity: item.opacity == null ? 1 : item.opacity
      }));
    }
  },
  exportSpecRow(item) {
    return [item.label || "Cánh Shaker", `${item.width}x${item.height} cm`, item.materialRef || "wood"];
  }
};
