import { useState } from "react";
import "./department.css";

const formatNumber = (value) => new Intl.NumberFormat("ko-KR").format(value);

export function DepartmentDashboard({ departments, selectedDepartment, onSelect, onReset }) {
  const [highlighted, setHighlighted] = useState(null);
  const anomalyTotal = departments.reduce((sum, department) => sum + department.anomalies, 0);
  const transactionTotal = departments.reduce((sum, department) => sum + department.transactions, 0);
  const highest = departments.reduce((current, department) => department.anomalies > current.anomalies ? department : current, departments[0]);

  return (
    <section className="db-dashboard" aria-labelledby="department-overview-title">
      <div className="db-heading-row">
        <div>
          <p className="db-eyebrow">ORGANIZATION OVERVIEW</p>
          <h1 className="db-title" id="department-overview-title">부서별 감사 현황</h1>
          <p className="db-subtitle">조직의 신호를 한눈에. 부서를 선택해 더 깊이 살펴보세요.</p>
        </div>
        <div className="db-totals" aria-label="전체 부서 점검 요약">
          <div><span>점검 부서</span><strong>{departments.length}<small>개</small></strong></div>
          <div><span>전체 거래</span><strong>{formatNumber(transactionTotal)}<small>건</small></strong></div>
          <div className="db-total-alert"><span>이상징후</span><strong>{formatNumber(anomalyTotal)}<small>건</small></strong></div>
        </div>
      </div>

      <div className="db-observatory">
        <div className="db-map">
          <div className="db-map-caption"><span>DEPARTMENT LANDSCAPE</span><span className="db-sample-label">예시 데이터</span></div>
          <div className="db-scene" aria-label="부서별 이상징후를 높이로 표현한 3D 블록">
            <div className="db-plane" aria-hidden="true">
              <div className="db-ground" aria-hidden="true">{departments.map((department) => <span key={department.id} />)}</div>
              {departments.map((department, index) => {
                const selected = selectedDepartment?.id === department.id;
                const hasAnomaly = department.anomalies > 0;
                const height = 24 + department.anomalies * 6.5;
                return (
                  <div
                    className={`db-lot ${hasAnomaly ? "db-lot-alert" : "db-lot-clear"} ${selected ? "db-lot-selected" : ""} ${highlighted === department.id ? "db-lot-highlighted" : ""}`}
                    key={department.id}
                    style={{ "--db-column": index % 3, "--db-row": Math.floor(index / 3), "--db-height": `${height}px`, "--db-delay": `${index * 85}ms` }}
                  >
                    <span className="db-footprint" aria-hidden="true" />
                    <span className="db-building-lift">
                      <span className="db-structure">
                        <span className="db-cube-top"><span>{String(index + 1).padStart(2, "0")}</span><strong>{department.anomalies}</strong></span>
                        <span className="db-cube-front" />
                        <span className="db-cube-right" />
                      </span>
                      <span className="db-label-anchor" aria-hidden="true"><span className="db-nameplate"><span>{department.name}</span><strong>{hasAnomaly ? `${department.anomalies}건 확인 필요` : "이상징후 없음"}</strong></span></span>
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Flat pointer targets keep the 3D blocks clickable in embedded WebKit. */}
            <div className="db-hit-layer">
              {departments.map((department, index) => {
                const height = 24 + department.anomalies * 6.5;
                const angle = 32 * Math.PI / 180;
                const tilt = 58 * Math.PI / 180;
                const cx = 96 + (index % 3) * 164 - 280;
                const cy = 82 + Math.floor(index / 3) * 156 - 165;
                const x = cx * Math.cos(angle) - cy * Math.sin(angle);
                const baseY = (cx * Math.sin(angle) + cy * Math.cos(angle)) * Math.cos(tilt);
                const projectedHeight = (112 * Math.sin(angle) + 88 * Math.cos(angle)) * Math.cos(tilt) + height * Math.sin(tilt);
                const projectedWidth = 112 * Math.cos(angle) + 88 * Math.sin(angle);
                return <button type="button" key={department.id} className="db-block-hit" aria-label={`${department.name}, 이상징후 ${department.anomalies}건, 거래 ${formatNumber(department.transactions)}건 선택`} aria-pressed={selectedDepartment?.id === department.id} title={`${department.name} 감사 도구 열기`} onPointerEnter={() => setHighlighted(department.id)} onPointerLeave={() => setHighlighted(null)} onFocus={() => setHighlighted(department.id)} onBlur={() => setHighlighted(null)} onClick={(event) => onSelect(department.id, event.currentTarget)} style={{ "--db-hit-x": `${x}px`, "--db-hit-y": `${baseY - height / 2 * Math.sin(tilt)}px`, "--db-hit-width": `${projectedWidth}px`, "--db-hit-height": `${projectedHeight}px`, zIndex: Math.round(baseY + 100) }} />;
              })}
            </div>
          </div>
          <div className="db-map-footer"><div className="db-legend"><span><i className="db-legend-clear" />이상징후 없음</span><span><i className="db-legend-alert" />확인 필요</span></div><span className="db-height-note">블록 높이 = 이상징후 건수</span></div>
        </div>

        <aside className="db-departments" aria-labelledby="db-list-title">
          <div className="db-list-heading"><div><p className="db-eyebrow">EXPLORE DEPARTMENTS</p><h2 id="db-list-title">{selectedDepartment ? selectedDepartment.name : "부서를 선택하세요"}</h2></div>{selectedDepartment && <button type="button" className="db-reset" onClick={onReset}>전체 보기</button>}</div>
          <div className="db-department-list">
            {departments.map((department, index) => <button type="button" key={department.id} className={`db-department-row ${selectedDepartment?.id === department.id ? "db-row-selected" : ""}`} aria-pressed={selectedDepartment?.id === department.id} onClick={(event) => onSelect(department.id, event.currentTarget)}><span className="db-row-number">{String(index + 1).padStart(2, "0")}</span><span className="db-row-name">{department.name}</span><span className={department.anomalies > 0 ? "db-row-alert" : "db-row-clear"}>{department.anomalies > 0 ? `${department.anomalies}건` : "0건"}</span><span className="db-row-direction" aria-hidden="true">↗</span></button>)}
          </div>
          <div className="db-selection-note" aria-live="polite">{selectedDepartment ? <><strong>{selectedDepartment.name} 감사 도구가 열렸습니다.</strong><span>아래 카드를 선택해 점검을 이어가세요.</span></> : <><strong>{highest.name}부터 살펴보세요.</strong><span>이상징후 {highest.anomalies}건 · 높은 블록일수록 확인할 신호가 많아요.</span></>}</div>
        </aside>
      </div>
      <p className="db-disclaimer">화면의 부서와 수치는 설명을 위한 예시이며, 이상징후는 위반 여부를 확정하는 결과가 아닙니다.</p>
    </section>
  );
}
