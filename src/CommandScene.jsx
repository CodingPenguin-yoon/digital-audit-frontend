import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./command-scene.css";

const TAU = Math.PI * 2;
const FRONT = 0.62;
const seeded = (index) => {
  const value = Math.sin(index * 127.1 + 19.7) * 43758.5453;
  return value - Math.floor(value);
};

function circleLine(radius, color, opacity = 1, segments = 128) {
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const angle = index / segments * TAU;
    return new THREE.Vector3(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
  });
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
}

export function CommandScene({ departments, selectedId, onSelect, autoRotate = true, focusMode = false }) {
  const hostRef = useRef(null);
  const canvasMount = useRef(null);
  const labelRefs = useRef({});
  const latest = useRef({ selectedId, onSelect, autoRotate, focusMode });
  latest.current = { selectedId, onSelect, autoRotate, focusMode };
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const mount = canvasMount.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      setUnavailable(true);
      return undefined;
    }
    setUnavailable(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x090909, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090909, 0.025);
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    const cameraDirection = new THREE.Vector3(10.5, 6.1, 13.5).normalize();
    camera.position.copy(cameraDirection).multiplyScalar(14.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, -0.45, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.82;
    controls.maxPolarAngle = 1.28;
    controls.rotateSpeed = 0.35;
    controls.update();

    const hemisphere = new THREE.HemisphereLight(0xfff0d7, 0x171713, 2.8);
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xfff0d7, 4.6);
    key.position.set(-4, 14, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = key.shadow.camera.bottom = -9;
    key.shadow.camera.right = key.shadow.camera.top = 9;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 35;
    key.shadow.normalBias = 0.04;
    key.shadow.bias = -0.0002;
    scene.add(key);
    const redLight = new THREE.PointLight(0xe7c888, 22, 16, 2);
    redLight.position.set(4, 3, 5);
    scene.add(redLight);
    const orangeLight = new THREE.PointLight(0xb18b43, 12, 15, 2);
    orangeLight.position.set(-5, 2.5, 2);
    scene.add(orangeLight);
    const rimLight = new THREE.PointLight(0xd4d1c8, 32, 20, 2);
    rimLight.position.set(-2, 5, -6);
    scene.add(rimLight);

    const graphite = new THREE.MeshStandardMaterial({ color: 0x171713, metalness: 0.6, roughness: 0.34 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xd3ba83, metalness: 0.65, roughness: 0.3 });
    const black = new THREE.MeshStandardMaterial({ color: 0x090909, metalness: 0.5, roughness: 0.65 });
    const redWire = new THREE.MeshStandardMaterial({ color: 0xb18b43, emissive: 0xb18b43, emissiveIntensity: 2.5, metalness: 0.4, roughness: 0.4 });
    const orangeWire = new THREE.MeshStandardMaterial({ color: 0xb18b43, emissive: 0xb18b43, emissiveIntensity: 2.2, roughness: 0.5 });
    const coolWire = new THREE.MeshStandardMaterial({ color: 0x797762, emissive: 0x534b31, emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.5 });
    const allMaterials = [graphite, silver, black, redWire, orangeWire, coolWire];
    const ownGeometries = new Set();
    const mesh = (geometry, material, parent, position = [0, 0, 0], shadows = true) => {
      ownGeometries.add(geometry);
      const object = new THREE.Mesh(geometry, material);
      object.position.set(...position);
      object.castShadow = shadows;
      object.receiveShadow = shadows;
      parent.add(object);
      return object;
    };
    const horizontalTorus = (radius, tube, material, parent, y) => {
      const object = mesh(new THREE.TorusGeometry(radius, tube, 6, 128), material, parent, [0, y, 0], false);
      object.rotation.x = Math.PI / 2;
      return object;
    };

    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x80704a, metalness: 0.18, roughness: 0.88 });
    allMaterials.push(floorMaterial);
    const floor = mesh(new THREE.CircleGeometry(8.3, 96), floorMaterial, scene, [0, -0.98, 0]);
    floor.rotation.x = -Math.PI / 2;
    floor.castShadow = false;
    let disposed = false;
    const floorTexture = new THREE.TextureLoader().load("/assets/command-floor.png", (texture) => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      floorMaterial.map = texture;
      floorMaterial.needsUpdate = true;
    }, undefined, () => {});

    const stage = new THREE.Group();
    scene.add(stage);
    const deckShape = new THREE.Shape();
    deckShape.absarc(0, 0, 6.35, 0, TAU, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 2.1, 0, TAU, true);
    deckShape.holes.push(hole);
    const deck = mesh(new THREE.ExtrudeGeometry(deckShape, { depth: 0.82, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.065, bevelThickness: 0.065, curveSegments: 72 }), graphite, stage, [0, -0.82, 0]);
    deck.rotation.x = -Math.PI / 2;
    horizontalTorus(6.28, 0.065, silver, stage, 0.03);
    horizontalTorus(6.3, 0.035, silver, stage, -0.65);
    horizontalTorus(6.14, 0.018, redWire, stage, 0.065);
    horizontalTorus(5.88, 0.012, coolWire, stage, 0.07);
    horizontalTorus(2.17, 0.04, silver, stage, 0.035);
    horizontalTorus(2.25, 0.018, orangeWire, stage, 0.05);
    mesh(new THREE.CylinderGeometry(2.08, 2.08, 0.1, 80), black, stage, [0, -0.54, 0]);
    horizontalTorus(1.72, 0.015, coolWire, stage, -0.47);
    horizontalTorus(1.36, 0.012, redWire, stage, -0.47);
    mesh(new THREE.CylinderGeometry(0.68, 0.84, 0.17, 48), graphite, stage, [0, -0.4, 0]);
    horizontalTorus(0.69, 0.018, orangeWire, stage, -0.3);
    const core = mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.24, 48), black, stage, [0, -0.2, 0]);
    const coreLight = new THREE.PointLight(0xb18b43, 5, 4, 2);
    coreLight.position.set(0, 0.3, 0);
    stage.add(coreLight);

    const tickGeometry = new THREE.BoxGeometry(0.055, 0.035, 0.2);
    ownGeometries.add(tickGeometry);
    const ticks = new THREE.InstancedMesh(tickGeometry, coolWire, 72);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 1, 0);
    for (let index = 0; index < 72; index += 1) {
      const angle = index / 72 * TAU;
      quaternion.setFromAxisAngle(axis, angle);
      matrix.compose(new THREE.Vector3(Math.sin(angle) * 6.02, 0.08, Math.cos(angle) * 6.02), quaternion, new THREE.Vector3(1, 1, 1));
      ticks.setMatrixAt(index, matrix);
    }
    stage.add(ticks);

    const pickables = [];
    const departmentModels = departments.map((department, index) => {
      const angle = FRONT + index / departments.length * TAU;
      const group = new THREE.Group();
      group.position.set(Math.sin(angle) * 4.28, 0.09, Math.cos(angle) * 4.28);
      group.rotation.y = angle;
      stage.add(group);
      const activeColor = department.anomalies ? 0xbb9249 : 0x44463f;
      const towerMaterial = new THREE.MeshStandardMaterial({ color: activeColor, emissive: department.anomalies ? 0x8a682d : 0x22231c, emissiveIntensity: department.anomalies ? 0.22 : 0.1, metalness: 0.5, roughness: 0.34 });
      const bandMaterial = new THREE.MeshStandardMaterial({ color: department.anomalies ? 0xe7c888 : 0xa3a598, emissive: department.anomalies ? 0xb18b43 : 0x525448, emissiveIntensity: 0.7, roughness: 0.45 });
      allMaterials.push(towerMaterial, bandMaterial);
      mesh(new THREE.CylinderGeometry(1.08, 1.1, 0.12, 48), black, group, [0, 0.06, 0]);
      const halo = horizontalTorus(1.025, 0.018, department.anomalies ? redWire : coolWire, group, 0.14);
      const body = new THREE.Group();
      group.add(body);
      const height = 0.5 + department.anomalies * 0.145;
      const mainTower = mesh(new THREE.BoxGeometry(1.03, height, 0.95), towerMaterial, body, [-0.16, 0.22 + height / 2, 0]);
      const cap = mesh(new THREE.BoxGeometry(1.13, 0.105, 1.05), silver, body, [-0.16, 0.27 + height, 0]);
      const plinth = mesh(new THREE.BoxGeometry(1.25, 0.13, 1.1), graphite, body, [-0.16, 0.18, 0]);
      const satellite = mesh(new THREE.BoxGeometry(0.48, height * 0.56, 0.61), graphite, body, [0.61, 0.2 + height * 0.28, -0.14]);
      [mainTower, cap, plinth, satellite].forEach((object) => { object.userData.departmentId = department.id; pickables.push(object); });
      const floors = Math.max(2, Math.ceil(height / 0.26));
      const windowGeometry = new THREE.BoxGeometry(0.75, 0.024, 0.012);
      ownGeometries.add(windowGeometry);
      const windows = new THREE.InstancedMesh(windowGeometry, bandMaterial, floors * 2);
      for (let floorIndex = 0; floorIndex < floors; floorIndex += 1) {
        for (let side = 0; side < 2; side += 1) {
          const rotation = new THREE.Quaternion().setFromAxisAngle(axis, side * Math.PI);
          matrix.compose(new THREE.Vector3(-0.16, 0.36 + floorIndex * (height - 0.16) / floors, side === 0 ? 0.482 : -0.482), rotation, new THREE.Vector3(1, 1, 1));
          windows.setMatrixAt(floorIndex * 2 + side, matrix);
        }
      }
      windows.userData.departmentId = department.id;
      pickables.push(windows);
      body.add(windows);
      const route = circleLine(1.22, department.anomalies ? 0x8f723b : 0x5c5c50, 0.6, 48);
      route.position.y = 0.01;
      group.add(route);
      return { department, group, body, halo, towerMaterial, bandMaterial, height, angle, scale: 0.72 };
    });

    // These particles are atmospheric data signals, not additional transaction records.
    const particleCount = 420;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = seeded(index + 30) * TAU;
      const radius = 2.5 + seeded(index + 300) * 3.5;
      particlePositions[index * 3] = Math.sin(angle) * radius;
      particlePositions[index * 3 + 1] = 0.16 + seeded(index + 1000) * 0.88;
      particlePositions[index * 3 + 2] = Math.cos(angle) * radius;
      const color = new THREE.Color(index % 5 === 0 ? 0xd7d3bf : index % 3 === 0 ? 0xb18b43 : 0xe7c888);
      color.toArray(particleColors, index * 3);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
    ownGeometries.add(particleGeometry);
    const particleMaterial = new THREE.PointsMaterial({ size: 0.035, transparent: true, opacity: 0.75, vertexColors: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
    allMaterials.push(particleMaterial);
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    stage.add(particles);

    const scanLine = circleLine(5.4, 0xe7c888, 0.38);
    scanLine.position.y = 0.12;
    stage.add(scanLine);
    const scanBead = mesh(new THREE.SphereGeometry(0.065, 8, 8), orangeWire, stage, [0, 0.15, 5.4], false);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const handleDown = (event) => { pointerStart = [event.clientX, event.clientY]; };
    const handleUp = (event) => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 7) { pointerStart = null; return; }
      pointerStart = null;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickables, false)[0];
      if (hit?.object.userData.departmentId) latest.current.onSelect(hit.object.userData.departmentId, renderer.domElement);
    };
    renderer.domElement.addEventListener("pointerdown", handleDown);
    renderer.domElement.addEventListener("pointerup", handleUp);
    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      const targetWidth = Math.min(width * 0.88, height * 1.6);
      const probe = new THREE.Vector3();
      const measure = (distance) => {
        camera.position.copy(cameraDirection).multiplyScalar(distance);
        camera.lookAt(controls.target);
        camera.updateMatrixWorld();
        let minX = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let index = 0; index < 64; index += 1) {
          const angle = index / 64 * TAU;
          probe.set(Math.sin(angle) * 6.45, -0.9, Math.cos(angle) * 6.45).project(camera);
          const x = (probe.x * 0.5 + 0.5) * width;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, (-probe.y * 0.5 + 0.5) * height);
        }
        return { width: maxX - minX, bottom: maxY };
      };
      let near = 10;
      let far = 32;
      for (let step = 0; step < 12; step += 1) {
        const distance = (near + far) / 2;
        if (measure(distance).width > targetWidth) near = distance;
        else far = distance;
      }
      let distance = far;
      while (measure(distance).bottom > height - 14 && distance < 32) distance += 0.1;
      measure(distance);
      controls.update();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const world = new THREE.Vector3();
    const projected = new THREE.Vector3();
    let previousTime = performance.now();
    let elapsed = 0;
    let lastSelected = null;
    let selectedRotation = 0;
    let autoOffset = 0;
    let previousFocus = false;
    let raf = 0;
    const animate = (now) => {
      if (disposed) return;
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      elapsed += delta;
      const current = latest.current;
      const selectedIndex = Math.max(0, departments.findIndex((department) => department.id === current.selectedId));
      if (lastSelected !== current.selectedId) {
        selectedRotation = -selectedIndex / departments.length * TAU;
        while (selectedRotation - stage.rotation.y > Math.PI) selectedRotation -= TAU;
        while (selectedRotation - stage.rotation.y < -Math.PI) selectedRotation += TAU;
        autoOffset = 0;
        lastSelected = current.selectedId;
      }
      if (current.autoRotate && !reduceMotion.matches) autoOffset += delta * 0.026;
      const targetRotation = selectedRotation + autoOffset;
      stage.rotation.y = reduceMotion.matches ? targetRotation : THREE.MathUtils.damp(stage.rotation.y, targetRotation, 2.8, delta);
      if (Boolean(current.focusMode) !== previousFocus) {
        camera.position.multiplyScalar(current.focusMode ? 0.92 : 1 / 0.92);
        controls.target.y = current.focusMode ? -0.25 : -0.45;
        previousFocus = Boolean(current.focusMode);
      }
      controls.update();
      camera.updateMatrixWorld();
      departmentModels.forEach((model) => {
        const selected = model.department.id === current.selectedId;
        const targetScale = selected ? 1.12 : 1;
        model.scale = reduceMotion.matches ? targetScale : THREE.MathUtils.damp(model.scale, targetScale, 3.2, delta);
        model.body.scale.y = model.scale;
        model.body.position.y = selected ? 0.06 : 0;
        model.towerMaterial.emissiveIntensity = selected ? 0.5 : model.department.anomalies ? 0.17 : 0.1;
        model.halo.scale.setScalar(selected ? 1.055 : 1);
        model.group.getWorldPosition(world);
        // A shared label height keeps department names readable around the ring,
        // while the physical towers alone encode the different anomaly counts.
        world.y += selected ? 1.1 : 0.9;
        projected.copy(world).project(camera);
        const label = labelRefs.current[model.department.id];
        if (label) {
          const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
          const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;
          label.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-100%)`;
          const visible = projected.z > -1 && projected.z < 1 && x > 55 && x < host.clientWidth - 55 && y > 55 && y < host.clientHeight - 10;
          label.style.opacity = visible ? "1" : "0";
          label.style.visibility = visible ? "visible" : "hidden";
          label.style.zIndex = String(Math.round((1 - projected.z) * 10000));
        }
      });
      if (!reduceMotion.matches) {
        particles.position.y = Math.sin(elapsed * 0.9) * 0.045;
        scanBead.position.set(Math.sin(elapsed * 0.22) * 5.4, 0.15, Math.cos(elapsed * 0.22) * 5.4);
        core.rotation.y = elapsed * 0.12;
      }
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handleDown);
      renderer.domElement.removeEventListener("pointerup", handleUp);
      controls.dispose();
      floorTexture.dispose();
      scene.traverse((object) => {
        if (object.geometry) ownGeometries.add(object.geometry);
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => { if (!allMaterials.includes(material)) allMaterials.push(material); });
        }
      });
      ownGeometries.forEach((geometry) => geometry.dispose());
      new Set(allMaterials).forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [departments]);

  return (
    <div className={`cs-host ${unavailable ? "cs-unavailable" : ""}`} ref={hostRef} role="group" aria-label="부서별 이상징후 3D 데이터 공간">
      <div className="cs-canvas" ref={canvasMount} />
      {unavailable && <p className="cs-fallback">이 브라우저에서는 3D 화면을 사용할 수 없습니다.<br />부서 이름을 선택해 점검을 이어갈 수 있습니다.</p>}
      <div className="cs-label-layer">
        {departments.map((department, index) => <button type="button" key={department.id} ref={(node) => { labelRefs.current[department.id] = node; }} className={`cs-label ${selectedId === department.id ? "cs-label-selected" : ""} ${department.anomalies ? "cs-label-alert" : ""}`} aria-label={`${department.name} 선택 · 이상징후 ${department.anomalies}건`} aria-pressed={selectedId === department.id} onClick={(event) => onSelect(department.id, event.currentTarget)}><span className="cs-label-meta">DEPT. {String(index + 1).padStart(2, "0")}</span><span className="cs-label-name">{department.name}<strong>{department.anomalies}</strong></span></button>)}
      </div>
      <span className="cs-navigation-hint">드래그하여 시점 회전</span>
    </div>
  );
}
