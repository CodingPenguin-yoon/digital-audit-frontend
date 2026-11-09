export const auditTypes = [
  { id: "rules", number: "01", title: "규정 관련 신호", description: "휴일·심야 사용, 분할결제" },
  { id: "compare", number: "02", title: "증빙 대조", description: "증빙 누락, 사용 내역과의 차이" },
  { id: "forgery", number: "03", title: "위변조 의심", description: "동일 증빙 재사용과 파일 흔적" },
  { id: "discover", number: "04", title: "새로운 패턴", description: "반복·연결을 살펴볼 패턴 후보" },
];

const categoriesByType = {
  "휴일 사용": ["rules"],
  "분할결제 의심": ["rules", "discover"],
  "심야 사용": ["rules", "discover"],
  "계정 확인 필요": ["rules"],
  "증빙 누락": ["compare"],
  "증빙 금액 불일치": ["compare"],
  "동일 증빙 재사용": ["forgery"],
};

export const auditScenarios = [
  { id: "holiday", title: "휴일 사용", categories: ["rules"] },
  { id: "split", title: "분할결제 의심", categories: ["rules", "discover"] },
  { id: "late", title: "심야 사용", categories: ["rules", "discover"] },
  { id: "account", title: "계정 확인 필요", categories: ["rules"] },
  { id: "missing", title: "증빙 누락", categories: ["compare"] },
  { id: "amount", title: "증빙 금액 불일치", categories: ["compare"] },
  { id: "reuse", title: "동일 증빙 재사용", categories: ["forgery"] },
];

// Membership describes screen examples, not live analysis. A transaction can
// belong to multiple categories, while every result list keeps it unique.
export function getRecordCategories(record) {
  return record.level === "정상" ? [] : categoriesByType[record.type] || [];
}

export function getAuditRows(departments, departmentId = null, categoryId = "all", { scenarioId = null, fromDate = null, toDate = null, includeNormal = false } = {}) {
  return departments
    .filter((department) => !departmentId || departmentId === "all" || department.id === departmentId)
    .flatMap((department) => department.exampleTransactions
      .filter((record) => (includeNormal || record.level !== "정상")
        && (categoryId === "all" || getRecordCategories(record).includes(categoryId))
        && (!scenarioId || auditScenarios.find((scenario) => scenario.id === scenarioId)?.title === record.type)
        && (!fromDate || record.date >= fromDate)
        && (!toDate || record.date <= toDate))
      .map((record) => ({ ...record, departmentId: department.id, departmentName: department.name, scenarioId: auditScenarios.find((scenario) => scenario.title === record.type)?.id || null })));
}

// The matrix and review queue share the same transaction examples and filters.
// Ranking is stable on ties and independent of the selected matrix cell.
export function buildRiskMatrix(departments, categoryId = "all", dateRange = {}) {
  const rows = getAuditRows(departments, null, categoryId, dateRange);
  const scenarios = auditScenarios.filter((scenario) => categoryId === "all" || scenario.categories.includes(categoryId));
  const ranked = departments.map((department) => ({ ...department, anomalies: rows.filter((row) => row.departmentId === department.id).length }))
    .sort((a, b) => b.anomalies - a.anomalies).slice(0, 8);
  const cells = ranked.flatMap((department) => scenarios.map((scenario) => ({
    departmentId: department.id,
    scenarioId: scenario.id,
    count: rows.filter((row) => row.departmentId === department.id && row.scenarioId === scenario.id).length,
  })));
  return { departments: ranked, scenarios, cells, total: cells.reduce((sum, cell) => sum + cell.count, 0) };
}
