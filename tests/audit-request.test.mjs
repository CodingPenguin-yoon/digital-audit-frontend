import test from "node:test";
import assert from "node:assert/strict";
import { parseAuditRequest } from "../src/audit-request.js";
import { departments } from "../src/departments.js";

const scenarios = ["holiday", "split", "late", "account", "missing", "amount", "reuse"].map((id) => ({ id, title: id }));
const parse = (query) => parseAuditRequest(query, departments, scenarios);

test("a specific department and scenario produce bounded March conditions", () => {
  assert.deepEqual(parse("3월 영업팀의 휴일 사용을 확인해줘"), { departmentId: "sales", scenarioId: "holiday", fromDate: "2026.03.01", toDate: "2026.03.31" });
  assert.equal(parse("3월 재무팀의 동일 증빙 재사용을 확인해줘").scenarioId, "reuse");
});

test("missing evidence request has all departments and one known scenario", () => {
  assert.deepEqual(parse("증빙이 누락된 거래를 찾아줘"), { departmentId: null, scenarioId: "missing", fromDate: "2026.03.01", toDate: "2026.03.31" });
});

test("day and day range apply precise conditions", () => {
  assert.equal(parse("3월 20일 영업팀 분할결제 확인해줘").fromDate, "2026.03.20");
  assert.equal(parse("3월 19일부터 3월 21일까지 심야 결제 찾아줘").toDate, "2026.03.21");
  assert.equal(parse("2026-03-20 증빙 누락 찾아줘").toDate, "2026.03.20");
});

test("unavailable dates and departments cannot broaden into all results", () => {
  for (const query of ["4월 영업팀 휴일 사용", "2025년 3월 증빙 누락", "2026-04-20 증빙 누락", "지난달 심야 사용", "3월 40일 증빙 누락", "3월 21일부터 3월 19일까지 심야 사용", "법무팀 휴일 사용"]) assert.ok(parse(query).error, query);
});

test("unsupported or ambiguous conditions require correction", () => {
  for (const query of ["영업팀 지출 찾아줘", "영업팀 재무팀 휴일 사용", "휴일과 심야 사용", "10만원 이상 휴일 사용", "해외 휴일 사용", "3월 19~21일 심야 사용", ""]) assert.ok(parse(query).error, query);
});

test("exclusion, negation and open date ranges never silently invert the request", () => {
  for (const query of ["영업팀 제외 휴일", "휴일이 아닌 거래", "휴일 거래는 빼고", "3월 19일 이후 휴일", "3월 19일 이전 심야", "3월 19일부터 휴일", "3월 20일까지 증빙 누락", "3월 19일과 21일 심야 사용", "3월 19일부터 2026.03.21까지 심야 사용"]) assert.ok(parse(query).error, query);
});

test("unrecognized merchants or conditions do not disappear from an accepted request", () => {
  for (const query of ["오크 다이닝 휴일 거래", "영업팀 골프장 휴일", "휴일 거래 중 미승인 건", "심야 현금 사용", "주말 업무 외 사용"]) assert.ok(parse(query).error, query);
});

test("supported conversational variants retain their intended scenario", () => {
  for (const [query, id] of [["전체 부서의 주말 사용 내역을 보여줘", "holiday"], ["영업팀만 분할결제 찾아줘", "split"], ["야간 사용을 점검해 주세요", "late"], ["계정 확인이 필요한 거래를 찾아줘", "account"], ["누락된 증빙 확인해줘", "missing"], ["금액이 다른 거래를 찾아줘", "amount"], ["중복 증빙 찾아주세요", "reuse"]]) assert.equal(parse(query).scenarioId, id, query);
});
