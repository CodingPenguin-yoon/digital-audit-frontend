import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Buildings, CalendarBlank, CheckSquare, Files, Fingerprint, MagnifyingGlass, Scan, Sparkle, X } from "@phosphor-icons/react";
import { departments as allDepartments } from "./departments.js";
import { auditScenarios, auditTypes, getAuditRows } from "./audit-data.js";
import "./command-panels.css";

const number = (value) => new Intl.NumberFormat("ko-KR").format(value);
const typeIcons = { rules: CheckSquare, compare: Scan, forgery: Fingerprint, discover: Sparkle };

function PanelTitle({ eyebrow, title, meta }) {
  return <header className="cp-panel-heading"><div><span className="cp-eyebrow">{eyebrow}</span><h2>{title}</h2></div>{meta && <span className="cp-panel-meta">{meta}</span>}</header>;
}

export function AuditScope({ departments, selectedId, onSelect, onOpenUpload }) {
  const department = departments.find((item) => item.id === selectedId);
  const scope = department ? [department] : departments;
  const transactions = scope.reduce((sum, item) => sum + item.transactions, 0);
  const exampleCount = scope.reduce((sum, item) => sum + item.exampleTransactions.length, 0);
  return <section className="cp-panel cp-audit-scope" aria-label="이번 감사 범위">
    <PanelTitle eyebrow="AUDIT SCOPE" title="이번 감사 범위" meta="01" />
    <div className="cp-scope-period"><CalendarBlank size={19} weight="light" /><div><span>점검 기간 · 예시</span><strong>2026년 3월</strong></div></div>
    <label className="cp-scope-select"><span><Buildings size={15} />대상 조직</span><select aria-label="감사 대상 조직" value={department?.id || ""} onChange={(event) => onSelect(event.target.value || null)}><option value="">전체 부서</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <dl className="cp-scope-facts"><div><dt>거래 집계 예시</dt><dd>{number(transactions)}<small>건</small></dd></div></dl>
    <div className="cp-scope-source"><span className="cp-section-label">현재 자료</span><div><Files size={18} weight="light" /><span>거래·증빙 예시<small>화면에 표시한 거래 {exampleCount}건</small></span></div><p><span className="cp-status-dot" />실제 분석 연결 전</p></div>
    <div className="cp-scope-footer"><button type="button" className="cp-upload-link" onClick={onOpenUpload}>자료 선택하기<ArrowUpRight size={15} /></button></div>
  </section>;
}

export function AuditTypes({ department, categoryId, onCategoryChange, dateRange = {}, onOpenPatterns }) {
  const scope = department ? [department] : allDepartments;
  const rows = getAuditRows(scope, null, "all", dateRange);
  return <section className="cp-panel cp-audit-types" aria-label="점검 유형">
    <PanelTitle eyebrow="AUDIT SIGNALS" title="무엇을 확인할까요" meta="04 TYPES" />
    <div className="cp-types-scope"><span>{department?.name || "전체 부서"}</span><span>전체 항목 예시 기준</span></div>
    <div className="cp-type-list">{auditTypes.map((type) => {
      const count = getAuditRows(scope, null, type.id, dateRange).length;
      const Icon = typeIcons[type.id];
      const active = categoryId === type.id;
      return <button type="button" key={type.id} className={`cp-type-button ${active ? "cp-is-active" : ""} ${count === 0 ? "cp-type-empty" : ""}`} aria-pressed={active} onClick={() => onCategoryChange(active ? "all" : type.id)}>
        <span className="cp-type-icon"><Icon size={21} weight="light" /></span>
        <span className="cp-type-content"><span className="cp-type-number">SIGNAL {type.number}</span><strong>{type.title}</strong><span>{type.description}</span></span>
        <span className="cp-type-count">{count}<small>건</small><ArrowRight size={14} /></span>
      </button>;
    })}</div>
    <div className="cp-types-footer"><button type="button" className="cp-clear-type" onClick={() => onCategoryChange("all")} disabled={categoryId === "all"}>전체 유형 보기<ArrowUpRight size={14} /></button><p>검토 거래 {rows.length}건 · 유형별 중복 포함</p><button className="cp-pattern-link" onClick={onOpenPatterns}>새 패턴 검토하기<Sparkle size={14} /></button></div>
  </section>;
}

export function TransactionFeed({ department, departments = allDepartments, categoryId = "all", scenarioId = null, dateRange = {}, reviews = {}, statusFilter = "all", onStatusChange, onCategoryChange, onClearDepartment, onClearScenario, onClearDates, onInspect, includeNormal = false }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState(null);
  useEffect(() => { setQuery(""); setLevel("all"); setSelected(null); }, [department?.id, categoryId, scenarioId, dateRange.fromDate, dateRange.toDate]);
  const scopeRows = getAuditRows(departments, department?.id, categoryId, { ...dateRange, scenarioId, includeNormal });
  const rows = scopeRows.filter((row) => (statusFilter === "all" || (statusFilter === "unreviewed" ? !reviews[row.id]?.verdict : reviews[row.id]?.verdict === statusFilter))
    && (level === "all" || row.level === level) && `${row.id} ${row.shop} ${row.type} ${row.departmentName}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.level === "높음") - Number(a.level === "높음") || b.date.localeCompare(a.date));
  const category = auditTypes.find((type) => type.id === categoryId);
  const scenario = auditScenarios.find((item) => item.id === scenarioId);
  const inspect = (row) => { setSelected(row.id); onInspect(row.id, row.departmentId); };
  const verdictClass = (value) => value === "위반" ? "violation" : value === "정상" ? "normal" : value === "보류" ? "hold" : "pending";
  return <section className="cp-panel cp-transaction-feed" aria-label={includeNormal ? "거래 검토 목록" : "우선 검토할 거래 예시"}>
    <div className="cp-feed-heading"><div><PanelTitle eyebrow="REVIEW QUEUE" title={includeNormal ? "거래 검토 목록" : "우선 검토할 거래"} /><p className="cp-feed-caption">{includeNormal ? "전체 거래 예시 · 탐지 우선도와 담당자 판정은 별도로 표시합니다." : "선택한 범위의 이상징후 예시 · 높은 우선도부터 표시"}</p></div><div className="cp-feed-filters">
      <label className="cp-search"><MagnifyingGlass size={15} aria-hidden="true" /><input type="search" aria-label="거래처, 거래번호, 부서, 시나리오 검색" placeholder="거래처·부서·시나리오 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      <label className="cp-level-filter"><span className="cp-sr-only">검토 우선도</span><select aria-label="검토 우선도" value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">우선도 전체</option><option value="높음">높음</option><option value="보통">보통</option>{includeNormal && <option value="정상">신호 없음</option>}</select></label>
      <label className="cp-level-filter"><span className="cp-sr-only">판정 상태</span><select aria-label="판정 상태" value={statusFilter} onChange={(event) => onStatusChange(event.target.value)}><option value="all">판정 전체</option><option value="unreviewed">미검토</option><option value="위반">위반</option><option value="정상">정상</option><option value="보류">보류</option></select></label>
    </div></div>
    <div className="cp-active-filters"><span>현재 범위</span>
      {department ? <button type="button" onClick={onClearDepartment} aria-label={`${department.name} 선택 해제`}>{department.name}<X size={12} /></button> : <span className="cp-filter-label">전체 부서</span>}
      {category ? <button type="button" onClick={() => onCategoryChange("all")} aria-label={`${category.title} 선택 해제`}>{category.title}<X size={12} /></button> : <span className="cp-filter-label">전체 유형</span>}
      {scenario && <button onClick={onClearScenario} aria-label={`${scenario.title} 시나리오 선택 해제`}>{scenario.title}<X size={12} /></button>}
      {(dateRange.fromDate || dateRange.toDate) && <button onClick={onClearDates} aria-label="요청 기간 선택 해제">{dateRange.fromDate?.slice(5) || "시작"} ~ {dateRange.toDate?.slice(5) || "종료"}<X size={12} /></button>}
      <strong>{rows.length}<small>건의 예시</small></strong>
    </div>
    <div className="cp-table-wrap"><table className="cp-table"><thead><tr><th>우선도</th><th>거래 / 부서</th><th>사용처</th><th>금액</th><th>시나리오</th><th>판정 상태</th><th>확인할 내용</th><th><span className="cp-sr-only">상세 조회</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selected === row.id ? "cp-row-selected" : ""} onClick={() => inspect(row)}>
      <td><span className={`cp-risk-badge cp-risk-${row.level === "높음" ? "high" : row.level === "정상" ? "normal" : "medium"}`}>{row.level === "정상" ? "신호 없음" : row.level}</span></td>
      <td><button className="cp-transaction-link" type="button" onClick={(event) => { event.stopPropagation(); inspect(row); }}><strong>{row.id}</strong><span>{row.departmentName} · {row.date.slice(5)}</span></button></td><td>{row.shop}</td><td className="cp-amount">{row.amount}<small>원</small></td><td>{row.type}</td>
      <td><span className={`cp-verdict cp-verdict-${verdictClass(reviews[row.id]?.verdict)}`}>{reviews[row.id]?.verdict || "미검토"}</span></td>
      <td className="cp-reason-cell"><span title={reviews[row.id]?.opinion || row.reason}>{reviews[row.id]?.opinion || row.reason}</span></td><td><ArrowUpRight size={15} className="cp-row-arrow" aria-hidden="true" /></td></tr>)}</tbody></table>
      {rows.length === 0 && <div className="cp-feed-empty"><Scan size={24} weight="light" /><strong>선택한 조건의 검토 거래가 없습니다.</strong><span>다른 부서·시나리오 또는 판정 상태를 선택해 보세요.</span>{(query || level !== "all" || statusFilter !== "all") && <button type="button" onClick={() => { setQuery(""); setLevel("all"); onStatusChange("all"); }}>검색·우선도·판정 초기화</button>}</div>}
    </div>
    <div className="cp-table-footer"><span>표시 {rows.length}건 / 선택 범위 {scopeRows.length}건</span><span>거래 선택 → 근거 확인 → 판정 저장<ArrowUpRight size={12} /></span></div>
  </section>;
}
