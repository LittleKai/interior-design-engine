import { svgEl } from "../../core/dom.js";

export default {
  name: "drawer-front",
  prototype: "detail",
  info: {
    titleVi: "Mặt ngăn kéo",
    titleEn: "Drawer front",
    description: "Mặt trước ngăn kéo có vệt rãnh tay nắm âm dưới đỉnh."
  },
  properties: {
    width: 80,
    height: 16,
    depth: 2,
    materialRef: "wood-walnut"
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
    const grooveInset = Math.max(2, r.w * 0.06);
    const grooveY = r.y + Math.max(2, r.h * 0.18);
    if (r.w - grooveInset * 2 > 4) {
      svg.appendChild(svgEl("line", {
        x1: r.x + grooveInset,
        x2: r.x + r.w - grooveInset,
        y1: grooveY,
        y2: grooveY,
        stroke: item.stroke || "#5b3d22",
        "stroke-width": Math.max(0.6, (item.strokeWidth || 1) * 0.6),
        opacity: 0.75
      }));
    }
  },
  exportSpecRow(item) {
    return [item.label || "Ngăn kéo", `${item.width}x${item.height} cm`, item.materialRef || "wood"];
  }
};
