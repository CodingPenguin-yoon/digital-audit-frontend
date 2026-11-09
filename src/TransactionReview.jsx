import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, CheckCircle, FileText, Fingerprint, FloppyDisk, MagnifyingGlass, ShieldCheck, WarningCircle, X } from "@phosphor-icons/react";
import { getReviewEvidence } from "./review-data.js";
import "./transaction-review.css";

const verdicts = [
  { value: "위반", description: "근거를 확인하고 위반으로 판단", style: "violation" },
  { value: "정상", description: "업무 목적과 증빙을 확인", style: "normal" },
  { value: "보류", description: "추가 자료 또는 설명이 필요", style: "hold" },
];

function savedTime(value) {
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Seoul" }).format(new Date(value));
}

export function TransactionReview({ record, department, role, review, onSave, onClose, onInspectRelated }) {
  const [verdict, setVerdict] = useState(review?.verdict ?? "");
  const [opinion, setOpinion] = useState(review?.opinion ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const evidence = getReviewEvidence(record);
  const mismatchCount = evidence.fields.filter((field) => field.status === "불일치").length;
  const relatedRecord = department.exampleTransactions.find((item) => item.id === evidence.duplicate);
  const roleName = role === "admin" ? "관리자" : "감사 담당자";
  const changed = verdict !== (review?.verdict ?? "") || opinion.trim() !== (review?.opinion ?? "");
  onCloseRef.current = onClose;

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onCloseRef.current(); }
      if (event.key !== "Tab") return;
      const controls = [...dialogRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex='0']")].filter((element) => element.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function saveReview(event) {
    event.preventDefault();
    if (!verdict || !opinion.trim()) {
      setError(!verdict ? "판정을 선택해 주세요." : "판정 근거를 검토 의견에 남겨 주세요.");
      return;
    }
    onSave({ verdict, opinion: opinion.trim(), savedAt: new Date().toISOString(), role });
    setOpinion(opinion.trim());
    setSaved(true);
    setError("");
  }

  return <div className="tr-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="tr-dialog" role="dialog" aria-modal="true" aria-labelledby="tr-title" aria-describedby="tr-disclaimer" ref={dialogRef}>
      <header className="tr-topbar"><span><Fingerprint size={18} /> TRANSACTION REVIEW <i /> 거래 통합 검토</span><button ref={closeRef} type="button" onClick={onClose} aria-label="거래 상세 닫기"><X size={21} /></button></header>
      <div className="tr-summary">
        <div><p className="tr-eyebrow">{department.name} <span>/</span> {record.id}</p><h2 id="tr-title">{record.shop}</h2><div className="tr-summary-meta"><span>{record.date}</span><span>{evidence.account}</span><span className={`tr-priority ${record.level === "높음" ? "tr-alert" : ""}`}>탐지 우선도 · {record.level}</span></div></div>
        <div className="tr-amount"><span>결제 금액</span><strong>{record.amount}<small>원</small></strong><span className="tr-example">예시 거래 · 실제 분석 전</span></div>
      </div>
      <div className="tr-layout">
        <div className="tr-evidence">
          <section className="tr-section tr-reason" aria-labelledby="tr-reason-title"><div className="tr-section-heading"><span className="tr-step">01</span><h3 id="tr-reason-title">탐지 이유</h3><span className="tr-tag">{record.type}</span></div><p className="tr-reason-text">{record.reason}</p><dl className="tr-context"><div><dt>점검 기준 예시</dt><dd>{evidence.criterion}</dd></div><div><dt>관찰 내용</dt><dd>{evidence.context}</dd></div></dl><div className="tr-follow-up"><MagnifyingGlass size={16} /><p>{evidence.followUp}</p></div></section>
          <section className="tr-section" aria-labelledby="tr-compare-title"><div className="tr-section-heading"><span className="tr-step">02</span><h3 id="tr-compare-title">증빙 대조</h3><span className={`tr-tag ${!evidence.file || mismatchCount ? "tr-tag-alert" : ""}`}>{!evidence.file ? "증빙 없음" : mismatchCount ? `불일치 ${mismatchCount}개` : "항목 일치 예시"}</span></div><div className="tr-file"><FileText size={19} /><span>{evidence.file || "이 거래에 연결된 증빙이 없습니다"}</span><small>{record.id} 연결 자료</small></div><table className="tr-compare-table"><thead><tr><th>비교 항목</th><th>거래 내역</th><th>증빙 예시</th><th>결과</th></tr></thead><tbody>{evidence.fields.map((field) => <tr key={field.label} className={field.status === "불일치" ? "tr-mismatch" : ""}><th scope="row">{field.label}</th><td>{field.recorded}</td><td>{field.evidence}</td><td><span className={`tr-field-status ${field.status === "일치" ? "tr-match" : "tr-needs-review"}`}>{field.status === "일치" && <Check size={11} />}{field.status}</span></td></tr>)}</tbody></table></section>
          <section className="tr-section tr-forensics" aria-labelledby="tr-forgery-title"><div className="tr-section-heading"><span className="tr-step">03</span><h3 id="tr-forgery-title">위변조 신호</h3><span className={`tr-tag ${evidence.duplicate ? "tr-tag-alert" : ""}`}>{evidence.duplicate ? "재사용 신호 예시" : evidence.file ? "검사 예시" : "증빙 없음"}</span></div><div className="tr-forensic-grid">{evidence.forensics.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.status}</strong><p>{item.detail}</p></div>)}</div>{evidence.duplicate && <div className="tr-duplicate"><Fingerprint size={16} /><span>같은 파일 지문 <code>{evidence.fingerprint}</code><small>{record.id} ↔ {relatedRecord && onInspectRelated ? <button type="button" onClick={() => onInspectRelated(relatedRecord.id)}>{relatedRecord.id}<ArrowRight size={12} /></button> : `${evidence.duplicate} · 목록 외 예시`}</small></span></div>}<p className="tr-analysis-note" id="tr-disclaimer">대조 항목과 파일 신호는 화면 설명용 예시입니다. 실제 파일 분석 결과가 아니며, 탐지 신호만으로 위반이나 위변조를 확정하지 않습니다.</p></section>
        </div>
        <aside className="tr-decision" aria-labelledby="tr-decision-title"><div className="tr-decision-heading"><span className="tr-eyebrow">YOUR DECISION</span><ShieldCheck size={22} /></div><h3 id="tr-decision-title">검토 결과를 남겨주세요</h3><p className="tr-decision-intro">근거를 종합해 판정하고,<br />판단한 이유를 기록합니다.</p><form onSubmit={saveReview} noValidate>
          <fieldset className="tr-verdicts"><legend>판정 <span>필수</span></legend>{verdicts.map((item) => <label key={item.value} className={`tr-verdict tr-verdict-${item.style} ${verdict === item.value ? "tr-is-selected" : ""}`}><input type="radio" name="transaction-verdict" value={item.value} checked={verdict === item.value} onChange={() => { setVerdict(item.value); setSaved(false); setError(""); }} /><span className="tr-radio-mark">{verdict === item.value && <Check size={12} weight="bold" />}</span><span><strong>{item.value}</strong><small>{item.description}</small></span></label>)}</fieldset>
          <label className="tr-opinion-label" htmlFor="tr-opinion">검토 의견 <span>필수</span></label><textarea id="tr-opinion" value={opinion} onChange={(event) => { setOpinion(event.target.value); setSaved(false); setError(""); }} placeholder="확인한 근거, 판단 이유 또는 추가로 필요한 자료를 적어주세요." maxLength={2000} aria-invalid={Boolean(error && !opinion.trim())} aria-describedby="tr-opinion-hint" /><div className="tr-opinion-hint" id="tr-opinion-hint"><span>판정의 근거를 함께 남겨주세요.</span><span>{opinion.length}/2,000</span></div>
          {error && <p className="tr-form-error" role="alert"><WarningCircle size={15} />{error}</p>}
          <button className="tr-save" type="submit"><FloppyDisk size={17} weight="bold" />{review ? "판정 수정 저장" : "판정 저장"}</button><p className="tr-save-status" role="status">{saved && !changed ? <><CheckCircle size={14} />판정과 검토 의견을 저장했습니다.</> : changed ? "저장 전 변경사항이 있습니다." : ""}</p>
        </form><div className="tr-review-history"><span className="tr-eyebrow">REVIEW RECORD</span>{review ? <><div><strong>{review.verdict}</strong><span>{review.role === "admin" ? "관리자" : "감사 담당자"}</span></div><p>{savedTime(review.savedAt)} (KST) · 마지막 저장</p></> : <p>아직 저장된 판정이 없습니다.</p>}<small>현재 역할 · {roleName}<br />판정은 이 브라우저의 예시 검토에 저장됩니다.</small></div></aside>
      </div>
    </section>
  </div>;
}
