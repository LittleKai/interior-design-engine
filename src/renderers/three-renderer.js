import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { allItems, modelBounds, isVisible, itemThreeTransform } from "../core/model.js";
import { createGeometry } from "./three/geometry-factories.js";
import { getMaterial, releaseMaterials } from "./three/materials.js";
import { setupLighting } from "./three/lighting.js";
import { Dimensions } from "./three/dimensions.js";
import { applyCsgHints, clearCsgCache } from "./three/csg-service.js";

const MODE_PERSPECTIVE = "perspective";
const MODE_ORTHO = "orthographic";

export class ThreeRenderer {
  constructor(container, options) {
    this.container = container;
    this.options = options || {};
    this.mode = MODE_PERSPECTIVE;
    this.shadowEnabled = false;
    this.showDimensions = false;
    this.disposed = false;
    this.meshes = [];
    this.model = null;
  }

  mount() {
    if (this.scene) return this;
    const width = Math.max(1, this.container.clientWidth || 800);
    const height = Math.max(1, this.container.clientHeight || 480);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe9e4da);

    this.perspectiveCamera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    this.orthoCamera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 5000);
    this.camera = this.perspectiveCamera;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(width, height, false);
    this.renderer.shadowMap.enabled = this.shadowEnabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";

    if (!this.container.style.position) this.container.style.position = "relative";
    this.container.appendChild(this.renderer.domElement);

    this.dimensions = new Dimensions({ container: this.container, scene: this.scene, width, height });

    setupLighting(this.scene);
    this.ground = this.createGround();
    this.scene.add(this.ground);

    this.modelGroup = new THREE.Group();
    this.scene.add(this.modelGroup);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 4000;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;

    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => this.resize());
      this._resizeObserver.observe(this.container);
    }

    this._animate = this._animate.bind(this);
    this._raf = requestAnimationFrame(this._animate);

    return this;
  }

  createGround() {
    const geo = new THREE.PlaneGeometry(5000, 5000);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd9d2c2, roughness: 0.92, metalness: 0 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.5;
    mesh.receiveShadow = true;
    return mesh;
  }

  update(model) {
    if (!this.scene) this.mount();
    this.model = model;
    this.clearMeshes();

    allItems(model, "3d")
      .filter((item) => isVisible(item, "3d"))
      .forEach((item) => this.addItem(item, model));

    const bounds = modelBounds(model);
    this.fitCamera(bounds);
    if (this.dimensions) this.dimensions.update(model, this.showDimensions);
    return this;
  }

  addItem(item, model) {
    const geometry = createGeometry(item);
    if (!geometry) return;
    const materialRef = item.materialRef || (item.kind === "void" ? null : "laminate-white");
    const baseColor = item.color || (model.materials && model.materials.board);
    const material = getMaterial(materialRef || "laminate-white", {
      color: baseColor,
      opacity: item.opacity,
      kind: item.kind
    });
    const mesh = new THREE.Mesh(geometry, material);
    const transform = itemThreeTransform(item);
    mesh.position.set(transform.x, transform.y, transform.z);
    mesh.rotation.y = transform.rotationY;
    mesh.castShadow = this.shadowEnabled && item.kind !== "void";
    mesh.receiveShadow = this.shadowEnabled;
    mesh.userData.kind = item.kind;
    mesh.userData.itemId = item.id;
    const meshes = item.csgHints && item.csgHints.length
      ? applyCsgHints(mesh, item.csgHints, item)
      : [mesh];
    if (!meshes.includes(mesh) && mesh.geometry) mesh.geometry.dispose();
    meshes.forEach((itemMesh) => {
      itemMesh.castShadow = itemMesh.castShadow && this.shadowEnabled && item.kind !== "void";
      itemMesh.receiveShadow = this.shadowEnabled;
      itemMesh.userData = Object.assign({ kind: item.kind, itemId: item.id }, itemMesh.userData);
      this.modelGroup.add(itemMesh);
      this.meshes.push(itemMesh);
    });
  }

  clearMeshes() {
    this.meshes.forEach((mesh) => {
      this.modelGroup.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
    });
    this.meshes = [];
  }

  fitCamera(bounds) {
    const cx = bounds.minX + bounds.width / 2;
    const cy = bounds.minY + bounds.height / 2;
    const cz = bounds.minZ + bounds.depth / 2;
    const center = new THREE.Vector3(cx, cy, cz);
    const longest = Math.max(bounds.width, bounds.height, bounds.depth, 60);

    const persp = this.perspectiveCamera;
    const halfFov = (persp.fov / 2) * Math.PI / 180;
    const dist = Math.max(120, (longest / 2) / Math.tan(halfFov) * 1.55);
    persp.position.set(center.x + dist * 0.55, center.y + dist * 0.35, center.z + dist);
    persp.lookAt(center);

    const aspect = this.renderer.domElement.clientWidth / Math.max(1, this.renderer.domElement.clientHeight);
    const halfH = longest * 0.7;
    const halfW = halfH * aspect;
    const ortho = this.orthoCamera;
    ortho.left = -halfW;
    ortho.right = halfW;
    ortho.top = halfH;
    ortho.bottom = -halfH;
    ortho.near = 0.1;
    ortho.far = 5000;
    ortho.position.copy(persp.position);
    ortho.lookAt(center);
    ortho.updateProjectionMatrix();

    if (this.controls) {
      this.controls.target.copy(center);
      this.controls.update();
    }
  }

  setMode(mode) {
    const target = mode === MODE_ORTHO ? MODE_ORTHO : MODE_PERSPECTIVE;
    if (target === this.mode) return;
    this.mode = target;
    this.camera = target === MODE_ORTHO ? this.orthoCamera : this.perspectiveCamera;
    if (this.controls) {
      const saved = this.controls.target.clone();
      this.controls.dispose();
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 30;
      this.controls.maxDistance = 4000;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.controls.target.copy(saved);
      this.controls.update();
    }
  }

  setShadowEnabled(enabled) {
    this.shadowEnabled = !!enabled;
    if (this.renderer) this.renderer.shadowMap.enabled = this.shadowEnabled;
    this.meshes.forEach((mesh) => {
      mesh.castShadow = this.shadowEnabled && mesh.userData.kind !== "void";
      mesh.receiveShadow = this.shadowEnabled;
    });
  }

  setDimensionsVisible(visible) {
    this.showDimensions = !!visible;
    if (this.dimensions) this.dimensions.setVisible(this.showDimensions);
  }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.container.clientWidth || 800);
    const height = Math.max(1, this.container.clientHeight || 480);
    this.renderer.setSize(width, height, false);
    if (this.dimensions) this.dimensions.resize(width, height);
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    if (this.model) {
      const bounds = modelBounds(this.model);
      const longest = Math.max(bounds.width, bounds.height, bounds.depth, 60);
      const aspect = width / height;
      const halfH = longest * 0.7;
      const halfW = halfH * aspect;
      this.orthoCamera.left = -halfW;
      this.orthoCamera.right = halfW;
      this.orthoCamera.top = halfH;
      this.orthoCamera.bottom = -halfH;
      this.orthoCamera.updateProjectionMatrix();
    }
  }

  _animate() {
    if (this.disposed) return;
    if (this.renderer && this.renderer.domElement && !this.renderer.domElement.isConnected) {
      this.dispose();
      return;
    }
    this._raf = requestAnimationFrame(this._animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.camera && this.scene) {
      this.renderer.render(this.scene, this.camera);
      if (this.dimensions) this.dimensions.render(this.camera);
    }
  }

  async exportPNG(options) {
    const width = (options && options.width) || 1280;
    const height = (options && options.height) || 720;
    if (!this.renderer) return null;
    const prevSize = new THREE.Vector2();
    this.renderer.getSize(prevSize);
    const prevPixelRatio = this.renderer.getPixelRatio();
    const prevAspect = this.perspectiveCamera.aspect;

    this.renderer.setPixelRatio(1);
    this.renderer.setSize(width, height, false);
    this.perspectiveCamera.aspect = width / height;
    this.perspectiveCamera.updateProjectionMatrix();
    const cam = this.mode === MODE_ORTHO ? this.orthoCamera : this.perspectiveCamera;
    this.renderer.render(this.scene, cam);
    const dataUrl = this.renderer.domElement.toDataURL("image/png");

    this.renderer.setPixelRatio(prevPixelRatio);
    this.renderer.setSize(prevSize.x, prevSize.y, false);
    this.perspectiveCamera.aspect = prevAspect;
    this.perspectiveCamera.updateProjectionMatrix();
    return dataUrl;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this.clearMeshes();
    clearCsgCache();
    if (this.dimensions) this.dimensions.dispose();
    if (this.controls) this.controls.dispose();
    if (this.ground) {
      if (this.ground.geometry) this.ground.geometry.dispose();
      if (this.ground.material) this.ground.material.dispose();
    }
    releaseMaterials();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.scene = null;
  }
}

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}
