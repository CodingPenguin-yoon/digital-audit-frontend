import React, { useEffect, useRef, useState } from "react";
import { FeatureDetail } from "./FeatureDetail.jsx";

export const features = [
  { id: "upload", number: "01", title: "데이터 업로드", english: "THE FOUNDATION", description: "거래 내역과 증빙을 모아, 점검의 첫 단계를 준비하세요.", color: "#d5ddd7", surface: "#272b29" },
  { id: "detect", number: "02", title: "이상징후 탐지", english: "LOOK CLOSER", description: "수많은 거래 속, 다시 살펴봐야 할 신호를 발견하세요.", color: "#a6d2b1", surface: "#19392b" },
  { id: "discover", number: "03", title: "새 패턴 발견", english: "BEYOND THE RULES", description: "익숙한 기준 너머의 새로운 이상 패턴을 살펴보세요.", color: "#e7c18b", surface: "#40311f" },
  { id: "compare", number: "04", title: "증빙 대조", english: "EVERY DETAIL COUNTS", description: "거래와 증빙을 나란히 놓고, 작은 차이까지 확인하세요.", color: "#cfbae1", surface: "#322640" },
  { id: "forgery", number: "05", title: "위변조 분석", english: "TRACE THE EVIDENCE", description: "파일 속 흔적을 따라, 증빙을 더 깊이 살펴보세요.", color: "#b0cde6", surface: "#1f3446" },
];

function FeatureCard({ feature, index, onOpen, onPreview, selected, hasSelection }) {
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
          <span className="card-topline"><span>DIGITAL AUDIT</span><span>{feature.number} / 05</span></span>
          <span className="card-art" aria-hidden="true"><img src="/assets/card-sculpture.png" alt="" draggable="false" /></span>
          <span className="card-content"><span className="card-english">{feature.english}</span><span className="card-title">{feature.title}</span><span className="card-description">{feature.description}</span></span>
          <span className="card-bottom"><span>EXPLORE MODULE</span><span className="card-arrow" aria-hidden="true">↗</span></span>
        </span>
        <span className="card-edge" aria-hidden="true" />
      </button>
    </div>
  );
}

export function App() {
  const [preview, setPreview] = useState(null);
  const [selection, setSelection] = useState(null);
  const [active, setActive] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [replay, setReplay] = useState(0);
  const timer = useRef(null);
  const origin = useRef(null);
  const modal = useRef(null);
  const closeRef = useRef(null);
  const overlayOpen = Boolean(active || guideOpen);
  const feature = features.find((item) => item.id === active);

  const openFeature = (id, trigger) => {
    if (selection) return;
    origin.current = trigger || document.activeElement;
    setSelection(id);
    timer.current = window.setTimeout(() => setActive(id), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 320);
  };
  const closeOverlay = () => {
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
          <a className="brand" href="#" aria-label="Digital Audit 홈"><span className="brand-mark">a.</span><span className="brand-name">Digital Audit<span>ETHICS, MADE VISIBLE.</span></span></a>
          <nav className="header-nav" aria-label="주 메뉴"><span className="nav-current">워크스페이스</span><button onClick={(event) => { origin.current = event.currentTarget; setGuideOpen(true); }}>점검 가이드 <span aria-hidden="true">↗</span></button></nav>
          <span className="demo-label"><span className="status-dot" /> 데모 워크스페이스</span>
        </header>

        <main id="main">
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-heading"><p className="eyebrow"><span /> A CLEARER PERSPECTIVE</p><h1 id="hero-title">더 깊이 살피고,<br /><span>더 선명하게.</span></h1></div>
            <div className="hero-intro"><p>흩어진 거래에서 의미 있는 신호까지.<br />다섯 가지 도구로, 판단의 근거를 만듭니다.</p><button className="text-link" onClick={(event) => openFeature("detect", event.currentTarget)}>예시로 둘러보기 <span aria-hidden="true">↗</span></button></div>
          </section>

          <section className="tool-section" aria-label="감사 기능 선택">
            <div className="deck-caption"><span>YOUR AUDIT TOOLKIT</span><button className="replay-button" onClick={() => { setPreview(null); setReplay((value) => value + 1); }}>다시 펼치기 <span aria-hidden="true">↻</span></button></div>
            <div className="card-stage" key={replay}>
              {features.map((item, index) => <FeatureCard key={item.id} feature={item} index={index} onOpen={openFeature} onPreview={setPreview} selected={selection === item.id} hasSelection={Boolean(selection)} />)}
            </div>
            <div className="deck-hint"><span className="hint-line" /><span className="desktop-hint">카드에 마우스를 올려 살펴보고, 클릭해 시작하세요</span><span className="mobile-hint">옆으로 넘겨 카드를 선택하세요</span><span className="hint-line" /></div>
          </section>

          <section className="module-index" aria-label="기능 바로가기">
            {features.map((item, index) => <button key={item.id} className={preview === index ? "is-highlighted" : ""} style={{ "--accent": item.color }} onMouseEnter={() => setPreview(index)} onMouseLeave={() => setPreview(null)} onClick={(event) => openFeature(item.id, event.currentTarget)} aria-haspopup="dialog"><span className="index-number">{item.number}</span><span>{item.title}</span><span className="index-arrow" aria-hidden="true">↗</span></button>)}
          </section>
        </main>
        <footer className="site-footer"><span>Better evidence. Clearer decisions.</span><span>예시 데이터로 구성된 프런트 미리보기 <span className="footer-separator">/</span> © 2026 DIGITAL AUDIT</span></footer>
      </div>

      {overlayOpen && <div className={`detail-overlay ${guideOpen ? "guide-overlay" : ""}`} role="dialog" aria-modal="true" aria-labelledby={guideOpen ? "guide-title" : "detail-dialog-title"} ref={modal}>
        <div className="detail-topbar"><span className="detail-brand">a. <span>DIGITAL AUDIT</span></span><span className="detail-top-label">{guideOpen ? "GETTING STARTED" : `${feature.number} / 05 — ${feature.english}`}</span><button ref={closeRef} className="close-detail" onClick={closeOverlay}>워크스페이스로 <span aria-hidden="true">×</span></button></div>
        {guideOpen ? <div className="guide-content"><p className="eyebrow">A GUIDE TO CLEARER DECISIONS</p><h2 id="guide-title">점검의 시작부터,<br />판단의 근거까지.</h2><p className="guide-intro">필요한 기능의 카드를 선택해 각 단계를 살펴보세요.</p><ol>{features.map((item) => <li key={item.id}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.description}</p></div><button onClick={() => { setGuideOpen(false); setSelection(item.id); setActive(item.id); }} aria-label={`${item.title} 열기`}>열기 ↗</button></li>)}</ol><p className="guide-note">현재 화면은 예시 데이터로 기능의 흐름을 확인하는 프런트 미리보기입니다. 실제 거래 분석과 파일 처리는 연결되어 있지 않습니다.</p></div> : <><h2 id="detail-dialog-title" className="sr-only">{feature.title}</h2><FeatureDetail key={feature.id} feature={feature} onClose={closeOverlay} onNavigate={(id) => { setSelection(id); setActive(id); }} /></>}
      </div>}
    </>
  );
}
