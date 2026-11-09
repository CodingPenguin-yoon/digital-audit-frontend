import { useState } from "react";
import "./detail.css";

export function Upload({ onNavigate }) {
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
    <div className="fd-bottom-action"><p>먼저 화면의 흐름을 살펴볼까요?</p><button type="button" className="fd-primary" onClick={() => onNavigate("review")}>예시 점검 결과 보기</button></div>
  </>;
}
