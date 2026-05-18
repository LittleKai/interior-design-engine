import { svgEl } from "../../core/dom.js";

export default {
  name: "void-cavity",
  prototype: "detail",
  info: {
    titleVi: "Khoang rỗng",
    titleEn: "Cavity / opening",
    description: "Khoang rỗng kỹ thuật, không có vật liệu — dùng cho lỗ máy lạnh, ô chờ thiết bị."
  },
  properties: {
    width: 60,
    height: 30,
    depth: 30,
    materialRef: null
  },
  render2D({ svg, item, r }) {
    svg.appendChild(svgEl("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      fill: item.color || "#ebe4d9",
      stroke: item.stroke || "#9b8f7d",
      "stroke-width": item.strokeWidth || 1,
      "stroke-dasharray": item.dash || "5 4",
      opacity: item.opacity == null ? 0.6 : item.opacity
    }));
  },
  exportSpecRow(item) {
    return [item.label || "Khoang rỗng", `${item.width}x${item.height} cm`, "void"];
  }
};
