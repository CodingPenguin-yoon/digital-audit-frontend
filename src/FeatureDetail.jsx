import { useState } from "react";
import "./detail.css";

const modules = [
  ["upload", "01", "데이터 업로드"],
  ["detect", "02", "이상징후 탐지"],
  ["discover", "03", "새 패턴 발견"],
  ["compare", "04", "증빙 대조"],
  ["forgery", "05", "위변조 분석"],
];

const transactions = [
  { id: "TX-0241", date: "2026.03.21", shop: "그린필드 골프", amount: "380,000", level: "높음", type: "휴일 사용", reason: "토요일에 결제된 골프장 사용 건입니다. 업무 목적과 승인 여부를 확인해 주세요.", evidence: "결제일: 토요일 / 업종: 골프장 / 업무 목적 증빙: 미등록" },
  { id: "TX-0238", date: "2026.03.20", shop: "오크 다이닝", amount: "198,000", level: "보통", type: "분할결제 의심", reason: "동일 가맹점에서 8분 간격으로 결제된 거래가 있습니다. 같은 지출을 나누어 결제했는지 검토해 주세요.", evidence: "동일 가맹점 / 인접 거래: 20:14, 20:22 / 합계: 396,000원" },
  { id: "TX-0235", date: "2026.03.19", shop: "센트럴 오피스", amount: "64,000", level: "보통", type: "증빙 누락", reason: "비용 내역에는 결제가 등록되어 있으나 연결된 증빙 파일이 없습니다.", evidence: "비용 계정: 소모품비 / 첨부 파일: 0개" },
  { id: "TX-0232", date: "2026.03.18", shop: "서울역 KTX", amount: "59,800", level: "정상", type: "해당 없음", reason: "예시 데이터에서 등록된 점검 기준에 해당하는 이상징후가 없습니다. 실제 거래의 정상 여부를 확정하는 결과는 아닙니다.", evidence: "출장 기간 내 결제 / 금액·일자 일치 / 증빙 등록" },
];

function Upload({ onNavigate }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  function selectFiles(incoming) {
    const list = Array.from(incoming || []);
    const valid = list.filter((file) => /\.(xlsx?|csv|pdf|png|jpe?g)$/i.test(file.name));
    setError(valid.length < list.length ? "지원 형식의 파일만 선택해 주세요." : "");
    setFiles((current) => [...current, ...valid].filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size) === index));
  }
  return <>
    <div className="fd-heading"><span className="fd-kicker">START WITH YOUR DATA</span><h3>점검의 시작, 데이터 준비</h3><p>거래 내역과 증빙을 한곳에 모으세요.</p></div>
    <label className={`fd-dropzone ${dragging ? "fd-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files); }}>
      <input aria-label="거래 내역 및 증빙 파일 선택" type="file" multiple accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg" onChange={(event) => { selectFiles(event.target.files); event.target.value = ""; }} />
      <span className="fd-drop-title">파일을 끌어 놓거나 선택하세요</span><span className="fd-drop-formats">거래 내역 XLSX · XLS · CSV / 증빙 PDF · PNG · JPG</span><span className="fd-file-button">파일 선택</span>
    </label>
    <p className="fd-notice">이 시제품은 파일 이름과 크기만 표시합니다. 파일 내용은 읽거나 서버에 전송하지 않습니다.</p>
    {error && <p className="fd-error" role="alert">{error}</p>}
    {files.length > 0 && <div className="fd-file-list" aria-live="polite">{files.map((file) => <div className="fd-file-row" key={`${file.name}-${file.size}`}><div><strong>{file.name}</strong><span>{file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`} · 선택됨</span></div><button type="button" className="fd-text-button" onClick={() => setFiles((current) => current.filter((item) => item !== file))} aria-label={`${file.name} 선택 해제`}>제거</button></div>)}</div>}
    <div className="fd-bottom-action"><p>먼저 화면의 흐름을 살펴볼까요?</p><button type="button" className="fd-primary" onClick={() => onNavigate("detect")}>예시 점검 결과 보기</button></div>
  </>;
}

function Detect({ department }) {
  const departmentTransactions = department?.exampleTransactions ?? transactions;
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("전체");
  const [selected, setSelected] = useState(departmentTransactions[0] ?? null);
  const rows = departmentTransactions.filter((item) => (level === "전체" || item.level === level) && `${item.id} ${item.shop} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
  const total = department?.transactions ?? departmentTransactions.length;
  const anomalies = department?.anomalies ?? departmentTransactions.filter((item) => item.level !== "정상").length;
  return <>
    <div className="fd-heading"><span className="fd-kicker">FIND WHAT NEEDS ATTENTION</span><h3>{department ? `${department.name}, 거래 살펴보기` : "확인이 필요한 거래부터"}</h3><p>위험 신호를 좁히고, 각 거래의 근거를 확인하세요.</p></div>
    <div className="fd-metrics"><div><span>전체 거래</span><strong>{total.toLocaleString("ko-KR")}<span>건</span></strong></div><div><span>이상징후</span><strong>{anomalies.toLocaleString("ko-KR")}<span>건</span></strong></div><div><span>표시한 예시</span><strong>{rows.length}<span>건</span></strong></div></div>
    <div className="fd-filters"><label><span className="fd-sr-only">가맹점, 거래번호, 시나리오 검색</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="가맹점 또는 시나리오 검색" /></label><label><span className="fd-sr-only">위험도</span><select value={level} onChange={(event) => setLevel(event.target.value)}>{["전체", "높음", "보통", "정상"].map((value) => <option key={value} value={value}>{value === "전체" ? "위험도 전체" : value}</option>)}</select></label></div>
    <div className="fd-table-wrap"><table className="fd-table"><thead><tr><th>거래 / 가맹점</th><th>결제 금액</th><th>시나리오</th><th>위험도</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className={selected?.id === item.id ? "fd-selected-row" : ""}><td><button type="button" className="fd-row-button" aria-pressed={selected?.id === item.id} onClick={() => setSelected(item)}><strong>{item.shop}</strong><span>{item.date} · {item.id}</span></button></td><td className="fd-nowrap">{item.amount}원</td><td>{item.type}</td><td><span className={`fd-badge fd-risk-${item.level === "높음" ? "high" : item.level === "보통" ? "medium" : "normal"}`}>{item.level}</span></td></tr>)}</tbody></table>{rows.length === 0 && <p className="fd-empty">조건에 맞는 예시 거래가 없습니다.</p>}</div>
    {selected && <section className="fd-evidence" aria-live="polite"><span className="fd-kicker">검토 근거 · {selected.id}</span><h4>{selected.type === "해당 없음" ? "등록 기준에 해당하는 신호 없음" : selected.type}</h4><p>{selected.reason}</p><div className="fd-evidence-note">{selected.evidence}</div><p className="fd-small-note">이상징후는 검토를 위한 신호입니다. 위반 여부는 담당자가 판단합니다.</p></section>}
  </>;
}

const patterns = [
  { title: "반복되는 소액 분할결제", description: "같은 가맹점에서 짧은 간격으로 반복된 결제를 살펴봅니다.", count: "6건", signal: "10분 이내 · 동일 가맹점 · 유사 금액", records: [["오크 다이닝", "20:14 / 20:22", "198,000원 × 2"], ["시티 마켓", "18:30 / 18:36", "95,000원 × 2"]] },
  { title: "특정 가맹점에 집중된 사용", description: "동료 그룹의 사용과 비교해 한 가맹점에 몰린 거래를 살펴봅니다.", count: "9건", signal: "월간 사용 비중 증가 · 동일 가맹점 반복", records: [["센트럴 라운지", "3월 첫째 주", "3회 방문"], ["센트럴 라운지", "3월 둘째 주", "4회 방문"]] },
  { title: "이어지는 심야 시간 결제", description: "업무 시간 밖에서 연속 발생한 결제 패턴을 살펴봅니다.", count: "4건", signal: "23시 이후 · 반복 요일 · 동일 업종", records: [["시티 라운지", "03.13 / 23:42", "148,000원"], ["시티 라운지", "03.20 / 23:18", "162,000원"]] },
];
function Discover({ department }) {
  const departmentPatterns = department?.patterns ?? patterns;
  const [active, setActive] = useState(0);
  const pattern = departmentPatterns[active];
  return <>
    <div className="fd-heading"><span className="fd-kicker">LOOK BEYOND THE RULES</span><h3>기존 기준 너머의 신호</h3><p>{department ? `${department.name}에서 살펴보는 패턴 화면의 예시입니다.` : "새로운 점검 기준으로 검토할 수 있는 패턴의 예시입니다."}</p></div>
    <div className="fd-patterns">{departmentPatterns.map((item, index) => <button type="button" key={item.title} className={`fd-pattern ${active === index ? "fd-pattern-active" : ""}`} aria-pressed={active === index} onClick={() => setActive(index)}><span className="fd-kicker">PATTERN 0{index + 1}</span><strong>{item.title}</strong><span>{item.description}</span><em>{item.count}의 예시 거래</em></button>)}</div>
    {pattern ? <section className="fd-evidence" aria-live="polite"><span className="fd-kicker">패턴 검토</span><h4>{pattern.title}</h4><p>{pattern.signal}</p><div className="fd-table-wrap"><table className="fd-table"><thead><tr><th>가맹점</th><th>시점</th><th>관찰 내용</th></tr></thead><tbody>{pattern.records.map((record, index) => <tr key={index}>{record.map((value, cell) => <td key={cell}>{value}</td>)}</tr>)}</tbody></table></div><p className="fd-small-note">화면 흐름을 설명하는 가상 패턴입니다. 실제 데이터에서 발견한 결과가 아닙니다.</p></section> : <p className="fd-empty">이 부서에 표시할 새 패턴 예시가 없습니다.</p>}
  </>;
}

const comparedFields = [
  ["결제 일자", "2026.03.20", "2026.03.20", true],
  ["가맹점", "오크 다이닝", "오크 다이닝", true],
  ["결제 금액", "198,000원", "189,000원", false],
  ["승인 번호", "62418932", "62418932", true],
];
function Compare() {
  const [onlyMismatch, setOnlyMismatch] = useState(false);
  return <>
    <div className="fd-heading"><span className="fd-kicker">CHECK THE DETAILS</span><h3>기록과 증빙, 나란히 확인</h3><p>내역과 증빙에서 읽은 항목을 비교하는 화면입니다.</p></div>
    <div className="fd-document-info"><div><span className="fd-kicker">예시 거래</span><strong>TX-0238 · 오크 다이닝</strong><span>접대비 / 2026.03.20</span></div><div><span className="fd-kicker">예시 증빙</span><strong>receipt_0320.pdf</strong><span>비교 항목 4개 / 확인 필요 1개</span></div></div>
    <div className="fd-filter-line"><span>항목별 대조</span><label><input type="checkbox" checked={onlyMismatch} onChange={(event) => setOnlyMismatch(event.target.checked)} />불일치만 보기</label></div>
    <div className="fd-table-wrap"><table className="fd-table"><thead><tr><th>항목</th><th>사용 내역</th><th>증빙 항목</th><th>결과</th></tr></thead><tbody>{comparedFields.filter((item) => !onlyMismatch || !item[3]).map(([field, record, receipt, match]) => <tr key={field} className={!match ? "fd-mismatch-row" : ""}><td><strong>{field}</strong></td><td>{record}</td><td>{receipt}</td><td><span className={`fd-badge ${match ? "fd-risk-normal" : "fd-risk-high"}`}>{match ? "일치" : "불일치"}</span></td></tr>)}</tbody></table></div>
    <section className="fd-evidence"><span className="fd-kicker">확인할 내용</span><h4>금액 차이 9,000원</h4><p>사용 내역과 증빙에 표시된 금액이 다릅니다. 입력 오류나 추가 결제 여부를 원본과 함께 확인해 주세요.</p><p className="fd-small-note">모든 항목은 예시이며, 실제 OCR이나 증빙 분석은 수행하지 않았습니다.</p></section>
  </>;
}

const forensicTabs = ["Hash", "이미지", "메타데이터"];
function Forgery() {
  const [active, setActive] = useState("Hash");
  return <>
    <div className="fd-heading"><span className="fd-kicker">TRACE THE EVIDENCE</span><h3>증빙에 남은 흔적을 따라</h3><p>파일의 동일성, 이미지 신호, 생성 이력을 함께 살펴봅니다.</p></div>
    <div className="fd-tabs" role="tablist" aria-label="위변조 분석 종류">{forensicTabs.map((tab) => <button key={tab} type="button" id={`fd-tab-${tab}`} role="tab" aria-selected={active === tab} aria-controls="fd-forensic-panel" tabIndex={active === tab ? 0 : -1} onClick={() => setActive(tab)} onKeyDown={(event) => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); const index = (forensicTabs.indexOf(tab) + (event.key === "ArrowRight" ? 1 : 2)) % 3; setActive(forensicTabs[index]); document.getElementById(`fd-tab-${forensicTabs[index]}`)?.focus(); } }}>{tab}</button>)}</div>
    <section id="fd-forensic-panel" role="tabpanel" aria-labelledby={`fd-tab-${active}`} className="fd-forensic-panel">
      {active === "Hash" && <><span className="fd-badge fd-risk-medium">예시 · 중복 파일 신호</span><h4>같은 파일이 다른 거래에 연결된 경우</h4><p>파일 내용의 지문이 같으면 동일 증빙의 반복 제출 여부를 검토할 수 있습니다.</p><div className="fd-table-wrap"><table className="fd-table"><thead><tr><th>증빙</th><th>연결 거래</th><th>파일 지문</th></tr></thead><tbody><tr><td>receipt_0320.pdf</td><td>TX-0238</td><td><code>a8f2…7c91</code></td></tr><tr><td>receipt_copy.pdf</td><td>TX-0240</td><td><code>a8f2…7c91</code></td></tr></tbody></table></div></>}
      {active === "이미지" && <><span className="fd-badge fd-risk-medium">예시 · 추가 확인 필요</span><h4>금액 영역의 이미지 특성 차이</h4><p>글자 주변의 압축·색상 차이는 수정 이외에도 재저장이나 촬영 환경 때문에 나타날 수 있습니다.</p><dl className="fd-facts"><div><dt>확인 영역</dt><dd>합계 금액 주변</dd></div><div><dt>관찰 예시</dt><dd>주변과 다른 압축 흔적</dd></div><div><dt>후속 검토</dt><dd>원본 파일과 재발급 증빙 비교</dd></div></dl></>}
      {active === "메타데이터" && <><span className="fd-badge fd-risk-medium">예시 · 수정 이력 존재</span><h4>파일이 생성되고 수정된 순서</h4><p>메타데이터의 수정 기록만으로 증빙의 위변조를 단정할 수 없습니다.</p><dl className="fd-facts"><div><dt>파일 생성</dt><dd>2026.03.20 20:24</dd></div><div><dt>마지막 수정</dt><dd>2026.03.21 09:12</dd></div><div><dt>기록된 프로그램</dt><dd>PDF 편집 도구</dd></div></dl></>}
    </section>
    <p className="fd-notice">위 신호와 파일 지문은 화면 설명을 위한 예시입니다. 실제 Hash 계산, 이미지 분석, 메타데이터 추출은 연결 전입니다.</p>
  </>;
}

export function FeatureDetail({ feature, onNavigate, department }) {
  return <div className="fd-shell" style={{ "--fd-accent": feature.color || "#cbd6c4" }}>
    <aside className="fd-sidebar">{department && <span className="fd-department">{department.name}</span>}<span className="fd-kicker">MODULE {feature.number}</span><h2>{feature.title}</h2><p className="fd-description">{feature.description}</p><nav aria-label="감사 기능"><div className="fd-nav-label">WORKSPACE</div>{modules.map(([id, number, title]) => <button key={id} type="button" className={`fd-nav-item ${feature.id === id ? "fd-nav-active" : ""}`} aria-current={feature.id === id ? "page" : undefined} onClick={() => onNavigate(id)}><span>{number}</span>{title}</button>)}</nav><div className="fd-sidebar-note">작은 신호에서 시작하는<br />더 정확한 점검.</div></aside>
    <div className="fd-content"><div className="fd-demo-label"><span aria-hidden="true" />{department && `${department.name} · `}예시 데이터 · 실제 분석 전</div>{department && <p className="fd-context-note">선택 부서의 화면 흐름용 예시입니다. 실제 부서 데이터의 분석 결과가 아닙니다.</p>}{feature.id === "upload" && <Upload onNavigate={onNavigate} />}{feature.id === "detect" && <Detect key={department?.id || "workspace"} department={department} />}{feature.id === "discover" && <Discover key={department?.id || "workspace"} department={department} />}{feature.id === "compare" && <Compare />}{feature.id === "forgery" && <Forgery />}</div>
  </div>;
}
