import { svgEl } from "../../core/dom.js";

export default {
  name: "handle-bar",
  prototype: "detail",
  info: {
    titleVi: "Tay nắm thanh",
    titleEn: "Bar handle",
    description: "Tay nắm thanh ngang kim loại."
  },
  properties: {
    width: 12,
    height: 1.8,
    depth: 2.5,
    materialRef: "metal-black"
  },
  render2D({ svg, item, r }) {
    const fill = item.color || "#2a2a2a";
    svg.appendChild(svgEl("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      rx: Math.min(r.h, 2),
      fill,
      stroke: item.stroke || "#000",
      "stroke-width": Math.max(0.5, (item.strokeWidth || 1) * 0.7),
      opacity: item.opacity == null ? 1 : item.opacity
    }));
  },
  exportSpecRow(item) {
    return [item.label || "Tay nắm thanh", `${item.width} cm`, item.materialRef || "metal"];
  }
};
