import * as THREE from "three";

export function setupLighting(scene) {
  const hemi = new THREE.HemisphereLight(0xEEEEEE, 0xFFFFFF, 0.4);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xFFFFFF, 1.2);
  dir.position.set(300, 400, 300);
  dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  dir.shadow.camera.left = -600;
  dir.shadow.camera.right = 600;
  dir.shadow.camera.top = 600;
  dir.shadow.camera.bottom = -600;
  dir.shadow.camera.near = 1;
  dir.shadow.camera.far = 2000;
  dir.shadow.bias = -0.0002;
  scene.add(dir);

  const fill1 = new THREE.PointLight(0xFFDDAA, 0.3);
  fill1.position.set(-300, 200, -200);
  scene.add(fill1);

  const fill2 = new THREE.PointLight(0xFFDDAA, 0.2);
  fill2.position.set(200, 150, -300);
  scene.add(fill2);

  return { hemi, dir, fill1, fill2 };
}
