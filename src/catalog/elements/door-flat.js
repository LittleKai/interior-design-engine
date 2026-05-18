import { svgEl } from "../../core/dom.js";

export default {
  name: "door-flat",
  prototype: "detail",
  info: {
    titleVi: "Cánh phẳng",
    titleEn: "Flat door",
    description: "Cánh tủ phẳng, không có rãnh viền."
  },
  properties: {
    width: 60,
    height: 200,
    depth: 2,
    materialRef: "laminate-white"
  },
  render2D({ svg, item, r, model }) {
    const fill = item.color || (model.materials && model.materials.board) || "#c89a62";
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
  },
  exportSpecRow(item) {
    return [item.label || "Cánh phẳng", `${item.width}x${item.height} cm`, item.materialRef || "laminate"];
  }
};
