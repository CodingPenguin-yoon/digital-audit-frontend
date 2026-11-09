import { useId, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, CheckCircle, Clock, MagnifyingGlass, Sparkle, XCircle } from "@phosphor-icons/react";
import { parseAuditRequest } from "./audit-request.js";
import "./workflow-panels.css";

const requestExamples = ["3월 영업팀의 휴일 사용을 확인해줘", "증빙이 누락된 거래를 찾아줘", "3월 재무팀의 동일 증빙 재사용을 확인해줘"];

export function NaturalAuditRequest({ departments, scenarios, onApply, activeConditions = null }) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const applied = Boolean(preview && activeConditions && activeConditions.categoryId === "all" && ["departmentId", "scenarioId", "fromDate", "toDate"].every((key) => (activeConditions[key] || null) === preview[key]));
  const changeQuery = (value) => { setQuery(value); setPreview(null); setError(""); };
  const interpret = (event) => {
    event.preventDefault();
    const result = parseAuditRequest(query, departments, scenarios);
    setError(result.error || "");
    setPreview(result.error ? null : result);
  };
  return <section className="wp-request" aria-label="자연어 점검 요청">
    <form className="wp-request-form" onSubmit={interpret}>
      <label className="wp-request-label" htmlFor={inputId}><Sparkle size={20} weight="light" /><span>어떤 거래를 점검할까요?</span></label>
      <input id={inputId} type="text" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder="예: 3월 영업팀의 휴일 사용을 확인해줘" autoComplete="off" aria-describedby={`${inputId}-notice`} />
      <button type="submit" className="wp-primary"><MagnifyingGlass size={15} />조건 확인</button>
    </form>
    <div className="wp-request-examples"><span>예시 요청</span>{requestExamples.map((example) => <button type="button" key={example} onClick={() => changeQuery(example)}>{example}<ArrowUpRight size={11} /></button>)}<small id={`${inputId}-notice`}>예시 조건 해석 · 실제 AI 분석 전</small></div>
    {error && <p className="wp-request-error" role="alert">{error}</p>}
    {preview && <div className="wp-request-preview" aria-live="polite"><div><span className="wp-small-label">{applied ? "적용한 점검 조건" : "점검 전에 조건을 확인하세요"}</span><div className="wp-condition-chips"><span>{departments.find((department) => department.id === preview.departmentId)?.name || "전체 부서"}</span><span>{scenarios.find((scenario) => scenario.id === preview.scenarioId)?.title}</span><span>{preview.fromDate === "2026.03.01" && preview.toDate === "2026.03.31" ? "2026년 3월 전체" : preview.fromDate === preview.toDate ? preview.fromDate : `${preview.fromDate} – ${preview.toDate}`}</span></div></div><button type="button" className="wp-apply" disabled={applied} onClick={() => onApply(preview)}>{applied ? <><Check size={15} />조건 적용됨</> : <>이 조건으로 점검<ArrowRight size={15} /></>}</button></div>}
  </section>;
}

const candidates = [
  { id: "split-sales", departmentId: "sales", departmentName: "영업팀", title: "짧은 간격의 분할결제", description: "동일 가맹점의 인접 결제를 하나의 지출로 검토할 수 있는 후보입니다.", conditions: ["동일 가맹점", "10분 이내 인접 결제", "결제 합계 함께 검토"], observation: "오크 다이닝에서 20:14·20:22에 198,000원씩 결제한 예시입니다. 업무상 별도 지출인지 먼저 확인합니다.", recordId: "SL-0238", shop: "오크 다이닝", amount: "198,000원", scope: "영업팀 · 동일 가맹점의 인접 거래", caution: "같은 가맹점에서 발생한 서로 다른 업무 지출은 제외하도록 검토합니다." },
  { id: "late-marketing", departmentId: "marketing", departmentName: "마케팅팀", title: "반복되는 심야 업종 사용", description: "늦은 시간의 반복 사용을 행사·업무 기록과 함께 확인할 후보입니다.", conditions: ["23시 이후 사용", "동일 업종 반복", "행사 기록과 대조"], observation: "시티 라운지에서 23:18에 결제된 거래의 예시입니다. 동일 업종의 반복 여부와 행사 진행 기록을 함께 검토합니다.", recordId: "MK-0172", shop: "시티 라운지", amount: "162,000원", scope: "마케팅팀 · 심야 동일 업종 사용", caution: "야간 행사나 출장 등 사전 승인된 업무 사용을 구분하도록 검토합니다." },
];
const decisionLabels = { pending: "검토 대기", requested: "등록 요청", registered: "등록됨", rejected: "기각됨" };
const decisionIcons = { pending: Clock, requested: ArrowUpRight, registered: CheckCircle, rejected: XCircle };
const decisionDate = (value) => new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function PatternWorkbench({ role, decisions, onDecide, onInspect, departmentId }) {
  const [activeId, setActiveId] = useState(candidates[0].id);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const scoped = !showAll && departmentId ? candidates.filter((item) => item.departmentId === departmentId) : candidates;
  const candidate = scoped.find((item) => item.id === activeId) || scoped[0];
  const decision = candidate && decisions[candidate.id];
  const status = decision?.status || "pending";
  const terminal = status === "registered" || status === "rejected";
  const reason = candidate ? drafts[candidate.id] ?? "" : "";
  const decide = (nextStatus) => {
    if (!reason.trim()) { setError("검토 의견을 입력한 뒤 처리해 주세요."); return; }
    onDecide(candidate.id, { status: nextStatus, reason: reason.trim(), decidedAt: new Date().toISOString(), role });
    setError("");
    setDrafts((current) => ({ ...current, [candidate.id]: "" }));
  };
  return <section className="wp-pattern-workbench" aria-labelledby="wp-pattern-title">
    <header className="wp-pattern-heading"><div><p className="wp-eyebrow">FROM CANDIDATE TO CRITERIA</p><h2 id="wp-pattern-title">새 패턴 검토</h2><p>후보의 근거를 확인하고, 다음 점검에 사용할 기준을 검토합니다.</p></div><span className="wp-example-label">가상 패턴 후보 · 이 브라우저에 저장</span></header>
    <div className="wp-pattern-summary">{[["검토 대기", "pending"], ["등록 요청", "requested"], ["등록됨", "registered"], ["기각됨", "rejected"]].map(([label, value]) => <div key={value}><span>{label}</span><strong>{candidates.filter((item) => (decisions[item.id]?.status || "pending") === value).length}<small>건</small></strong></div>)}</div>
    <div className="wp-pattern-scope"><span>{showAll || !departmentId ? "전체 부서의 후보" : `${scoped[0]?.departmentName || "선택 부서"}의 후보`} · {scoped.length}건</span>{departmentId && <button type="button" onClick={() => { setShowAll((value) => !value); setError(""); }}>{showAll ? "선택 부서만 보기" : "전체 후보 보기"}<ArrowRight size={13} /></button>}</div>
    {candidate ? <div className="wp-pattern-grid"><nav className="wp-candidates" aria-label="새 패턴 후보">{scoped.map((item) => {
      const itemStatus = decisions[item.id]?.status || "pending";
      const StatusIcon = decisionIcons[itemStatus];
      return <button type="button" className={`wp-candidate ${candidate.id === item.id ? "is-selected" : ""}`} aria-pressed={candidate.id === item.id} key={item.id} onClick={() => { setActiveId(item.id); setError(""); }}><span className="wp-candidate-meta">PATTERN 0{candidates.indexOf(item) + 1}<span className={`wp-decision-status wp-status-${itemStatus}`}><StatusIcon size={12} />{decisionLabels[itemStatus]}</span></span><strong>{item.title}</strong><p>{item.description}</p><span className="wp-candidate-footer">{item.departmentName}<span>표시 거래 1건<ArrowRight size={14} /></span></span></button>;
    })}</nav><article className="wp-pattern-detail" aria-labelledby="wp-candidate-title"><div className="wp-pattern-detail-heading"><span className="wp-eyebrow">PATTERN REVIEW</span><span className={`wp-decision-status wp-status-${status}`}>{decisionLabels[status]}</span></div><h3 id="wp-candidate-title">{candidate.title}</h3><div className="wp-condition-chips">{candidate.conditions.map((condition) => <span key={condition}>{condition}</span>)}</div><p className="wp-observation">{candidate.observation}</p><div className="wp-pattern-evidence"><span className="wp-small-label">연결된 거래 예시</span><button type="button" onClick={() => onInspect(candidate.recordId)}><span><strong>{candidate.recordId}</strong><small>{candidate.shop} · {candidate.departmentName}</small></span><span>{candidate.amount}<ArrowUpRight size={16} /></span></button></div><dl className="wp-pattern-facts"><div><dt>등록 시 점검 범위</dt><dd>{candidate.scope}</dd></div><div><dt>추가 확인할 내용</dt><dd>{candidate.caution}</dd></div></dl>
    {decision?.reason && <div className="wp-decision-history" role="status"><span className="wp-small-label">최근 처리 · {decisionLabels[status]}{decision.decidedAt && ` · ${decisionDate(decision.decidedAt)}`}</span><p>{decision.reason}</p><small>{decision.role === "admin" ? "관리자" : "감사 담당자"}의 검토 의견</small></div>}
    {terminal ? <div className="wp-decision-finished"><p>{status === "registered" ? "이 후보가 점검 기준으로 등록되었습니다. 시제품의 등록 상태이며 실제 탐지에는 적용되지 않습니다." : "이 후보가 기각되었습니다. 연결된 거래와 검토 의견은 유지됩니다."}</p>{role === "admin" && <button type="button" className="wp-secondary" onClick={() => { onDecide(candidate.id, { status: "pending", reason: decision.reason, decidedAt: new Date().toISOString(), role }); setError(""); }}>다시 검토</button>}</div> : role === "auditor" && status === "requested" ? <p className="wp-pending-note"><Clock size={16} />관리자의 등록·기각 검토를 기다리고 있습니다.</p> : <div className="wp-pattern-decision"><label htmlFor={`pattern-opinion-${candidate.id}`}>검토 의견<span>필수</span></label><textarea id={`pattern-opinion-${candidate.id}`} value={reason} rows={3} placeholder={role === "admin" ? "등록 또는 기각 사유를 입력하세요." : "점검 기준으로 제안하는 이유를 입력하세요."} onChange={(event) => { setDrafts((current) => ({ ...current, [candidate.id]: event.target.value })); setError(""); }} />{error && <p className="wp-request-error" role="alert">{error}</p>}<div className="wp-pattern-actions"><span>{role === "admin" ? "관리자 검토 · 예시 상태 저장" : "담당자 제안 → 관리자 검토"}</span>{role === "admin" ? <><button type="button" className="wp-secondary" onClick={() => decide("rejected")}>기각</button><button type="button" className="wp-primary" onClick={() => decide("registered")}><Check size={15} />점검 기준으로 등록</button></> : <button type="button" className="wp-primary" onClick={() => decide("requested")}>등록 요청<ArrowUpRight size={15} /></button>}</div></div>}
    </article></div> : <div className="wp-pattern-empty"><Sparkle size={27} weight="light" /><h3>선택 부서의 패턴 후보가 없습니다.</h3><p>전체 후보에서 영업팀·마케팅팀의 예시를 살펴볼 수 있습니다.</p><button type="button" className="wp-secondary" onClick={() => setShowAll(true)}>전체 후보 보기</button></div>}
  </section>;
}
