import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export class Dimensions {
  constructor({ container, scene, width, height }) {
    this.container = container;
    this.scene = scene;
    this.labels = [];
    this.visible = false;

    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(width, height);
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.pointerEvents = "none";

    if (!container.style.position) container.style.position = "relative";
    container.appendChild(this.renderer.domElement);
  }

  clear() {
    this.labels.forEach((label) => {
      this.scene.remove(label);
      if (label.element && label.element.parentNode) {
        label.element.parentNode.removeChild(label.element);
      }
    });
    this.labels = [];
  }

  update(model, visible) {
    this.clear();
    this.visible = !!visible;
    if (!model || !model.modules) return;
    model.modules.forEach((module) => {
      if (module.hiddenIn3d) return;
      if (!module.width || module.width < 30) return;
      const cx = module.x + module.width / 2;
      const top = module.y + module.height;
      const z = -(module.z + module.depth / 2);
      const node = document.createElement("div");
      node.className = "ide-dim-label";
      node.textContent = `${Math.round(module.width)} cm`;
      const label = new CSS2DObject(node);
      label.position.set(cx, top + 6, z);
      label.visible = this.visible;
      this.scene.add(label);
      this.labels.push(label);
    });
  }

  setVisible(visible) {
    this.visible = !!visible;
    this.labels.forEach((label) => { label.visible = this.visible; });
  }

  resize(width, height) {
    this.renderer.setSize(width, height);
  }

  render(camera) {
    if (!this.scene || !camera) return;
    if (!this.visible && this.labels.length === 0) return;
    this.renderer.render(this.scene, camera);
  }

  dispose() {
    this.clear();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
