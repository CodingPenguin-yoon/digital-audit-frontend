import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Buildings, CalendarBlank, ChartLineUp, Cube, Fingerprint, Pause, Play, ShieldCheck, X } from "@phosphor-icons/react";
import { FeatureDetail } from "./FeatureDetail.jsx";
import { CommandScene } from "./CommandScene.jsx";
import { DataSignalChart, DepartmentRanking, RiskDistribution, SelectedDepartment, SignalOverview, TransactionFeed } from "./CommandPanels.jsx";
import { departments } from "./departments.js";
import "./command-tools.css";

export const features = [
  { id: "upload", number: "01", title: "데이터 업로드", description: "거래 내역과 증빙을 모아 점검을 준비합니다.", color: "#c7a45e" },
  { id: "detect", number: "02", title: "이상징후 탐지", description: "검토가 필요한 거래를 좁히고 판단의 근거를 확인합니다.", color: "#c7a45e" },
  { id: "discover", number: "03", title: "새 패턴 발견", description: "기존 점검 기준 너머의 반복과 연결을 살펴봅니다.", color: "#dfc38a" },
  { id: "compare", number: "04", title: "증빙 대조", description: "거래 내역과 증빙의 세부 항목을 비교합니다.", color: "#dfc38a" },
  { id: "forgery", number: "05", title: "위변조 분석", description: "파일의 동일성, 이미지 신호와 생성 이력을 살펴봅니다.", color: "#c7a45e" },
];

const totalTransactions = departments.reduce((sum, item) => sum + item.transactions, 0);
const totalSignals = departments.reduce((sum, item) => sum + item.anomalies, 0);

export function App() {
  const [tab, setTab] = useState("dashboard");
  const [departmentId, setDepartmentId] = useState("sales");
  const [activeFeature, setActiveFeature] = useState("detect");
  const [toolRecordId, setToolRecordId] = useState(null);
  const [autoRotate, setAutoRotate] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [inspectedId, setInspectedId] = useState(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const originRef = useRef(null);
  const toolsHeading = useRef(null);
  const department = departments.find((item) => item.id === departmentId);
  const feature = features.find((item) => item.id === activeFeature);
  const inspectedRecord = department.exampleTransactions.find((item) => item.id === inspectedId);

  const selectDepartment = useCallback((id) => {
    setDepartmentId(id);
    setAutoRotate(false);
    setInspectedId(null);
    setToolRecordId(null);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setAutoRotate(false); };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  const stepDepartment = (direction) => {
    const next = (departments.findIndex((item) => item.id === departmentId) + direction + departments.length) % departments.length;
    selectDepartment(departments[next].id);
  };

  useEffect(() => {
    if (!autoRotate || tab !== "dashboard" || inspectedId) return;
    const timer = window.setInterval(() => {
      setDepartmentId((current) => departments[(departments.findIndex((item) => item.id === current) + 1) % departments.length].id);
    }, 9000);
    return () => window.clearInterval(timer);
  }, [autoRotate, tab, inspectedId]);

  const inspect = (id) => {
    originRef.current = document.activeElement;
    setAutoRotate(false);
    setInspectedId(id);
  };
  const closeInspector = useCallback(() => {
    setInspectedId(null);
    window.requestAnimationFrame(() => originRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!inspectedRecord) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") closeInspector();
      if (event.key !== "Tab") return;
      const controls = [...dialogRef.current.querySelectorAll("button, a[href], [tabindex='0']")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); };
  }, [inspectedRecord, closeInspector]);

  const openTools = () => {
    setTab("tools");
    setAutoRotate(false);
    setInspectedId(null);
    window.requestAnimationFrame(() => toolsHeading.current?.focus());
  };

  return <>
    <div className="command-app" inert={inspectedRecord ? true : undefined}>
      <header className="command-header">
        <a className="command-brand" href="#" onClick={(event) => { event.preventDefault(); setTab("dashboard"); }} aria-label="Digital Audit 대시보드">
          <span className="brand-symbol"><Fingerprint size={27} weight="light" /></span>
          <span>Digital Audit<small>SEE THE SIGNAL. FIND THE EVIDENCE.</small></span>
        </a>
        <nav className="command-nav" aria-label="주 메뉴">
          <button className={tab === "dashboard" ? "is-active" : ""} aria-current={tab === "dashboard" ? "page" : undefined} onClick={() => setTab("dashboard")}><Cube size={17} />부서 대시보드</button>
          <button className={tab === "tools" ? "is-active" : ""} aria-current={tab === "tools" ? "page" : undefined} onClick={openTools}><ShieldCheck size={17} />감사 도구</button>
        </nav>
        <div className="header-context"><CalendarBlank size={15} /><span>2026.03</span><span className="example-badge">예시 데이터</span></div>
      </header>

      <main className="command-main" id="main">
        {tab === "dashboard" ? <>
          <section className="command-intro" aria-labelledby="dashboard-title">
            <div><p className="command-eyebrow"><span /> ORGANIZATION RISK INTELLIGENCE</p><h1 id="dashboard-title">조직의 신호를, <span>한눈에.</span></h1></div>
            <div className="intro-caption"><span>DEPARTMENT OVERVIEW</span><p>입체로 읽는 부서별 감사 현황</p></div>
          </section>

          <section className="command-metrics" aria-label="전체 부서 감사 지표">
            <div><span className="metric-icon"><Buildings size={20} /></span><div><span className="metric-label">점검 부서</span><strong>{departments.length.toString().padStart(2, "0")}<small>개 부서</small></strong></div><span className="metric-meta">ORGANIZATION</span></div>
            <div><span className="metric-icon"><ChartLineUp size={20} /></span><div><span className="metric-label">전체 거래</span><strong>{totalTransactions.toLocaleString("ko-KR")}<small>건</small></strong></div><span className="metric-meta">TRANSACTIONS</span></div>
            <div className="metric-alert"><span className="metric-icon"><Fingerprint size={20} /></span><div><span className="metric-label">검토할 이상징후</span><strong>{totalSignals}<small>건</small></strong></div><span className="metric-meta">REVIEW SIGNALS</span></div>
            <div className="metric-rate"><span className="metric-icon"><ChartLineUp size={20} /></span><div><span className="metric-label">전체 이상징후 비율</span><strong>{(totalSignals / totalTransactions * 100).toFixed(2)}<small>%</small></strong></div><span className="metric-meta">SIGNAL RATE</span></div>
          </section>

          <div className="command-grid">
            <aside className="command-left" aria-label="조직 요약">
              <DepartmentRanking departments={departments} selectedId={departmentId} onSelect={selectDepartment} />
              <SignalOverview departments={departments} />
            </aside>
            <section className="command-stage" aria-labelledby="scene-title">
              <div className="stage-heading"><div><p className="command-eyebrow">SPATIAL RISK MAP</p><h2 id="scene-title">부서별 리스크 맵 <span>3D</span></h2></div><span className="stage-coordinate">06 DEPARTMENTS / 01 ORGANIZATION</span></div>
              <div className="stage-wall"><DataSignalChart departments={departments} selectedId={departmentId} onSelect={selectDepartment} /></div>
              <div className="stage-model" onPointerDownCapture={() => setAutoRotate(false)} onFocusCapture={() => setAutoRotate(false)}><CommandScene departments={departments} selectedId={departmentId} onSelect={selectDepartment} autoRotate={autoRotate} /></div>
              <div className="scene-legend"><span><i className="legend-alert" />이상징후 · 높이로 표시</span><span><i />추가 신호 없음</span></div>
              <div className="scene-toolbar">
                <span className="scene-help"><Cube size={14} />드래그로 회전 · 부서 선택</span>
                <div className="scene-controls"><button onClick={() => stepDepartment(-1)} aria-label="이전 부서"><ArrowLeft size={16} /></button><button className="auto-control" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate}>{autoRotate ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}<span>{autoRotate ? "자동 순환 중" : "자동 순환"}</span></button><button onClick={() => stepDepartment(1)} aria-label="다음 부서"><ArrowRight size={16} /></button></div>
                <span className="scene-index">{(departments.indexOf(department) + 1).toString().padStart(2, "0")}<span> / 06</span></span>
              </div>
              <div key={departmentId} className={`scene-progress ${autoRotate ? "is-playing" : ""}`} aria-hidden="true" />
            </section>
            <aside className="command-right" aria-label="선택 부서 상세">
              <SelectedDepartment department={department} onInspect={inspect} />
              <RiskDistribution department={department} />
              <button className="tools-link" onClick={openTools}><span><ShieldCheck size={19} /><span>근거를 더 깊이 살펴보기<small>{department.name} 감사 도구 열기</small></span></span><ArrowUpRight size={19} /></button>
            </aside>
          </div>
          <section className="command-feed" onFocusCapture={() => setAutoRotate(false)} onPointerDownCapture={() => setAutoRotate(false)}><TransactionFeed key={departmentId} department={department} onInspect={inspect} /></section>
          <p className="sr-only" role="status">{department.name} 선택. 전체 거래 {department.transactions}건, 이상징후 {department.anomalies}건.</p>
        </> : <section className="tools-workspace" aria-labelledby="tools-title">
          <div className="tools-heading"><div><p className="command-eyebrow">FROM SIGNAL TO EVIDENCE</p><h1 id="tools-title" ref={toolsHeading} tabIndex={-1}>감사 워크스페이스</h1></div><label>점검 부서<select aria-label="감사 도구 점검 부서" value={departmentId} onChange={(event) => selectDepartment(event.target.value)}>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
          <FeatureDetail key={`${departmentId}-${activeFeature}`} feature={feature} department={department} initialTransactionId={toolRecordId} onNavigate={setActiveFeature} />
        </section>}
      </main>
      <footer className="command-footer"><span><span className="footer-indicator" />DIGITAL AUDIT <span className="footer-slash">/</span> ORGANIZATION INTELLIGENCE</span><span>화면 흐름을 위한 가상 데이터 · 실제 분석 연결 전 <ArrowDown size={11} /></span></footer>
    </div>
    {inspectedRecord && <div className="evidence-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeInspector(); }}><section className="evidence-dialog" role="dialog" aria-modal="true" aria-labelledby="evidence-title" ref={dialogRef}>
      <div className="evidence-top"><span><Fingerprint size={18} /> EVIDENCE INSPECTOR</span><button ref={closeRef} onClick={closeInspector} aria-label="거래 근거 닫기"><X size={22} /></button></div>
      <p className="command-eyebrow">{department.name} / {inspectedRecord.id}</p><h2 id="evidence-title">{inspectedRecord.shop}</h2><div className="evidence-amount">{inspectedRecord.amount}<span>원</span></div>
      <dl className="evidence-facts"><div><dt>거래일</dt><dd>{inspectedRecord.date}</dd></div><div><dt>점검 신호</dt><dd className={inspectedRecord.level === "정상" ? "" : "text-alert"}>{inspectedRecord.type}</dd></div><div><dt>검토 우선도</dt><dd>{inspectedRecord.level}</dd></div></dl>
      <div className="evidence-reason"><span className="command-eyebrow">REVIEW CONTEXT</span><h3>확인할 내용</h3><p>{inspectedRecord.reason}</p><div>{inspectedRecord.evidence}</div></div>
      <button className="evidence-primary" onClick={() => { setActiveFeature("detect"); setToolRecordId(inspectedRecord.id); openTools(); }}>감사 도구에서 이어서 확인<ArrowUpRight size={19} /></button><p className="evidence-note">가상 거래 예시입니다. 이상징후는 검토 신호이며 위반 여부를 확정하지 않습니다.</p>
    </section></div>}
  </>;
}
