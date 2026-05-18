export const SVG_NS = "http://www.w3.org/2000/svg";

export function el(tag, attrs, children) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  });
  (children || []).forEach((child) => node.appendChild(child));
  return node;
}

export function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value == null || value === false) return;
    node.setAttribute(key, value);
  });
  return node;
}

export function cm(value) {
  return `${Number(value).toFixed(Number(value) % 1 ? 1 : 0)} cm`;
}

export function shade(hex, amount) {
  const color = String(hex || "#c89a62").replace("#", "");
  const normalized = color.length === 3 ? color.split("").map((c) => c + c).join("") : color;
  const num = parseInt(normalized, 16);
  if (Number.isNaN(num)) return hex;
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (num & 255) + amount));
  return `rgb(${r}, ${g}, ${b})`;
}
