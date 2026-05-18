import { svgEl } from "../../core/dom.js";

export default {
  name: "handle-knob",
  prototype: "detail",
  info: {
    titleVi: "Núm tròn",
    titleEn: "Knob handle",
    description: "Núm kéo tròn nhỏ."
  },
  properties: {
    width: 3,
    height: 3,
    depth: 2,
    materialRef: "metal-brushed"
  },
  render2D({ svg, item, r }) {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const radius = Math.max(1.5, Math.min(r.w, r.h) / 2);
    svg.appendChild(svgEl("circle", {
      cx,
      cy,
      r: radius,
      fill: item.color || "#a8a8a8",
      stroke: item.stroke || "#444",
      "stroke-width": Math.max(0.5, (item.strokeWidth || 1) * 0.7),
      opacity: item.opacity == null ? 1 : item.opacity
    }));
  },
  exportSpecRow(item) {
    return [item.label || "Núm tròn", `${item.width} cm`, item.materialRef || "metal"];
  }
};
