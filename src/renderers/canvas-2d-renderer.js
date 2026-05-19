import { el, cm, shade } from "../core/dom.js";
import { allItems, modelBounds, isVisible } from "../core/model.js";

export function render3d(model) {
  const canvas = el("canvas", { class: "ide-render-3d" });
  let rotY = -0.55;
  let rotX = 0.25;
  let zoom = 1;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const bounds = modelBounds(model);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    draw();
  }

  function project(x, y, z) {
    const ctxW = canvas.width;
    const ctxH = canvas.height;
    const longest = Math.max(bounds.width, bounds.height, bounds.depth, 1);
    const S = Math.min(ctxW, ctxH) / longest * 0.72 * zoom;
    const cx = bounds.minX + bounds.width / 2;
    const cy = bounds.minY + bounds.height / 2;
    const cz = bounds.minZ + bounds.depth / 2;
    const px = x - cx;
    const py = y - cy;
    const pz = z - cz;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const rx = px * cosY + pz * sinY;
    const rz = -px * sinY + pz * cosY;
    const ry = py * cosX - rz * sinX;
    return [ctxW / 2 + rx * S, ctxH / 2 - ry * S + 28];
  }

  function face(ctx, pts, fill, stroke, alpha) {
    const first = project(pts[0][0], pts[0][1], pts[0][2]);
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    pts.slice(1).forEach((p) => {
      const q = project(p[0], p[1], p[2]);
      ctx.lineTo(q[0], q[1]);
    });
    ctx.closePath();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = stroke || "#76502e";
    ctx.lineWidth = window.devicePixelRatio || 1;
    ctx.stroke();
  }

  function box(ctx, item) {
    const x0 = item.x;
    const y0 = item.y;
    const z0 = item.z;
    const x1 = x0 + item.width;
    const y1 = y0 + item.height;
    const z1 = z0 + item.depth;
    const c = item.color || model.materials.board || "#c89a62";
    const alpha = item.opacity == null ? 1 : item.opacity;
    face(ctx, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], c, item.stroke, alpha);
    face(ctx, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(c, -24), item.stroke, alpha);
    face(ctx, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(c, 22), item.stroke, alpha);
    face(ctx, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], shade(c, -18), item.stroke, alpha);
  }

  function draw() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f6f1e8";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    allItems(model, "3d")
      .filter((item) => isVisible(item, "3d"))
      .slice()
      .sort((a, b) => (a.layer || 0) - (b.layer || 0))
      .forEach((item) => box(ctx, item));

    ctx.fillStyle = "#473d34";
    ctx.font = `${12 * (window.devicePixelRatio || 1)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`${cm(model.width)} x ${cm(model.height)} x ${cm(model.depth)}`, canvas.width / 2, canvas.height - 22);
  }

  canvas.addEventListener("mousedown", (event) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  window.addEventListener("mouseup", () => { dragging = false; });
  canvas.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    rotY += (event.clientX - lastX) * 0.008;
    rotX += (event.clientY - lastY) * 0.006;
    rotX = Math.max(-0.7, Math.min(0.75, rotX));
    lastX = event.clientX;
    lastY = event.clientY;
    draw();
  });
  canvas.addEventListener("wheel", (event) => {
    zoom *= event.deltaY > 0 ? 0.93 : 1.07;
    zoom = Math.max(0.5, Math.min(2.3, zoom));
    event.preventDefault();
    draw();
  }, { passive: false });
  canvas.addEventListener("dblclick", () => {
    rotY = -0.55;
    rotX = 0.25;
    zoom = 1;
    draw();
  });

  requestAnimationFrame(resize);
  window.addEventListener("resize", resize);
  return canvas;
}

export function renderStatic3dCanvas(model, width, height, view) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const bounds = modelBounds(model);
  const rotY = view && view.rotY != null ? view.rotY : -0.55;
  const rotX = view && view.rotX != null ? view.rotX : 0.25;
  const zoom = view && view.zoom != null ? view.zoom : 1;

  function project(x, y, z) {
    const longest = Math.max(bounds.width, bounds.height, bounds.depth, 1);
    const scale = Math.min(width, height) / longest * 0.72 * zoom;
    const cx = bounds.minX + bounds.width / 2;
    const cy = bounds.minY + bounds.height / 2;
    const cz = bounds.minZ + bounds.depth / 2;
    const px = x - cx;
    const py = y - cy;
    const pz = z - cz;
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const rx = px * cosY + pz * sinY;
    const rz = -px * sinY + pz * cosY;
    const ry = py * cosX - rz * sinX;
    return [width / 2 + rx * scale, height / 2 - ry * scale + 28];
  }

  function face(pts, fill, stroke, alpha) {
    const first = project(pts[0][0], pts[0][1], pts[0][2]);
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    pts.slice(1).forEach((p) => {
      const point = project(p[0], p[1], p[2]);
      ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = stroke || "#76502e";
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }

  function box(item) {
    const x0 = item.x;
    const y0 = item.y;
    const z0 = item.z;
    const x1 = x0 + item.width;
    const y1 = y0 + item.height;
    const z1 = z0 + item.depth;
    const color = item.color || model.materials.board || "#c89a62";
    const alpha = item.opacity == null ? 1 : item.opacity;
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], color, item.stroke, alpha);
    face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], shade(color, -24), item.stroke, alpha);
    face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], shade(color, 22), item.stroke, alpha);
    face([[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], shade(color, -18), item.stroke, alpha);
  }

  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, width, height);
  allItems(model, "3d")
    .filter((item) => isVisible(item, "3d"))
    .slice()
    .sort((a, b) => (a.layer || 0) - (b.layer || 0))
    .forEach(box);
  ctx.fillStyle = "#473d34";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${cm(model.width)} x ${cm(model.height)} x ${cm(model.depth)}`, width / 2, height - 26);
  return canvas;
}
