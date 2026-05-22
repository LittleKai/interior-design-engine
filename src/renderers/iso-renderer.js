import { el, cm } from "../core/dom.js";
import { allItems, modelBounds, isVisible } from "../core/model.js";
import { resolveItemBoxes, defaultFaces } from "../core/box-resolver.js";
import { resolveToken, DEFAULT_PALETTE } from "../template-engine/color-tokens.js";

export class IsoRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.canvas = el("canvas", { class: "ide-render-3d" });
    this.rotY = options.rotY == null ? -0.55 : options.rotY;
    this.rotX = options.rotX == null ? 0.25 : options.rotX;
    this.zoom = options.zoom || 1;
    this.palette = options.palette || DEFAULT_PALETTE;
    this.model = null;
    this.bounds = null;
    this.dimensionsVisible = false;
    this.dragging = false;
    this.lastX = 0;
    this.lastY = 0;
    this.resize = this.resize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  mount() {
    this.container.appendChild(this.canvas);
    this.canvas.addEventListener("mousedown", (event) => {
      this.dragging = true;
      this.lastX = event.clientX;
      this.lastY = event.clientY;
    });
    this.canvas.addEventListener("wheel", (event) => {
      this.setZoom(this.zoom * (event.deltaY > 0 ? 0.93 : 1.07));
      event.preventDefault();
    }, { passive: false });
    this.canvas.addEventListener("dblclick", () => this.resetView());
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  update(model) {
    this.model = model;
    this.palette = model.palette || this.palette || DEFAULT_PALETTE;
    this.bounds = modelBounds(model);
    this.resize();
  }

  setRotation(rotY, rotX) {
    this.rotY = rotY;
    this.rotX = Math.max(-0.7, Math.min(0.75, rotX));
    this.draw();
  }

  setZoom(z) {
    this.zoom = Math.max(0.5, Math.min(2.3, z));
    this.draw();
  }

  resetView() {
    this.rotY = -0.55;
    this.rotX = 0.25;
    this.zoom = 1;
    this.draw();
  }

  setDimensionsVisible(visible) {
    this.dimensionsVisible = Boolean(visible);
    this.draw();
  }

  setPalette(paletteId) {
    this.palette = paletteId || DEFAULT_PALETTE;
    if (this.model) this.model.palette = this.palette;
    this.draw();
  }

  exportPNG({ width, height } = {}) {
    if (width && height) {
      return renderStatic3dCanvas(this.model, width, height, { rotY: this.rotY, rotX: this.rotX, zoom: this.zoom, palette: this.palette }).toDataURL("image/png");
    }
    return this.canvas.toDataURL("image/png");
  }

  dispose() {
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("resize", this.resize);
    this.canvas.remove();
    this.model = null;
  }

  onMouseMove(event) {
    if (!this.dragging) return;
    this.setRotation(this.rotY + (event.clientX - this.lastX) * 0.008, this.rotX + (event.clientY - this.lastY) * 0.006);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp() {
    this.dragging = false;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.max(1, Math.floor((rect.width || 960) * dpr));
    this.canvas.height = Math.max(1, Math.floor((rect.height || 560) * dpr));
    this.draw();
  }

  project(x, y, z) {
    const bounds = this.bounds || modelBounds(this.model || {});
    const longest = Math.max(bounds.width, bounds.height, bounds.depth, 1);
    const scale = Math.min(this.canvas.width, this.canvas.height) / longest * 0.72 * this.zoom;
    const cx = bounds.minX + bounds.width / 2;
    const cy = bounds.minY + bounds.height / 2;
    const cz = bounds.minZ + bounds.depth / 2;
    const px = x - cx;
    const py = y - cy;
    const pz = z - cz;
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const rx = px * cosY + pz * sinY;
    const rz = -px * sinY + pz * cosY;
    const ry = py * cosX - rz * sinX;
    return [this.canvas.width / 2 + rx * scale, this.canvas.height / 2 - ry * scale + 28];
  }

  face(ctx, points, fill, stroke, alpha) {
    if (!fill) return;
    const first = this.project(points[0][0], points[0][1], points[0][2]);
    ctx.beginPath();
    ctx.moveTo(first[0], first[1]);
    points.slice(1).forEach((point) => {
      const p = this.project(point[0], point[1], point[2]);
      ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.globalAlpha = alpha == null ? 1 : alpha;
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = stroke || resolveToken(this.palette, "cabDark") || "#2e2e35";
    ctx.lineWidth = window.devicePixelRatio || 1;
    ctx.stroke();
  }

  drawBox(ctx, box) {
    const x0 = box.x;
    const y0 = box.y;
    const z0 = box.z;
    const x1 = x0 + box.w;
    const y1 = y0 + box.h;
    const z1 = z0 + box.d;
    const faces = Object.assign({}, defaultFaces(this.palette), box.faces || {});
    this.face(ctx, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], faces.bottom, faces.stroke, box.opacity);
    this.face(ctx, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], faces.back, faces.stroke, box.opacity);
    this.face(ctx, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], faces.left, faces.stroke, box.opacity);
    this.face(ctx, [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], faces.right, faces.stroke, box.opacity);
    this.face(ctx, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], faces.front, faces.stroke, box.opacity);
    this.face(ctx, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], faces.top, faces.stroke, box.opacity);
  }

  projectedRadius(x, y, z, radius) {
    const center = this.project(x, y, z);
    const edge = this.project(x + radius, y, z);
    return Math.max(2, Math.hypot(edge[0] - center[0], edge[1] - center[1]));
  }

  drawCylinder(ctx, box) {
    const faces = Object.assign({}, defaultFaces(this.palette), box.faces || {});
    const fill = faces.front || faces.right || faces.top || resolveToken(this.palette, "metal") || "#606f7b";
    const radius = box.radius || Math.min(box.w, box.h, box.d) / 2;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const cz = box.z + box.d / 2;
    let a = [cx, cy, box.z];
    let b = [cx, cy, box.z + box.d];
    if (box.axis === "x") {
      a = [box.x, cy, cz];
      b = [box.x + box.w, cy, cz];
    } else if (box.axis === "y") {
      a = [cx, box.y, cz];
      b = [cx, box.y + box.h, cz];
    }
    const pa = this.project(a[0], a[1], a[2]);
    const pb = this.project(b[0], b[1], b[2]);
    const pr = this.projectedRadius(cx, cy, cz, radius);
    ctx.globalAlpha = box.opacity == null ? 1 : box.opacity;
    ctx.strokeStyle = fill;
    ctx.lineWidth = pr * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pa[0], pa[1]);
    ctx.lineTo(pb[0], pb[1]);
    ctx.stroke();
    ctx.lineWidth = window.devicePixelRatio || 1;
    ctx.fillStyle = fill;
    ctx.strokeStyle = faces.stroke || resolveToken(this.palette, "cabDark") || "#2e2e35";
    [pa, pb].forEach((p) => {
      ctx.beginPath();
      ctx.arc(p[0], p[1], pr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  draw() {
    if (!this.model) return;
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = resolveToken(this.palette, "bg") || "#f2f0eb";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    allItems(this.model, "3d")
      .filter((item) => isVisible(item, "3d"))
      .slice()
      .sort((a, b) => (a.layer || 0) - (b.layer || 0))
      .flatMap((item) => resolveItemBoxes(item, this.palette))
      .forEach((box) => {
        if (box.type === "cylinder") this.drawCylinder(ctx, box);
        else this.drawBox(ctx, box);
      });
    if (this.dimensionsVisible) {
      ctx.fillStyle = resolveToken(this.palette, "dim") || "#473d34";
      ctx.font = `${12 * (window.devicePixelRatio || 1)}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(`${cm(this.model.width)} x ${cm(this.model.height)} x ${cm(this.model.depth)}`, this.canvas.width / 2, this.canvas.height - 22);
    }
  }
}

export function renderStatic3dCanvas(model, width, height, view = {}) {
  const holder = { appendChild() {} };
  const renderer = new IsoRenderer(holder, view);
  renderer.canvas = document.createElement("canvas");
  renderer.canvas.width = width;
  renderer.canvas.height = height;
  renderer.model = model;
  renderer.bounds = modelBounds(model);
  renderer.palette = view.palette || model.palette || DEFAULT_PALETTE;
  renderer.draw();
  return renderer.canvas;
}
