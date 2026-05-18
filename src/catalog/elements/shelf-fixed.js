import { svgEl } from "../../core/dom.js";

export default {
  name: "shelf-fixed",
  prototype: "detail",
  info: {
    titleVi: "Kệ cố định",
    titleEn: "Fixed shelf",
    description: "Tấm kệ ngang cố định."
  },
  properties: {
    width: 80,
    height: 1.8,
    depth: 58,
    materialRef: "wood-oak"
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
      "stroke-width": Math.max(0.7, (item.strokeWidth || 1) * 0.9),
      opacity: item.opacity == null ? 1 : item.opacity
    }));
  },
  exportSpecRow(item) {
    return [item.label || "Kệ cố định", `${item.width}x${item.depth} cm`, item.materialRef || "wood"];
  }
};
