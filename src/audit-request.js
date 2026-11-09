const scenarioMatchers = [
  ["holiday", /휴일|주말/],
  ["split", /분할/],
  ["late", /심야|야간/],
  ["account", /계정/],
  ["missing", /증빙(?:이|자료가)?\s*(?:누락|없)|누락된?\s*증빙/],
  ["amount", /금액.*(?:불일치|차이|다른)|불일치.*금액/],
  ["reuse", /재사용|중복\s*증빙|동일\s*증빙/],
];

const unsupported = (error) => ({ error });
const dateString = (day) => `2026.03.${String(day).padStart(2, "0")}`;
const scenarioTerms = {
  holiday: ["휴일", "주말"],
  split: ["분할결제", "분할"],
  late: ["심야", "야간"],
  account: ["계정", "확인이", "확인", "필요한", "필요"],
  missing: ["증빙자료", "증빙", "누락된", "누락", "없는", "없음"],
  amount: ["금액", "불일치", "차이", "다른"],
  reuse: ["동일", "중복", "증빙", "재사용"],
};

function hasUnrecognizedConditions(query, departments, scenarioId) {
  const suffix = "(?:에서|으로|부터|까지|을|를|의|이|가|에|은|는|만)?";
  let remainder = query
    .replace(/20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}(?:부터|까지|에)?/g, "")
    .replace(/20\d{2}년?/g, "")
    .replace(/\d{1,2}월(?:의|에)?/g, "")
    .replace(/\d{1,2}일(?:부터|까지|에)?/g, "");
  const terms = [...departments.map((department) => department.name), ...scenarioTerms[scenarioId], "전체 부서", "모든 부서", "전체", "모든", "거래들", "거래", "결제", "사용", "내역", "건들", "건"];
  for (const term of terms) remainder = remainder.replace(new RegExp(`${term.replaceAll(" ", "\\s*")}${suffix}`, "g"), "");
  remainder = remainder.replace(/(?:확인|점검|조회)(?:해\s*(?:주세요|줘|줄래|봐|주실래요|주실래)?|해요)?(?:\s*주세요)?|찾아\s*(?:주세요|줘|줄래|봐)|보여\s*(?:주세요|줘|줄래)|알려\s*(?:주세요|줘)|요청(?:합니다)?|부탁(?:합니다|해요|해)?/g, "");
  return remainder.replace(/[\s,.?!·:;'"“”‘’()]/g, "").length > 0;
}

// Deliberately bounded condition preview for the prototype's March examples.
// Unsupported conditions must never silently become an unrestricted request.
export function parseAuditRequest(input, departments, scenarios) {
  const query = input.normalize("NFKC").trim();
  if (!query) return unsupported("점검할 내용을 입력해 주세요.");
  if (/제외|빼고|빼줘|말고|아닌|아니라|않|이외|이후|이전|전후|이상|이하|초과|미만|제외한/.test(query)) return unsupported("제외·부정·이후·이전 같은 조건은 아직 해석하지 않습니다. 포함할 부서와 시나리오, 정확한 날짜 범위로 요청해 주세요.");
  if (/오늘|어제|내일|지난|최근|이번|올해|작년|주차|주간|분기/.test(query)) return unsupported("현재 예시는 2026년 3월 자료입니다. 상대 날짜 대신 ‘3월’ 또는 ‘3월 19일’처럼 입력해 주세요.");
  const years = [...query.matchAll(/(20\d{2})(?:년|[.\/-]|\s)/g)].map((match) => Number(match[1]));
  if (years.some((year) => year !== 2026)) return unsupported("2026년 3월 이외의 자료는 준비되어 있지 않습니다.");
  const months = [...query.matchAll(/(\d{1,2})월/g)].map((match) => Number(match[1]));
  const fullDates = [...query.matchAll(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})/g)];
  if (fullDates.length && /\d{1,2}일/.test(query.replace(/20\d{2}[.\/-]\d{1,2}[.\/-]\d{1,2}/g, ""))) return unsupported("날짜 범위는 같은 형식으로 입력해 주세요. 예: ‘3월 19일부터 3월 21일까지’");
  if (months.some((month) => month !== 3) || fullDates.some((match) => Number(match[2]) !== 3)) return unsupported("현재는 2026년 3월 거래 예시만 점검할 수 있습니다.");
  if (/\d[\d,]*\s*(?:만\s*)?원|이상|이하|초과|미만/.test(query)) return unsupported("금액 조건은 아직 해석하지 않습니다. 부서와 휴일 사용·증빙 누락 같은 점검 시나리오로 요청해 주세요.");
  if (/해외|국내|접대비|교통비|출장비|소모품비|교육비|가맹점|거래처|승인번호|승인 번호/.test(query)) return unsupported("현재는 기간·부서·점검 시나리오를 해석합니다. 사용처·비용 계정 같은 추가 조건을 제외하고 다시 요청해 주세요.");
  if (/\d{1,2}\s*[~–-]\s*\d{1,2}일/.test(query)) return unsupported("날짜 범위는 ‘3월 19일부터 3월 21일까지’처럼 시작일과 종료일을 각각 입력해 주세요.");
  const namedDepartments = departments.filter((department) => query.includes(department.name));
  const departmentWords = [...query.matchAll(/[가-힣A-Za-z0-9]+(?:팀|부서)/g)].map((match) => match[0]);
  if (departmentWords.some((word) => !departments.some((department) => department.name === word) && word !== "전체부서" && word !== "모든부서" && word !== "부서")) return unsupported("현재 자료에 없는 부서가 포함되어 있습니다. 영업팀·재무팀·인사팀·마케팅팀·개발팀·경영지원팀 중 선택해 주세요.");
  if (namedDepartments.length > 1) return unsupported("한 번에 한 부서를 지정해 주세요. 부서를 생략하면 전체 부서를 점검합니다.");
  const matches = scenarioMatchers.filter(([id, matcher]) => scenarios.some((scenario) => scenario.id === id) && matcher.test(query));
  if (matches.length !== 1) return unsupported(matches.length > 1 ? "한 번에 하나의 점검 시나리오를 요청해 주세요." : "휴일 사용, 분할결제, 심야 사용, 계정 확인, 증빙 누락, 금액 불일치, 증빙 재사용 중 하나를 입력해 주세요.");
  const days = fullDates.length ? fullDates.map((match) => Number(match[3])) : [...query.matchAll(/(\d{1,2})일/g)].map((match) => Number(match[1]));
  if (days.length > 2 || days.some((day) => day < 1 || day > 31) || (days.length === 2 && days[0] > days[1])) return unsupported("날짜 범위를 확인해 주세요. 3월 1일부터 31일 사이의 시작일과 종료일을 입력할 수 있습니다.");
  if (((query.includes("부터") || query.includes("까지")) && days.length !== 2) || (days.length === 2 && !/부터.*까지|[~–]/.test(query))) return unsupported("날짜 범위는 시작일과 종료일을 모두 입력해 주세요. 예: ‘3월 19일부터 3월 21일까지’");
  if (hasUnrecognizedConditions(query, departments, matches[0][0])) return unsupported("아직 해석하지 못하는 조건이 포함되어 있습니다. 예시 요청처럼 기간·부서·점검 시나리오를 중심으로 입력해 주세요.");
  const fromDate = days.length ? dateString(days[0]) : "2026.03.01";
  const toDate = days.length ? dateString(days[days.length - 1]) : "2026.03.31";
  return { departmentId: namedDepartments[0]?.id || null, scenarioId: matches[0][0], fromDate, toDate };
}
