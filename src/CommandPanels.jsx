import { useEffect, useState } from "react";
import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react";
import "./command-panels.css";

const number = (value) => new Intl.NumberFormat("ko-KR").format(value);
const rate = (signals, total) => total ? signals / total * 100 : 0;
const signalRows = (department) => department.exampleTransactions.filter((row) => row.level !== "정상");
const groupSignals = (department) => {
  const groups = new Map();
  signalRows(department).forEach((row) => {
    const previous = groups.get(row.type);
    groups.set(row.type, { type: row.type, count: (previous?.count || 0) + 1, first: previous?.first || row });
  });
  return [...groups.values()];
};

function PanelTitle({ eyebrow, title, meta }) {
  return <header className="cp-panel-heading"><div><span className="cp-eyebrow">{eyebrow}</span><h2>{title}</h2></div>{meta && <span className="cp-panel-meta">{meta}</span>}</header>;
}

export function DepartmentRanking({ departments, selectedId, onSelect }) {
  const sorted = [...departments].sort((a, b) => b.anomalies - a.anomalies);
  const maximum = Math.max(...departments.map((department) => department.anomalies), 1);
  return <section className="cp-panel cp-ranking" aria-label="부서별 이상징후 순위">
    <PanelTitle eyebrow="DEPARTMENT SIGNALS" title="부서별 이상징후" meta={`${departments.length} DEPT.`} />
    <div className="cp-rank-list">{sorted.map((department, index) => <button type="button" key={department.id} className={`cp-rank-row ${selectedId === department.id ? "cp-is-selected" : ""}`} aria-pressed={selectedId === department.id} onClick={(event) => onSelect(department.id, event.currentTarget)}>
      <span className="cp-rank-index">{String(index + 1).padStart(2, "0")}</span>
      <span className="cp-rank-body"><span className="cp-rank-name">{department.name}<small>{department.english}</small></span><span className="cp-rank-track"><span style={{ width: `${department.anomalies / maximum * 100}%` }} /></span></span>
      <span className={`cp-rank-count ${department.anomalies === 0 ? "cp-muted" : ""}`}>{department.anomalies}<small>건</small></span>
    </button>)}</div>
    <p className="cp-footnote">블록 높이는 부서별 이상징후 건수에 비례합니다.</p>
  </section>;
}

export function SignalOverview({ departments }) {
  const total = departments.reduce((sum, department) => sum + department.transactions, 0);
  const signals = departments.reduce((sum, department) => sum + department.anomalies, 0);
  const flaggedDepartments = departments.filter((department) => department.anomalies > 0).length;
  const circumference = 2 * Math.PI * 51;
  const signalArc = circumference * signals / total;
  const flaggedArc = 2 * Math.PI * 39 * flaggedDepartments / departments.length;
  return <section className="cp-panel cp-signal-overview" aria-label="전체 거래 이상징후 분포">
    <PanelTitle eyebrow="SIGNAL COVERAGE" title="전체 신호 분포" meta="예시 전체" />
    <div className="cp-overview-body">
      <div className="cp-donut-wrap"><svg viewBox="0 0 136 136" role="img" aria-label={`전체 ${number(total)}건 중 이상징후 ${signals}건, ${rate(signals, total).toFixed(2)}퍼센트`}>
        <circle className="cp-donut-track" cx="68" cy="68" r="51" />
        <circle className="cp-donut-alert" cx="68" cy="68" r="51" strokeDasharray={`${signalArc} ${circumference - signalArc}`} transform="rotate(-90 68 68)" />
        <circle className="cp-donut-inner-track" cx="68" cy="68" r="39" />
        <circle className="cp-donut-departments" cx="68" cy="68" r="39" strokeDasharray={`${flaggedArc} ${2 * Math.PI * 39 - flaggedArc}`} transform="rotate(-90 68 68)" />
      </svg><div className="cp-donut-value"><strong>{signals}</strong><span>이상징후</span></div></div>
      <dl className="cp-overview-values"><div><dt><i className="cp-dot cp-dot-red" />신호 비율</dt><dd className="cp-text-red">{rate(signals, total).toFixed(2)}<small>%</small></dd></div><div><dt><i className="cp-dot cp-dot-orange" />확인 필요 부서</dt><dd>{flaggedDepartments}<small> / {departments.length}</small></dd></div><div><dt><i className="cp-dot cp-dot-slate" />신호 미검출</dt><dd>{number(total - signals)}<small>건</small></dd></div></dl>
    </div>
    <p className="cp-footnote">예시 거래 {number(total)}건 기준 · 위반 확정 결과가 아닙니다.</p>
  </section>;
}

export function SelectedDepartment({ department, onInspect }) {
  if (!department) return null;
  const groups = groupSignals(department);
  const first = signalRows(department)[0] || department.exampleTransactions[0];
  return <section className="cp-panel cp-selected-department" aria-label={`${department.name} 선택 부서 요약`}>
    <PanelTitle eyebrow={`SELECTED / ${department.english}`} title={department.name} meta={department.anomalies > 0 ? "확인 필요" : "신호 없음"} />
    <div className="cp-selected-metrics"><div><span>이상징후</span><strong className={department.anomalies ? "cp-text-red" : "cp-text-clear"}>{department.anomalies}<small>건</small></strong></div><div><span>전체 거래</span><strong>{number(department.transactions)}<small>건</small></strong><span className="cp-selected-rate">탐지 비율 {rate(department.anomalies, department.transactions).toFixed(2)}%</span></div></div>
    <div className="cp-risk-types"><span className="cp-section-label">표시된 예시의 주요 신호</span>{groups.length ? groups.slice(0, 3).map((group) => <button type="button" key={group.type} onClick={() => onInspect(group.first.id)}><i className="cp-dot cp-dot-red" /><span>{group.type}</span><ArrowUpRight size={13} /></button>) : <p className="cp-empty-inline">현재 예시 기준으로 추가 확인 신호가 없습니다.</p>}</div>
    {first && <div className="cp-first-preview"><span className="cp-section-label">첫 번째 거래 예시</span><div><strong>{first.shop}</strong><span>{first.amount}<small>원</small></span></div><p>{first.date} <span>·</span> {first.id}</p></div>}
    {first && <button type="button" className="cp-inspect-button" onClick={() => onInspect(first.id)}>거래 근거 확인 <ArrowUpRight size={15} /></button>}
  </section>;
}

export function RiskDistribution({ department }) {
  if (!department) return null;
  const groups = groupSignals(department);
  const maximum = Math.max(...groups.map((group) => group.count), 1);
  return <section className="cp-panel cp-risk-distribution" aria-label={`${department.name} 예시 신호 유형 분포`}>
    <PanelTitle eyebrow="SIGNAL BREAKDOWN" title="탐지 유형" meta="표시된 예시 기준" />
    {groups.length ? <div className="cp-distribution-list">{groups.map((group, index) => <div key={group.type} className="cp-distribution-row"><span>{group.type}</span><span className="cp-distribution-track"><span className={index % 2 ? "cp-bar-orange" : ""} style={{ width: `${group.count / maximum * 100}%` }} /></span><strong>{group.count}<small>건</small></strong></div>)}</div> : <div className="cp-empty-chart"><span>00</span><p>표시할 이상징후 유형이 없습니다.</p></div>}
    <p className="cp-footnote">전체 {department.anomalies}건 중 화면에 표시한 거래 예시의 유형입니다.</p>
  </section>;
}

export function TransactionFeed({ department, onInspect }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState(null);
  useEffect(() => { setQuery(""); setLevel("all"); setSelected(null); }, [department?.id]);
  if (!department) return null;
  const rows = department.exampleTransactions.filter((row) => (level === "all" || row.level === level) && `${row.id} ${row.shop} ${row.type}`.toLowerCase().includes(query.toLowerCase()));
  const inspect = (id) => { setSelected(id); onInspect(id); };
  return <section className="cp-panel cp-transaction-feed" aria-label={`${department.name} 거래 예시 목록`}>
    <div className="cp-feed-heading"><PanelTitle eyebrow="TRANSACTION EVIDENCE" title={`${department.name} 점검 내역`} meta={`예시 ${department.exampleTransactions.length}건`} /><div className="cp-feed-filters"><label className="cp-search"><MagnifyingGlass size={14} aria-hidden="true" /><input type="search" aria-label="거래처, 거래번호, 시나리오 검색" placeholder="거래처·번호·시나리오 검색" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="cp-level-filter"><span className="cp-sr-only">위험도 필터</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">위험도 전체</option><option value="높음">높음</option><option value="보통">보통</option><option value="정상">신호 없음</option></select></label></div></div>
    <div className="cp-table-wrap"><table className="cp-table"><thead><tr><th>거래 / 일자</th><th>거래처</th><th>결제 금액</th><th>탐지 시나리오</th><th>위험 신호</th><th><span className="cp-sr-only">상세 조회</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={selected === row.id ? "cp-row-selected" : ""} onClick={() => inspect(row.id)}><td><button className="cp-transaction-link" type="button" onClick={(event) => { event.stopPropagation(); inspect(row.id); }}><strong>{row.id}</strong><span>{row.date}</span></button></td><td>{row.shop}</td><td className="cp-amount">{row.amount}<small>원</small></td><td>{row.type === "해당 없음" ? "등록 기준 신호 없음" : row.type}</td><td><span className={`cp-risk-badge ${row.level === "높음" ? "cp-risk-high" : row.level === "보통" ? "cp-risk-medium" : "cp-risk-clear"}`}><i />{row.level === "정상" ? "신호 없음" : row.level}</span></td><td><ArrowUpRight size={14} className="cp-row-arrow" aria-hidden="true" /></td></tr>)}</tbody></table>{rows.length === 0 && <p className="cp-feed-empty">조건에 맞는 거래 예시가 없습니다.</p>}</div>
    <div className="cp-table-footer"><span>표시 {rows.length}건 / 부서 전체 거래 {number(department.transactions)}건</span><span>예시 데이터 · 실제 분석 전</span></div>
  </section>;
}
