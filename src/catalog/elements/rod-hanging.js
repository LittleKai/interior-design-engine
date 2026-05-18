import { svgEl } from "../../core/dom.js";

export default {
  name: "rod-hanging",
  prototype: "detail",
  info: {
    titleVi: "Thanh treo quần áo",
    titleEn: "Hanging rod",
    description: "Thanh kim loại tròn treo quần áo."
  },
  properties: {
    width: 80,
    height: 2.5,
    depth: 2.5,
    materialRef: "metal-brushed"
  },
  render2D({ svg, item, r, mode }) {
    const fill = item.color || "#9a9a9a";
    if (mode === "plan") {
      const cy = r.y + r.h / 2;
      svg.appendChild(svgEl("line", {
        x1: r.x,
        x2: r.x + r.w,
        y1: cy,
        y2: cy,
        stroke: fill,
        "stroke-width": Math.max(2, Math.min(r.h, 4)),
        "stroke-linecap": "round",
        opacity: item.opacity == null ? 1 : item.opacity
      }));
      return;
    }
    svg.appendChild(svgEl("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      rx: Math.min(r.h, 2),
      fill,
      stroke: item.stroke || "#555",
      "stroke-width": Math.max(0.5, (item.strokeWidth || 1) * 0.7),
      opacity: item.opacity == null ? 1 : item.opacity
    }));
  },
  exportSpecRow(item) {
    return [item.label || "Thanh treo", `${item.width} cm`, item.materialRef || "metal"];
  }
};
