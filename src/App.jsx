import React, { useEffect, useRef, useState } from "react";
import { FeatureDetail } from "./FeatureDetail.jsx";
import { DepartmentDashboard } from "./DepartmentDashboard.jsx";
import { departments } from "./departments.js";

export const features = [
  { id: "upload", number: "01", title: "데이터 업로드", english: "THE FOUNDATION", description: "거래 내역과 증빙을 모아, 점검의 첫 단계를 준비하세요.", color: "#d5ddd7", surface: "#272b29" },
  { id: "detect", number: "02", title: "이상징후 탐지", english: "LOOK CLOSER", description: "수많은 거래 속, 다시 살펴봐야 할 신호를 발견하세요.", color: "#a6d2b1", surface: "#19392b" },
  { id: "discover", number: "03", title: "새 패턴 발견", english: "BEYOND THE RULES", description: "익숙한 기준 너머의 새로운 이상 패턴을 살펴보세요.", color: "#e7c18b", surface: "#40311f" },
  { id: "compare", number: "04", title: "증빙 대조", english: "EVERY DETAIL COUNTS", description: "거래와 증빙을 나란히 놓고, 작은 차이까지 확인하세요.", color: "#cfbae1", surface: "#322640" },
  { id: "forgery", number: "05", title: "위변조 분석", english: "TRACE THE EVIDENCE", description: "파일 속 흔적을 따라, 증빙을 더 깊이 살펴보세요.", color: "#b0cde6", surface: "#1f3446" },
];

function FeatureCard({ feature, department, index, onOpen, onPreview, selected, hasSelection }) {
  const cardRef = useRef(null);
  const handleMove = (event) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.setProperty("--tilt-x", `${-y * 15}deg`);
    cardRef.current.style.setProperty("--tilt-y", `${x * 20}deg`);
  };
  const reset = () => {
    cardRef.current.style.setProperty("--tilt-x", "0deg");
    cardRef.current.style.setProperty("--tilt-y", "0deg");
    onPreview(null);
  };
  return (
    <div className={`card-position ${selected ? "is-selected" : ""} ${hasSelection && !selected ? "is-dismissed" : ""}`} style={{ "--index": index, "--offset": index - 2, "--angle": `${(index - 2) * 6.5}deg`, "--drop": `${Math.abs(index - 2) ** 1.7 * 15}px`, "--accent": feature.color, "--surface": feature.surface }}>
      <button ref={cardRef} className={`feature-card card-${feature.id}`} onPointerMove={handleMove} onPointerEnter={() => onPreview(index)} onPointerLeave={reset} onFocus={() => onPreview(index)} onBlur={reset} onClick={(event) => onOpen(feature.id, event.currentTarget)} aria-label={`${feature.title} 열기`} aria-haspopup="dialog">
        <span className="card-face">
          <span className="card-topline"><span>{department.name}</span><span>{feature.number} / 05</span></span>
          <span className="card-art" aria-hidden="true"><img src="/assets/card-sculpture.png" alt="" draggable="false" /></span>
          <span className="card-content"><span className="card-english">{feature.english}</span><span className="card-title">{feature.title}</span><span className="card-description">{feature.description}</span></span>
          <span className="card-bottom"><span>{feature.id === "detect" ? `이상징후 ${department.anomalies}건` : "EXPLORE MODULE"}</span><span className="card-arrow" aria-hidden="true">↗</span></span>
        </span>
        <span className="card-edge" aria-hidden="true" />
      </button>
    </div>
  );
}

export function App() {
  const [departmentId, setDepartmentId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selection, setSelection] = useState(null);
  const [active, setActive] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [replay, setReplay] = useState(0);
  const timer = useRef(null);
  const deckRef = useRef(null);
  const departmentOrigin = useRef(null);
  const origin = useRef(null);
  const modal = useRef(null);
  const closeRef = useRef(null);
  const overlayOpen = Boolean(active || guideOpen);
  const feature = features.find((item) => item.id === active);
  const department = departments.find((item) => item.id === departmentId);

  const selectDepartment = (id, trigger) => {
    window.clearTimeout(timer.current);
    departmentOrigin.current = trigger;
    setDepartmentId(id);
    setReplay((value) => value + 1);
    setPreview(null);
    setSelection(null);
    setActive(null);
  };
  const resetDepartment = () => {
    window.clearTimeout(timer.current);
    setDepartmentId(null);
    setPreview(null);
    setSelection(null);
    setActive(null);
    window.requestAnimationFrame(() => departmentOrigin.current?.focus());
  };

  useEffect(() => {
    if (!departmentId) return;
    const frame = window.requestAnimationFrame(() => {
      deckRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [departmentId, replay]);

  const openFeature = (id, trigger) => {
    if (selection || !department) return;
    origin.current = trigger || document.activeElement;
    setSelection(id);
    timer.current = window.setTimeout(() => setActive(id), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320);
  };
  const closeOverlay = () => {
    window.clearTimeout(timer.current);
    setActive(null);
    setGuideOpen(false);
    setSelection(null);
    setPreview(null);
    window.requestAnimationFrame(() => origin.current?.focus());
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!overlayOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    modal.current?.scrollTo({ top: 0 });
    const handleKey = (event) => {
      if (event.key === "Escape") closeOverlay();
      if (event.key !== "Tab") return;
      const controls = [...modal.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter((el) => el.getClientRects().length && el.tabIndex >= 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKey); };
  }, [overlayOpen, active, guideOpen]);

  return (
    <>
      <div className={`workspace ${selection ? "has-selection" : ""}`} inert={overlayOpen ? true : undefined}>
        <header className="site-header">
          <a className="brand" href="#" aria-label="Digital Audit 홈" onClick={resetDepartment}><span className="brand-mark">a.</span><span className="brand-name">Digital Audit<span>ETHICS, MADE VISIBLE.</span></span></a>
          <nav className="header-nav" aria-label="주 메뉴"><span className="nav-current">부서 대시보드</span><button onClick={(event) => { window.clearTimeout(timer.current); setSelection(null); origin.current = event.currentTarget; setGuideOpen(true); }}>점검 가이드 <span aria-hidden="true">↗</span></button></nav>
          <span className="demo-label"><span className="status-dot" /> 데모 워크스페이스</span>
        </header>

        <main id="main">
          <DepartmentDashboard departments={departments} selectedDepartment={department || null} onSelect={selectDepartment} onReset={resetDepartment} />
          <p className="sr-only" role="status">{department ? `${department.name}의 감사 카드 5개를 펼쳤습니다.` : "부서를 선택하면 감사 카드가 펼쳐집니다."}</p>
          {department && <section className="department-toolkit tool-section" aria-labelledby="toolkit-title" ref={deckRef}>
            <div className="toolkit-heading">
              <div><p className="eyebrow">{department.english} / AUDIT TOOLKIT</p><h2 id="toolkit-title">{department.name}<span>의 감사 도구</span></h2></div>
              <div className="toolkit-actions"><span className={`toolkit-status ${department.anomalies ? "has-alerts" : ""}`}>{department.anomalies ? `이상징후 ${department.anomalies}건` : "이상징후 없음"}</span><button className="replay-button" disabled={Boolean(selection)} onClick={() => { setPreview(null); setReplay((value) => value + 1); }}>다시 펼치기 <span aria-hidden="true">↻</span></button><button className="toolkit-close" onClick={resetDepartment} aria-label="감사 카드 닫기">×</button></div>
            </div>
            <div className="card-stage" key={`${department.id}-${replay}`}>
              {features.map((item, index) => <FeatureCard key={item.id} feature={item} department={department} index={index} onOpen={openFeature} onPreview={setPreview} selected={selection === item.id} hasSelection={Boolean(selection)} />)}
            </div>
            <div className="deck-hint"><span className="hint-line" /><span className="desktop-hint">카드를 선택해 {department.name}의 점검을 이어가세요</span><span className="mobile-hint">옆으로 넘겨 {department.name}의 도구를 선택하세요</span><span className="hint-line" /></div>
            <nav className="module-index" aria-label={`${department.name} 감사 기능 바로가기`}>
              {features.map((item, index) => <button key={item.id} className={preview === index ? "is-highlighted" : ""} style={{ "--accent": item.color }} onMouseEnter={() => setPreview(index)} onMouseLeave={() => setPreview(null)} onClick={(event) => openFeature(item.id, event.currentTarget)} aria-haspopup="dialog"><span className="index-number">{item.number}</span><span>{item.title}</span><span className="index-arrow" aria-hidden="true">↗</span></button>)}
            </nav>
          </section>}
        </main>
        <footer className="site-footer"><span>Better evidence. Clearer decisions.</span><span>예시 데이터로 구성된 프런트 미리보기 <span className="footer-separator">/</span> © 2026 DIGITAL AUDIT</span></footer>
      </div>

      {overlayOpen && <div className={`detail-overlay ${guideOpen ? "guide-overlay" : ""}`} role="dialog" aria-modal="true" aria-labelledby={guideOpen ? "guide-title" : "detail-dialog-title"} ref={modal}>
        <div className="detail-topbar"><span className="detail-brand">a. <span>DIGITAL AUDIT</span></span><span className="detail-top-label">{guideOpen ? "GETTING STARTED" : `${department.name} / ${feature.english}`}</span><button ref={closeRef} className="close-detail" onClick={closeOverlay}>부서 대시보드로 <span aria-hidden="true">×</span></button></div>
        {guideOpen ? <div className="guide-content"><p className="eyebrow">FROM SIGNAL TO EVIDENCE</p><h2 id="guide-title">조직의 신호부터,<br />판단의 근거까지.</h2><p className="guide-intro">먼저 부서 블록을 선택하세요. 선택한 부서의 감사 카드들이 왼쪽에서 펼쳐집니다.<br />빨간 블록은 이상징후가 있는 부서이며, 건수가 많을수록 높게 올라갑니다.</p><ol>{features.map((item) => <li key={item.id}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></li>)}</ol><button className="guide-return" onClick={closeOverlay}>부서 대시보드로 돌아가기 ↗</button><p className="guide-note">부서명, 거래 내역, 이상징후 수치는 모두 화면 흐름을 보여주는 예시입니다. 실제 거래 분석과 파일 처리는 연결되어 있지 않습니다.</p></div> : <><h2 id="detail-dialog-title" className="sr-only">{department.name} · {feature.title}</h2><FeatureDetail key={`${department.id}-${feature.id}`} feature={feature} department={department} onClose={closeOverlay} onNavigate={(id) => { setSelection(id); setActive(id); }} /></>}

      </div>}
    </>
  );
}
