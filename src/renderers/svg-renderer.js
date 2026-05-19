import { SVG_NS, svgEl, cm } from "../core/dom.js";
import { allItems, measureBox, itemProjection, isVisible } from "../core/model.js";
import { t } from "../core/i18n.js";
import { getTemplate } from "../template-engine/loader.js";
import { getInstance } from "../template-engine/dispatcher.js";
import { renderTemplate } from "../template-engine/interpreter.js";

export function renderSvgView(model, mode, options) {
  const language = options && options.language === "en" ? "en" : "vi";
  const pad = 60;
  const box = measureBox(model, mode);
  const maxW = mode === "side" ? 660 : 960;
  const maxH = mode === "plan" ? 560 : 680;
  const scale = Math.min((maxW - pad * 2) / box.w, (maxH - pad * 2) / box.h);
  const vbW = Math.ceil(box.w * scale + pad * 2);
  const vbH = Math.ceil(box.h * scale + pad * 2);
  const tabLabel = t(`tabs.${mode}`, language);
  const svg = svgEl("svg", {
    class: "ide-svg",
    viewBox: `0 0 ${vbW} ${vbH}`,
    role: "img",
    "aria-label": tabLabel
  });

  const defs = svgEl("defs");
  defs.innerHTML = [
    '<marker id="ide-arrow-end" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#9b8f7d"/></marker>',
    '<marker id="ide-arrow-start" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7,0 L0,3.5 L7,7 Z" fill="#9b8f7d"/></marker>'
  ].join("");
  svg.appendChild(defs);

  svg.appendChild(svgEl("rect", {
    x: pad,
    y: pad,
    width: box.w * scale,
    height: box.h * scale,
    fill: "#eee7dc",
    stroke: "#b9ad9d",
    "stroke-width": 1
  }));

  allItems(model, mode)
    .filter((item) => isVisible(item, mode))
    .slice()
    .sort((a, b) => (a.layer || 0) - (b.layer || 0))
    .forEach((item) => drawSvgItem(svg, item, mode, scale, pad, model));

  drawDimension(svg, pad, vbH - 26, pad + box.w * scale, vbH - 26, cm(box.w), false);
  drawDimension(svg, vbW - 28, pad, vbW - 28, pad + box.h * scale, cm(box.h), true);

  const caption = svgEl("text", {
    x: pad,
    y: 24,
    fill: "#756c60",
    "font-size": 12,
    "font-family": "Arial, Helvetica, sans-serif"
  });
  caption.textContent = `${tabLabel} - ${cm(box.w)} x ${cm(box.h)}`;
  svg.appendChild(caption);

  return svg;
}

function drawSvgItem(svg, item, mode, scale, pad, model) {
  const r = itemProjection(item, mode, scale, pad, model);
  const g = svgEl("g", { class: "ide-item", "data-detail-id": item.id || "" });

  if (item._isTemplate && item.tpl) {
    const template = getTemplate(item.tpl);
    if (template) {
      renderTemplate(template, getInstance(item), mode, model.palette).forEach((shape) => {
        appendTemplateShape(g, shape, r, item);
      });
      svg.appendChild(g);
      return;
    }
  }

  if (item.kind === "arc" && mode === "plan") {
    g.appendChild(svgEl("path", {
      d: `M ${r.x} ${r.y + r.h} A ${r.w} ${r.h} 0 0 1 ${r.x + r.w} ${r.y}`,
      fill: "none",
      stroke: item.stroke || "#9b8f7d",
      "stroke-width": item.strokeWidth || 1,
      "stroke-dasharray": item.dash || "4 3"
    }));
    svg.appendChild(g);
    return;
  }

  g.appendChild(svgEl("rect", {
    x: r.x,
    y: r.y,
    width: r.w,
    height: r.h,
    rx: item.radius || 0,
    fill: item.color || model.materials.board || "#c89a62",
    stroke: item.stroke || "#76502e",
    "stroke-width": item.strokeWidth || 1,
    opacity: item.opacity == null ? 1 : item.opacity
  }));

  drawItemLabel(g, item, r);
  svg.appendChild(g);
}

function appendTemplateShape(g, shape, r, item) {
  const sx = r.w / Math.max(1, item.width);
  const sy = r.h / Math.max(1, item.height);
  const tx = (value) => r.x + value * sx;
  const ty = (value) => r.y + value * sy;
  if (shape.type === "line") {
    g.appendChild(svgEl("line", {
      x1: tx(shape.x1), y1: ty(shape.y1), x2: tx(shape.x2), y2: ty(shape.y2),
      stroke: shape.stroke || "#3a3a42",
      "stroke-width": shape.sw || 1,
      opacity: shape.opacity == null ? 1 : shape.opacity
    }));
    return;
  }
  if (shape.type === "text") {
    const text = svgEl("text", {
      x: tx(shape.x), y: ty(shape.y),
      "text-anchor": shape.anchor || "middle",
      fill: shape.fill || "#51483e",
      "font-size": shape.fontSize || 10,
      "font-family": "Arial, Helvetica, sans-serif"
    });
    text.textContent = shape.text || "";
    g.appendChild(text);
    return;
  }
  g.appendChild(svgEl("rect", {
    x: tx(shape.x || 0),
    y: ty(shape.y || 0),
    width: Math.max(1, (shape.w || 0) * sx),
    height: Math.max(1, (shape.h || 0) * sy),
    rx: shape.rx || 0,
    fill: shape.fill || "#c89a62",
    stroke: shape.stroke || "none",
    "stroke-width": shape.sw || 1,
    opacity: shape.opacity == null ? 1 : shape.opacity
  }));
}

function drawItemLabel(svg, item, r) {
  if (item.hideLabel || r.w <= 34 || r.h <= 18) return;
  const label = svgEl("text", {
    x: r.x + r.w / 2,
    y: r.y + r.h / 2 + 4,
    "text-anchor": "middle",
    "font-size": Math.min(13, Math.max(8, r.w / 18)),
    fill: item.textColor || "#33291f",
    "font-family": "Arial, Helvetica, sans-serif"
  });
  label.textContent = item.label || item.type || "";
  svg.appendChild(label);
}

function drawDimension(svg, x1, y1, x2, y2, text, vertical) {
  svg.appendChild(svgEl("line", {
    x1, y1, x2, y2,
    stroke: "#9b8f7d",
    "stroke-width": 1,
    "marker-start": "url(#ide-arrow-start)",
    "marker-end": "url(#ide-arrow-end)"
  }));
  const label = svgEl("text", {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2 + 4,
    "text-anchor": "middle",
    fill: "#51483e",
    "font-size": 12,
    "font-weight": 700,
    "font-family": "Arial, Helvetica, sans-serif"
  });
  if (vertical) label.setAttribute("transform", `rotate(90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})`);
  label.textContent = text;
  svg.appendChild(label);
}

export function cloneSvgForExport(svg, width, height) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("width", width);
  clone.setAttribute("height", height);
  return clone;
}

export function svgToPngDataUrl(svg, width, height) {
  return new Promise((resolve, reject) => {
    const serialized = new XMLSerializer().serializeToString(cloneSvgForExport(svg, width, height));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f6f1e8";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialized)}`;
  });
}
