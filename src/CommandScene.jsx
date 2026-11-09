import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import "./command-scene.css";

const cellKey = (departmentId, scenarioId) => `${departmentId}:${scenarioId}`;
const X_GAP = 1.3;
const Z_GAP = 1.05;
const COUNT_HEIGHT = 1.15;

export function CommandScene({ departments, scenarios = [], cells = [], selectedId, selectedScenarioId, onSelect, autoRotate = false }) {
  const hostRef = useRef(null);
  const canvasMount = useRef(null);
  const labelRefs = useRef({});
  const latest = useRef({ cells, selectedId, selectedScenarioId, onSelect, autoRotate });
  latest.current = { cells, selectedId, selectedScenarioId, onSelect, autoRotate };
  const [unavailable, setUnavailable] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const departmentIds = departments.map((item) => item.id).join(",");
  const scenarioIds = scenarios.map((item) => item.id).join(",");
  const maxCount = Math.max(1, ...cells.map((cell) => cell.count));
  const counts = new Map(cells.map((cell) => [cellKey(cell.departmentId, cell.scenarioId), cell.count]));
  const selectedKey = selectedId && selectedScenarioId ? cellKey(selectedId, selectedScenarioId) : null;
  const firstSignal = cells.find((cell) => cell.count > 0);
  const keyboardKey = focused || selectedKey || (firstSignal ? cellKey(firstSignal.departmentId, firstSignal.scenarioId) : cellKey(departments[0]?.id, scenarios[0]?.id));

  useEffect(() => {
    setFocused(null);
    setHovered(null);
  }, [departmentIds, scenarioIds]);

  useEffect(() => {
    const host = hostRef.current;
    const mount = canvasMount.current;
    if (!departments.length || !scenarios.length) return undefined;
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
    renderer.setClearColor(0x090909, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-8, 8, 6, -6, 0.1, 100);
    camera.position.set(5.8, 12, 15.5);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.15, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = 0.45;
    controls.maxPolarAngle = 1.1;
    controls.rotateSpeed = 0.5;
    controls.autoRotateSpeed = 0.35;
    controls.update();

    scene.add(new THREE.HemisphereLight(0xfff0d8, 0x181914, 3));
    const keyLight = new THREE.DirectionalLight(0xffedcf, 4);
    keyLight.position.set(-5, 12, 8);
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0xe36b61, 1.2);
    fill.position.set(7, 4, -4);
    scene.add(fill);

    const geometries = new Set();
    const materials = new Set();
    const material = (options) => {
      const result = new THREE.MeshStandardMaterial(options);
      materials.add(result);
      return result;
    };
    const graphite = material({ color: 0x141510, metalness: 0.45, roughness: 0.55 });
    const red = material({ color: 0xb63a31, emissive: 0x701d17, emissiveIntensity: 0.3, metalness: 0.25, roughness: 0.4 });
    const selectedRed = material({ color: 0xe05d4b, emissive: 0xa13628, emissiveIntensity: 0.45, metalness: 0.25, roughness: 0.35 });
    const gray = material({ color: 0x484a41, metalness: 0.2, roughness: 0.65 });
    const selectedGray = material({ color: 0x96907d, emissive: 0x4c4025, emissiveIntensity: 0.2, roughness: 0.5 });
    const darkTile = material({ color: 0x24251e, metalness: 0.3, roughness: 0.6 });
    const redTile = material({ color: 0x4d2820, emissive: 0x32170f, emissiveIntensity: 0.2, roughness: 0.55 });
    const makeMesh = (geometry, surface, x, y, z) => {
      geometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, surface);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };
    const makeLine = (points, color, opacity = 1) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point)));
      const surface = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
      geometries.add(geometry);
      materials.add(surface);
      const line = new THREE.Line(geometry, surface);
      scene.add(line);
      return line;
    };

    const width = scenarios.length * X_GAP;
    const depth = departments.length * Z_GAP;
    makeMesh(new THREE.BoxGeometry(width + 0.7, 0.22, depth + 0.7), graphite, 0, -0.15, 0);
    const left = -width / 2;
    const right = width / 2;
    const front = depth / 2;
    const back = -depth / 2;
    makeLine([[left - 0.3, 0, back - 0.3], [right + 0.3, 0, back - 0.3], [right + 0.3, 0, front + 0.3], [left - 0.3, 0, front + 0.3], [left - 0.3, 0, back - 0.3]], 0xc0a16b, 0.8);
    for (let index = 0; index <= scenarios.length; index += 1) {
      const x = left + index * X_GAP;
      makeLine([[x, 0.005, back], [x, 0.005, front]], 0x67583c, 0.45);
    }
    for (let index = 0; index <= departments.length; index += 1) {
      const z = back + index * Z_GAP;
      makeLine([[left, 0.005, z], [right, 0.005, z]], 0x67583c, 0.45);
    }
    makeLine([[left - 0.3, 0.01, front + 0.3], [right + 0.55, 0.01, front + 0.3]], 0xc7a45e);
    makeLine([[left - 0.3, 0.01, front + 0.3], [left - 0.3, 0.01, back - 0.55]], 0xc7a45e);

    const pickables = [];
    const models = [];
    const labelAnchors = [];
    const box = new THREE.BoxGeometry(0.62, 1, 0.6);
    const tileBox = new THREE.BoxGeometry(0.85, 0.07, 0.8);
    const outlineGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.92, 0.08, 0.87));
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xf1ca7a });
    geometries.add(outlineGeometry);
    materials.add(outlineMaterial);
    departments.forEach((department, row) => {
      const z = front - (row + 0.5) * Z_GAP;
      labelAnchors.push({ key: `department:${department.id}`, anchor: new THREE.Vector3(left - 0.5, 0, z), kind: "department" });
      scenarios.forEach((scenario, column) => {
        const x = left + (column + 0.5) * X_GAP;
        const id = cellKey(department.id, scenario.id);
        const count = latest.current.cells.find((cell) => cell.departmentId === department.id && cell.scenarioId === scenario.id)?.count || 0;
        const tile = makeMesh(tileBox, count ? redTile : darkTile, x, 0.04, z);
        const bar = makeMesh(box, count ? red : gray, x, 0.11 + count * COUNT_HEIGHT / 2, z);
        bar.scale.y = Math.max(0.04, count * COUNT_HEIGHT);
        const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
        outline.position.set(x, 0.08, z);
        outline.visible = false;
        scene.add(outline);
        tile.userData = { departmentId: department.id, scenarioId: scenario.id };
        bar.userData = tile.userData;
        pickables.push(tile, bar);
        models.push({ id, departmentId: department.id, scenarioId: scenario.id, x, z, count, bar, tile, outline });
      });
    });
    scenarios.forEach((scenario, column) => {
      labelAnchors.push({ key: `scenario:${scenario.id}`, anchor: new THREE.Vector3(left + (column + 0.5) * X_GAP, 0, front + 0.65), kind: "scenario" });
    });
    makeLine([[right + 0.3, 0, back - 0.3], [right + 0.3, maxCount * COUNT_HEIGHT, back - 0.3]], 0x9b845b, 0.8);
    for (let count = 0; count <= maxCount; count += 1) {
      const y = count * COUNT_HEIGHT;
      makeLine([[right + 0.25, y, back - 0.3], [right + 0.48, y, back - 0.3]], 0x9b845b);
      labelAnchors.push({ key: `height:${count}`, anchor: new THREE.Vector3(right + 0.65, y, back - 0.3), kind: "height" });
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerStart = null;
    const hitAt = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(pickables, false)[0]?.object.userData;
    };
    const handleDown = (event) => { pointerStart = [event.clientX, event.clientY]; };
    const handleUp = (event) => {
      if (!pointerStart || Math.hypot(event.clientX - pointerStart[0], event.clientY - pointerStart[1]) > 6) { pointerStart = null; return; }
      pointerStart = null;
      const hit = hitAt(event);
      if (hit) latest.current.onSelect(hit.departmentId, hit.scenarioId);
    };
    const handleMove = (event) => {
      const hit = hitAt(event);
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      setHovered(hit ? cellKey(hit.departmentId, hit.scenarioId) : null);
    };
    const handleLeave = () => setHovered(null);
    renderer.domElement.addEventListener("pointerdown", handleDown);
    renderer.domElement.addEventListener("pointerup", handleUp);
    renderer.domElement.addEventListener("pointermove", handleMove);
    renderer.domElement.addEventListener("pointerleave", handleLeave);

    const resize = () => {
      const viewportWidth = Math.max(1, host.clientWidth);
      const viewportHeight = Math.max(1, host.clientHeight);
      const aspect = viewportWidth / viewportHeight;
      const span = Math.max(width + 3.2, depth + 3.6);
      const horizontal = Math.max(span, (depth + 3.6) * aspect);
      camera.left = -horizontal / 2;
      camera.right = horizontal / 2;
      camera.top = horizontal / aspect / 2;
      camera.bottom = -horizontal / aspect / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(viewportWidth, viewportHeight, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const projected = new THREE.Vector3();
    let raf;
    let disposed = false;
    const placeLabel = (key, anchor) => {
      const label = labelRefs.current[key];
      if (!label) return;
      projected.copy(anchor).project(camera);
      const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
      const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;
      label.style.left = `${x.toFixed(1)}px`;
      label.style.top = `${y.toFixed(1)}px`;
      label.style.visibility = projected.z > -1 && projected.z < 1 && x > 0 && x < host.clientWidth && y > 5 && y < host.clientHeight - 5 ? "visible" : "hidden";
      label.style.zIndex = String(Math.round((1 - projected.z) * 100));
    };
    const animate = () => {
      if (disposed) return;
      const current = latest.current;
      const currentCounts = new Map(current.cells.map((cell) => [cellKey(cell.departmentId, cell.scenarioId), cell.count]));
      controls.autoRotate = current.autoRotate && !reducedMotion.matches;
      controls.update();
      camera.updateMatrixWorld();
      models.forEach((model) => {
        const count = currentCounts.get(model.id) || 0;
        const selected = (!current.selectedId || current.selectedId === model.departmentId) && (!current.selectedScenarioId || current.selectedScenarioId === model.scenarioId) && Boolean(current.selectedId || current.selectedScenarioId);
        model.bar.scale.y = Math.max(0.04, count * COUNT_HEIGHT);
        model.bar.position.y = 0.11 + model.bar.scale.y / 2;
        model.bar.material = count ? selected ? selectedRed : red : selected ? selectedGray : gray;
        model.tile.material = count ? redTile : darkTile;
        model.outline.visible = selected;
        placeLabel(model.id, projected.set(model.x, 0.25 + count * COUNT_HEIGHT, model.z));
      });
      labelAnchors.forEach(({ key, anchor }) => placeLabel(key, anchor));
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };
    raf = window.requestAnimationFrame(animate);
    return () => {
      disposed = true;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", handleDown);
      renderer.domElement.removeEventListener("pointerup", handleUp);
      renderer.domElement.removeEventListener("pointermove", handleMove);
      renderer.domElement.removeEventListener("pointerleave", handleLeave);
      controls.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((surface) => surface.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [departmentIds, scenarioIds, maxCount]);

  const moveFocus = (event, row, column) => {
    const offsets = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (!offsets[event.key]) return;
    event.preventDefault();
    const [rowOffset, columnOffset] = offsets[event.key];
    const nextRow = Math.max(0, Math.min(departments.length - 1, row + rowOffset));
    const nextColumn = Math.max(0, Math.min(scenarios.length - 1, column + columnOffset));
    const id = cellKey(departments[nextRow].id, scenarios[nextColumn].id);
    setFocused(id);
    labelRefs.current[id]?.focus();
  };

  return <div className={`cs-host cs-matrix ${unavailable ? "cs-unavailable" : ""}`} ref={hostRef} role="group" aria-label="시나리오와 부서별 이상징후 3D 맵">
    <div className="cs-canvas" ref={canvasMount} />
    <div className="cs-axis-key" aria-hidden="true"><span><b>X</b> 시나리오</span><span><b>Y</b> 부서</span><span><b>Z</b> 거래 건수</span></div>
    {unavailable && <p className="cs-fallback">3D 화면을 사용할 수 없어 표로 표시합니다.<br />부서와 시나리오를 선택하면 검토 목록에 반영됩니다.</p>}
    <div className="cs-axis-labels" aria-hidden="true">
      {departments.map((department) => <span key={department.id} className={`cs-axis-label cs-department-label ${selectedId === department.id ? "cs-axis-selected" : ""}`} ref={(node) => { labelRefs.current[`department:${department.id}`] = node; }}>{department.name}</span>)}
      {scenarios.map((scenario) => <span key={scenario.id} className={`cs-axis-label cs-scenario-label ${selectedScenarioId === scenario.id ? "cs-axis-selected" : ""}`} ref={(node) => { labelRefs.current[`scenario:${scenario.id}`] = node; }}>{scenario.title}</span>)}
      {Array.from({ length: maxCount + 1 }, (_, count) => <span key={count} className="cs-axis-label cs-height-label" ref={(node) => { labelRefs.current[`height:${count}`] = node; }}>{count}{count === maxCount ? "건" : ""}</span>)}
    </div>
    <div className="cs-cell-layer" role="grid" aria-label="부서 × 시나리오별 거래 건수" aria-rowcount={departments.length} aria-colcount={scenarios.length}>
      {departments.map((department, row) => <div key={department.id} role="row" aria-label={department.name} className="cs-cell-row">
        {scenarios.map((scenario, column) => {
          const id = cellKey(department.id, scenario.id);
          const count = counts.get(id) || 0;
          const selected = (!selectedId || selectedId === department.id) && (!selectedScenarioId || selectedScenarioId === scenario.id) && Boolean(selectedId || selectedScenarioId);
          return <button key={id} type="button" role="gridcell" aria-selected={selected} aria-rowindex={row + 1} aria-colindex={column + 1} aria-label={`${department.name} · ${scenario.title} · ${count}건`} tabIndex={keyboardKey === id ? 0 : -1} className={`cs-cell ${count ? "cs-cell-signal" : "cs-cell-zero"} ${selected ? "cs-cell-selected" : ""} ${hovered === id ? "cs-cell-hovered" : ""}`} ref={(node) => { labelRefs.current[id] = node; }} onFocus={() => setFocused(id)} onKeyDown={(event) => moveFocus(event, row, column)} onClick={() => onSelect(department.id, scenario.id)}><span className="cs-fallback-scenario">{scenario.title}</span><strong>{count}</strong><span className="cs-cell-tooltip">{department.name}<br />{scenario.title} · {count}건</span></button>;
        })}
      </div>)}
    </div>
    <span className="cs-navigation-hint">셀 선택으로 거래 필터 · 방향키로 이동 · Enter로 선택</span>
  </div>;
}
