import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarBlank, Cube, Fingerprint, Pause, Play, ShieldCheck, Sparkle, UploadSimple, X } from "@phosphor-icons/react";
import { Upload } from "./FeatureDetail.jsx";
import { CommandScene } from "./CommandScene.jsx";
import { AuditScope, AuditTypes, TransactionFeed } from "./CommandPanels.jsx";
import { TransactionReview } from "./TransactionReview.jsx";
import { NaturalAuditRequest, PatternWorkbench } from "./WorkflowPanels.jsx";
import { departments } from "./departments.js";
import { auditScenarios, auditTypes, buildRiskMatrix, getAuditRows } from "./audit-data.js";
import "./command-tools.css";
import "./audit-workspace.css";

const totalTransactions = departments.reduce((sum, item) => sum + item.transactions, 0);
const totalSignals = departments.reduce((sum, item) => sum + item.anomalies, 0);
const modules = [
  { id: "review", label: "거래 검토", description: "근거 확인부터 판정까지", icon: ShieldCheck },
  { id: "patterns", label: "패턴 검토", description: "새 점검 기준의 등록과 기각", icon: Sparkle },
  { id: "upload", label: "자료 업로드", description: "거래 내역과 증빙 준비", icon: UploadSimple },
];

function readSaved(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function App() {
  const [tab, setTab] = useState("dashboard");
  const [role, setRole] = useState("auditor");
  const [departmentId, setDepartmentId] = useState(null);
  const [categoryId, setCategoryId] = useState("all");
  const [scenarioId, setScenarioId] = useState(null);
  const [dateRange, setDateRange] = useState({});
  const [activeModule, setActiveModule] = useState("review");
  const [statusFilter, setStatusFilter] = useState("all");
  const [autoRotate, setAutoRotate] = useState(false);
  const [inspectedId, setInspectedId] = useState(null);
  const [reviews, setReviews] = useState(() => readSaved("digital-audit-reviews-v1"));
  const [patternDecisions, setPatternDecisions] = useState(() => readSaved("digital-audit-patterns-v1"));
  const [storageWarning, setStorageWarning] = useState(false);
  const toolsHeading = useRef(null);
  const inspectorOrigin = useRef(null);
  const department = departments.find((item) => item.id === departmentId) || null;
  const inspectedDepartment = departments.find((item) => item.exampleTransactions.some((record) => record.id === inspectedId));
  const inspectedRecord = inspectedDepartment?.exampleTransactions.find((item) => item.id === inspectedId);
  const category = auditTypes.find((item) => item.id === categoryId);
  const scenario = auditScenarios.find((item) => item.id === scenarioId);
  const matrix = useMemo(() => buildRiskMatrix(departments, categoryId, dateRange), [categoryId, dateRange]);
  const filterOptions = { ...dateRange, scenarioId };
  const visibleSignals = getAuditRows(departments, departmentId, categoryId, filterOptions).length;
  const unreviewedCount = getAuditRows(departments, null, "all", { includeNormal: true }).filter((record) => !reviews[record.id]?.verdict).length;
  const requestedCount = Object.values(patternDecisions).filter((decision) => decision.status === "requested").length;

  useEffect(() => {
    try {
      window.localStorage.setItem("digital-audit-reviews-v1", JSON.stringify(reviews));
      window.localStorage.setItem("digital-audit-patterns-v1", JSON.stringify(patternDecisions));
      setStorageWarning(false);
    } catch { setStorageWarning(true); }
  }, [reviews, patternDecisions]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setAutoRotate(false); };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const selectDepartment = useCallback((id) => {
    setDepartmentId(id);
    setAutoRotate(false);
  }, []);
  const selectCategory = (id) => {
    setCategoryId(id);
    setScenarioId(null);
    setAutoRotate(false);
  };
  const selectCell = (id, scenario) => {
    setDepartmentId(id);
    setScenarioId(scenario);
    setStatusFilter("all");
    setAutoRotate(false);
  };
  const clearFilters = () => {
    setDepartmentId(null);
    setCategoryId("all");
    setScenarioId(null);
    setDateRange({});
    setStatusFilter("all");
  };
  const inspect = (id) => {
    if (!inspectedId) inspectorOrigin.current = document.activeElement;
    setAutoRotate(false);
    setInspectedId(id);
  };
  const closeInspector = useCallback(() => {
    setInspectedId(null);
    window.requestAnimationFrame(() => inspectorOrigin.current?.isConnected && inspectorOrigin.current.focus());
  }, []);
  const openTools = (module = "review") => {
    setTab("tools");
    setActiveModule(module);
    setAutoRotate(false);
    window.requestAnimationFrame(() => toolsHeading.current?.focus());
  };
  const applyRequest = ({ departmentId, scenarioId, fromDate, toDate }) => {
    setDepartmentId(departmentId);
    setScenarioId(scenarioId);
    setCategoryId("all");
    setDateRange({ fromDate, toDate });
    setStatusFilter("all");
    setAutoRotate(false);
  };
  const feedProps = {
    department, departments, categoryId, scenarioId, dateRange, reviews, statusFilter,
    onStatusChange: setStatusFilter, onCategoryChange: selectCategory,
    onClearDepartment: () => selectDepartment(null), onClearScenario: () => setScenarioId(null),
    onClearDates: () => setDateRange({}), onInspect: inspect,
  };

  return <>
    <div className="command-app" inert={inspectedRecord ? true : undefined}>
      <header className="command-header">
        <a className="command-brand" href="#" onClick={(event) => { event.preventDefault(); setTab("dashboard"); }} aria-label="Digital Audit 대시보드">
          <span className="brand-symbol"><Fingerprint size={27} weight="light" /></span>
          <span>Digital Audit<small>SEE THE SIGNAL. FIND THE EVIDENCE.</small></span>
        </a>
        <nav className="command-nav" aria-label="주 메뉴">
          <button className={tab === "dashboard" ? "is-active" : ""} aria-current={tab === "dashboard" ? "page" : undefined} onClick={() => setTab("dashboard")}><Cube size={17} />리스크 대시보드</button>
          <button className={tab === "tools" ? "is-active" : ""} aria-current={tab === "tools" ? "page" : undefined} onClick={() => openTools(activeModule)}><ShieldCheck size={17} />감사 도구</button>
        </nav>
        <div className="header-context"><CalendarBlank size={15} /><span>2026.03</span><span className="example-badge">예시 데이터</span></div>
        <label className="role-select"><span>시연 역할</span><select aria-label="역할 선택" value={role} onChange={(event) => setRole(event.target.value)}><option value="auditor">감사 담당자</option><option value="admin">관리자</option></select></label>
      </header>

      <main className="command-main" id="main">
        {tab === "dashboard" ? <>
          <section className="command-intro" aria-labelledby="dashboard-title">
            <div><p className="command-eyebrow"><span /> ETHICS AUDIT / REVIEW TO DECISION</p><h1 id="dashboard-title">작은 신호에서, <span>명확한 판단으로.</span></h1></div>
            <div className="audit-summary" aria-label="원본 집계 예시"><span className="audit-summary-label">원본 집계 예시</span><span><strong>{departments.length.toString().padStart(2, "0")}</strong> 부서</span><span><strong>{totalTransactions.toLocaleString("ko-KR")}</strong> 거래</span><span><strong>{totalSignals}</strong> 이상징후</span></div>
          </section>
          <NaturalAuditRequest departments={departments} scenarios={auditScenarios} onApply={applyRequest} activeConditions={{ departmentId, categoryId, scenarioId, ...dateRange }} />
          <section className="role-task" aria-label="역할별 할 일"><div><span className="role-task-icon">{role === "auditor" ? <ShieldCheck size={21} /> : <Sparkle size={21} />}</span><div><strong>{role === "auditor" ? "오늘의 거래 검토" : "점검 기준을 더 정교하게"}</strong><span>{role === "auditor" ? `미검토 거래 ${unreviewedCount}건 · 근거를 확인하고 판정을 남겨 주세요.` : `등록 요청 ${requestedCount}건 · 새 패턴의 조건과 근거를 검토해 주세요.`}</span></div></div><button onClick={() => { if (role === "auditor") { clearFilters(); setStatusFilter("unreviewed"); } openTools(role === "auditor" ? "review" : "patterns"); }}>{role === "auditor" ? "미검토 거래 보기" : "패턴 등록·기각"}<ArrowRight size={15} /></button></section>
          <div className="command-grid">
            <aside className="command-left" aria-label="감사 범위"><AuditScope departments={departments} selectedId={departmentId} onSelect={selectDepartment} onOpenUpload={() => openTools("upload")} /></aside>
            <section className="command-stage" aria-labelledby="scene-title">
              <div className="stage-heading"><div><p className="command-eyebrow">SCENARIO × DEPARTMENT</p><h2 id="scene-title">시나리오별 리스크 맵 <span>3D</span></h2></div><span className="stage-coordinate">{category?.title || "전체 점검 유형"}<strong>{matrix.total}<small>건 · 표시된 예시</small></strong></span></div>
              <div className="scene-selection"><span>{department?.name || "전체 부서"}</span><span>{scenario?.title || "전체 시나리오"}</span>{(department || scenario) && <button onClick={() => { setDepartmentId(null); setScenarioId(null); }} aria-label="맵 선택 해제"><X size={12} />선택 해제</button>}</div>
              <div className="stage-model" onPointerDownCapture={() => setAutoRotate(false)} onFocusCapture={() => setAutoRotate(false)}><CommandScene departments={matrix.departments} scenarios={matrix.scenarios} cells={matrix.cells} selectedId={departmentId} selectedScenarioId={scenarioId} onSelect={selectCell} autoRotate={autoRotate} /></div>
              <div className="scene-legend"><span><i className="legend-alert" />검토 신호</span><span><i />0건</span><span className="legend-note">높이 · 거래 건수</span></div>
              <div className="scene-toolbar"><span className="scene-help">신호 건수 상위 최대 8개 · 현재 {matrix.departments.length}개 부서</span><div className="scene-controls"><button className="auto-control" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate}>{autoRotate ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}<span>{autoRotate ? "자동 회전 중" : "자동 회전"}</span></button></div></div>
            </section>
            <aside className="command-right" aria-label="점검 유형"><AuditTypes department={department} categoryId={categoryId} onCategoryChange={selectCategory} dateRange={dateRange} scenarioId={scenarioId} onOpenPatterns={() => openTools("patterns")} /></aside>
          </div>
          <section className="command-feed"><TransactionFeed {...feedProps} /></section>
          <p className="sr-only" role="status">{department?.name || "전체 부서"}, {scenario?.title || category?.title || "전체 시나리오"}. 검토할 예시 거래 {visibleSignals}건.</p>
        </> : <section className="tools-workspace" aria-labelledby="tools-title">
          <div className="tools-heading"><div><p className="command-eyebrow">FROM SIGNAL TO DECISION</p><h1 id="tools-title" ref={toolsHeading} tabIndex={-1}>감사 워크스페이스</h1></div><div className="workspace-context"><span>{role === "auditor" ? "감사 담당자" : "관리자"}</span><label>점검 부서<select aria-label="감사 도구 점검 부서" value={departmentId || ""} onChange={(event) => selectDepartment(event.target.value || null)}><option value="">전체 부서</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div></div>
          <div className="workspace-layout"><aside className="workspace-nav"><span className="command-eyebrow">WORKSPACE</span>{modules.map(({ id, label, description, icon: Icon }, index) => <button key={id} aria-current={activeModule === id ? "page" : undefined} onClick={() => setActiveModule(id)}><span className="module-number">0{index + 1}</span><Icon size={19} /><span><strong>{label}</strong><small>{description}</small></span>{id === "patterns" && requestedCount > 0 && <em>{requestedCount}</em>}</button>)}<p>거래의 근거를 확인하고,<br />검토의 결과를 남깁니다.</p></aside><div className="workspace-content">
            {activeModule === "review" && <><div className="workspace-section-heading"><span className="command-eyebrow">TRANSACTION REVIEW</span><h2>확인부터 판정까지, 한 화면에서.</h2><p>거래를 선택하면 탐지 이유·증빙 대조·위변조 신호를 함께 확인할 수 있습니다.</p></div><TransactionFeed {...feedProps} includeNormal /></>}
            {activeModule === "patterns" && <PatternWorkbench role={role} decisions={patternDecisions} onDecide={(id, decision) => setPatternDecisions((current) => ({ ...current, [id]: decision }))} onInspect={inspect} departmentId={departmentId} />}
            {activeModule === "upload" && <div className="fd-shell upload-workspace"><div className="fd-content"><Upload onNavigate={setActiveModule} /></div></div>}
          </div></div>
        </section>}
        {storageWarning && <p className="storage-warning" role="alert">브라우저 저장을 사용할 수 없어 이번 화면에만 기록됩니다. 새로고침하면 기록이 사라질 수 있습니다.</p>}
      </main>
      <footer className="command-footer"><span><span className="footer-indicator" />DIGITAL AUDIT <span className="footer-slash">/</span> REVIEW TO DECISION</span><span>가상 데이터 · 판정·패턴 결정은 이 브라우저에 저장 · 실제 분석·권한 연결 전</span></footer>
    </div>
    {inspectedRecord && <TransactionReview key={inspectedRecord.id} record={inspectedRecord} department={inspectedDepartment} role={role} review={reviews[inspectedRecord.id]} onSave={(review) => setReviews((current) => ({ ...current, [inspectedRecord.id]: review }))} onClose={closeInspector} onInspectRelated={inspect} />}
  </>;
}
