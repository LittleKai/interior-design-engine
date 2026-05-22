import { SVG_NS, svgEl, cm } from "../core/dom.js";
import { allItems, measureBox, isVisible } from "../core/model.js";
import { t } from "../core/i18n.js";
import { resolveItemBoxes } from "../core/box-resolver.js";
import { projectBoxToView } from "../template-engine/interpreter.js";
import { resolveToken, DEFAULT_PALETTE } from "../template-engine/color-tokens.js";

export function renderSvgView(model, mode, options) {
  const language = options && options.language === "en" ? "en" : "vi";
  const pad = 60;
  const palette = model.palette || DEFAULT_PALETTE;
  const projectedItems = collectProjectedItems(model, mode, palette);
  const measuredBox = measureBox(model, mode);
  const box = projectedItems.length ? projectedBounds(projectedItems, measuredBox) : measuredBox;
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

  projectedItems
    .sort((a, b) => (a.layer - b.layer) || (a.rect.depthKey - b.rect.depthKey))
    .forEach((entry) => drawProjectedItem(svg, entry, mode, scale, pad, box, palette));

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

function collectProjectedItems(model, mode, palette) {
  return allItems(model, mode)
    .filter((item) => isVisible(item, mode))
    .flatMap((item) => resolveItemBoxes(item, palette).map((box) => ({ item, box })))
    .map(({ item, box }) => ({ item, layer: item.layer || 0, rect: projectBoxToView(box, mode), opacity: box.opacity }))
    .filter((entry) => entry.rect);
}

function projectedBounds(entries, measuredBox) {
  const bounds = entries.reduce((acc, entry) => ({
    minX: Math.min(acc.minX, entry.rect.x),
    minY: Math.min(acc.minY, entry.rect.y),
    maxX: Math.max(acc.maxX, entry.rect.x + entry.rect.w),
    maxY: Math.max(acc.maxY, entry.rect.y + entry.rect.h)
  }), {
    minX: measuredBox.minA,
    minY: measuredBox.minB,
    maxX: measuredBox.minA + measuredBox.w,
    maxY: measuredBox.minB + measuredBox.h
  });
  return {
    w: Math.max(1, bounds.maxX - bounds.minX),
    h: Math.max(1, bounds.maxY - bounds.minY),
    minA: bounds.minX,
    minB: bounds.minY
  };
}

function drawProjectedItem(svg, entry, mode, scale, pad, bounds, palette) {
  const item = entry.item;
  const rect = entry.rect;
  const xValue = rect.x - bounds.minA;
  const yValue = rect.y - bounds.minB;
  const r = {
    x: pad + xValue * scale,
    y: pad + (mode === "plan" ? yValue : bounds.h - yValue - rect.h) * scale,
    w: Math.max(1, rect.w * scale),
    h: Math.max(1, rect.h * scale)
  };
  const g = svgEl("g", { class: "ide-item", "data-detail-id": item.id || "" });
  const fill = rect.fill || item.color || resolveToken(palette, "woodFront") || "#c89a62";
  const stroke = item.stroke || resolveToken(palette, "cabDark") || "#76502e";
  if (rect.kind === "ellipse") {
    g.appendChild(svgEl("ellipse", {
      cx: r.x + r.w / 2,
      cy: r.y + r.h / 2,
      rx: r.w / 2,
      ry: r.h / 2,
      fill,
      stroke,
      "stroke-width": item.strokeWidth || 1,
      opacity: entry.opacity == null ? 1 : entry.opacity
    }));
  } else {
    g.appendChild(svgEl("rect", {
      x: r.x,
      y: r.y,
      width: r.w,
      height: r.h,
      rx: (rect.radius || item.radius || 0) * scale,
      fill,
      stroke,
      "stroke-width": item.strokeWidth || 1,
      opacity: entry.opacity == null ? 1 : entry.opacity
    }));
  }
  drawItemLabel(g, item, r);
  svg.appendChild(g);
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
