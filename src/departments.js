// Synthetic examples used only to demonstrate department selection and audit flows.
export const departments = [
  {
    id: "sales", name: "영업팀", english: "SALES", anomalies: 14,
    transactions: 486,
    exampleTransactions: [
      { id: "SL-0241", date: "2026.03.21", shop: "그린필드 골프", amount: "380,000", level: "높음", type: "휴일 사용", reason: "토요일 골프장 결제입니다. 업무 목적과 사전 승인 여부를 확인해 주세요.", evidence: "부서: 영업팀 / 결제일: 토요일 / 업무 목적 증빙: 미등록" },
      { id: "SL-0238", date: "2026.03.20", shop: "오크 다이닝", amount: "198,000", level: "보통", type: "분할결제 의심", reason: "동일 가맹점에서 8분 간격으로 결제된 거래가 있습니다.", evidence: "부서: 영업팀 / 인접 결제: 20:14, 20:22 / 합계: 396,000원" },
      { id: "SL-0235", date: "2026.03.19", shop: "센트럴 오피스", amount: "64,000", level: "보통", type: "증빙 누락", reason: "비용 내역에 연결된 증빙 파일이 없습니다.", evidence: "부서: 영업팀 / 계정: 소모품비 / 첨부: 0개" },
      { id: "SL-0232", date: "2026.03.18", shop: "서울역 KTX", amount: "59,800", level: "정상", type: "해당 없음", reason: "등록한 예시 기준에 해당하는 신호가 없습니다. 실제 정상 여부를 확정하는 결과는 아닙니다.", evidence: "부서: 영업팀 / 출장 기간 내 결제 / 증빙 일치" },
    ],
  },
  {
    id: "finance", name: "재무팀", english: "FINANCE", anomalies: 5,
    transactions: 312,
    exampleTransactions: [
      { id: "FN-0118", date: "2026.03.23", shop: "센트럴 컨설팅", amount: "480,000", level: "높음", type: "동일 증빙 재사용", reason: "다른 거래에 연결된 파일과 지문이 같은 증빙의 예시입니다.", evidence: "부서: 재무팀 / 연결 거래: FN-0112, FN-0118 / 파일 지문 일치" },
      { id: "FN-0106", date: "2026.03.19", shop: "시티 문구", amount: "84,000", level: "보통", type: "증빙 누락", reason: "거래와 연결된 증빙을 확인해 주세요.", evidence: "부서: 재무팀 / 계정: 소모품비 / 첨부: 0개" },
      { id: "FN-0102", date: "2026.03.18", shop: "오피스 플러스", amount: "126,000", level: "정상", type: "해당 없음", reason: "예시 기준에 해당하는 이상징후가 없습니다.", evidence: "부서: 재무팀 / 승인 내역과 증빙 항목 일치" },
    ],
  },
  {
    id: "people", name: "인사팀", english: "PEOPLE", anomalies: 0,
    transactions: 208,
    exampleTransactions: [
      { id: "HR-0084", date: "2026.03.20", shop: "러닝 센터", amount: "220,000", level: "정상", type: "해당 없음", reason: "교육 계획과 일치하는 예시 거래입니다. 추가 확인 신호가 없습니다.", evidence: "부서: 인사팀 / 계정: 교육훈련비 / 승인 및 증빙 등록" },
      { id: "HR-0078", date: "2026.03.18", shop: "오피스 북스", amount: "48,000", level: "정상", type: "해당 없음", reason: "예시 기준에 해당하는 이상징후가 없습니다.", evidence: "부서: 인사팀 / 구입 품목과 증빙 일치" },
    ],
    patterns: [],
  },
  {
    id: "marketing", name: "마케팅팀", english: "MARKETING", anomalies: 8,
    transactions: 365,
    exampleTransactions: [
      { id: "MK-0172", date: "2026.03.20", shop: "시티 라운지", amount: "162,000", level: "높음", type: "심야 사용", reason: "23시 이후 반복된 결제입니다. 행사 진행 기록과 업무 목적을 확인해 주세요.", evidence: "부서: 마케팅팀 / 결제 시각: 23:18 / 동일 업종 반복" },
      { id: "MK-0165", date: "2026.03.19", shop: "크리에이티브 스토어", amount: "286,000", level: "보통", type: "계정 확인 필요", reason: "등록한 비용 계정과 품목 분류의 업무 연관성을 확인해 주세요.", evidence: "부서: 마케팅팀 / 계정: 광고선전비 / 품목 확인 필요" },
      { id: "MK-0158", date: "2026.03.17", shop: "프린트 스튜디오", amount: "82,000", level: "정상", type: "해당 없음", reason: "예시 기준에 해당하는 이상징후가 없습니다.", evidence: "부서: 마케팅팀 / 행사 인쇄물 / 증빙 등록" },
    ],
  },
  {
    id: "engineering", name: "개발팀", english: "ENGINEERING", anomalies: 0,
    transactions: 642,
    exampleTransactions: [
      { id: "EN-0312", date: "2026.03.20", shop: "클라우드 서비스", amount: "340,000", level: "정상", type: "해당 없음", reason: "예시 사용 계획과 일치하며 추가 확인 신호가 없습니다.", evidence: "부서: 개발팀 / 계정: 전산운영비 / 계약 기간과 금액 일치" },
      { id: "EN-0305", date: "2026.03.19", shop: "테크 북스", amount: "62,000", level: "정상", type: "해당 없음", reason: "예시 기준에 해당하는 이상징후가 없습니다.", evidence: "부서: 개발팀 / 업무용 도서 / 증빙 등록" },
    ],
    patterns: [],
  },
  {
    id: "operations", name: "경영지원팀", english: "OPERATIONS", anomalies: 2,
    transactions: 267,
    exampleTransactions: [
      { id: "OP-0064", date: "2026.03.20", shop: "오크 다이닝", amount: "198,000", level: "보통", type: "증빙 금액 불일치", reason: "기록과 증빙의 금액 차이를 확인해 주세요.", evidence: "부서: 경영지원팀 / 기록: 198,000원 / 예시 증빙: 189,000원" },
      { id: "OP-0060", date: "2026.03.18", shop: "오피스 케어", amount: "74,000", level: "정상", type: "해당 없음", reason: "예시 기준에 해당하는 이상징후가 없습니다.", evidence: "부서: 경영지원팀 / 계정과 증빙 일치" },
    ],
  },
];
