// These records describe the prototype's evidence examples, not parsed files.
const evidenceExamples = {
  "SL-0241": { file: "SL-0241_receipt.pdf", account: "접대비", criterion: "휴일 결제의 업무 목적과 사전 승인 확인", purpose: "업무 목적 자료 미등록", followUp: "업무 목적 설명과 사전 승인 자료를 요청해 주세요." },
  "SL-0238": { file: "SL-0238_receipt.pdf", account: "접대비", criterion: "동일 가맹점의 인접 시간 결제 확인", context: "20:14 · 20:22 결제 / 198,000원씩 / 합계 396,000원", followUp: "인접 결제의 이용 목적과 참석자가 같은지 확인해 주세요." },
  "SL-0235": { file: null, account: "소모품비", criterion: "사용 내역에 연결된 증빙 등록 확인", followUp: "거래에 해당하는 원본 영수증을 요청해 주세요." },
  "SL-0232": { file: "SL-0232_ticket.pdf", account: "여비교통비", criterion: "출장 기간 및 교통비 증빙 항목 확인", context: "출장 기간 내 결제 · 예시 증빙과 항목 일치", followUp: "출장 일정과 승인 내용을 함께 확인해 주세요." },
  "FN-0118": { file: "FN-0118_receipt.pdf", account: "지급수수료", criterion: "동일 증빙이 서로 다른 거래에 연결됐는지 확인", duplicate: "FN-0112", fingerprint: "e91a…8f40", followUp: "FN-0112와 FN-0118의 원본 증빙 및 지급 사유를 비교해 주세요." },
  "FN-0106": { file: null, account: "소모품비", criterion: "사용 내역에 연결된 증빙 등록 확인", followUp: "가맹점에서 발급한 원본 증빙을 요청해 주세요." },
  "FN-0102": { file: "FN-0102_receipt.pdf", account: "소모품비", criterion: "승인 내역과 증빙 항목 일치 확인", context: "승인 금액 · 사용처 · 결제 일자 일치 예시", followUp: "승인 내역과 원본 증빙을 최종 확인해 주세요." },
  "HR-0084": { file: "HR-0084_receipt.pdf", account: "교육훈련비", criterion: "교육 계획과 승인 및 증빙 확인", context: "교육 계획 · 사전 승인 · 증빙 등록 예시", followUp: "교육 대상과 실제 참석 내역을 함께 확인해 주세요." },
  "HR-0078": { file: "HR-0078_receipt.pdf", account: "도서인쇄비", criterion: "구입 품목과 업무 관련성 확인", context: "업무용 도서 구입 내역과 증빙 일치 예시", followUp: "구입 품목이 업무 목적에 해당하는지 확인해 주세요." },
  "MK-0172": { file: "MK-0172_receipt.pdf", account: "행사비", criterion: "심야 시간 결제의 업무 목적 확인", context: "23:18 결제 · 동일 업종 반복 신호 예시", purpose: "행사 진행 자료 확인 필요", followUp: "행사 일정과 참석 기록으로 업무 목적을 확인해 주세요." },
  "MK-0165": { file: "MK-0165_receipt.pdf", account: "광고선전비", criterion: "지출 품목과 비용 계정의 업무 연관성 확인", context: "품목 분류 자료 확인 필요 · 금액 불일치 신호 없음", followUp: "원본 품목 명세와 비용 계정 선택 사유를 확인해 주세요." },
  "MK-0158": { file: "MK-0158_receipt.pdf", account: "광고선전비", criterion: "행사 인쇄물의 사용 내역과 증빙 확인", context: "행사 인쇄물 구입 · 예시 증빙 등록", followUp: "인쇄 품목과 행사 사용 목적을 확인해 주세요." },
  "EN-0312": { file: "EN-0312_invoice.pdf", account: "전산운영비", criterion: "계약 기간 및 서비스 이용 금액 확인", context: "예시 계약 기간과 청구 금액 일치", followUp: "계약 내용과 서비스 이용 기간을 확인해 주세요." },
  "EN-0305": { file: "EN-0305_receipt.pdf", account: "도서인쇄비", criterion: "업무용 도서의 사용 내역과 증빙 확인", context: "업무용 도서 구입 · 예시 증빙 등록", followUp: "도서 품목과 업무 관련성을 확인해 주세요." },
  "OP-0064": { file: "OP-0064_receipt.pdf", account: "접대비", criterion: "사용 내역과 증빙의 결제 금액 일치 확인", receiptAmount: "189,000", followUp: "9,000원 차이의 입력 오류 또는 추가 결제 여부를 확인해 주세요." },
  "OP-0060": { file: "OP-0060_receipt.pdf", account: "소모품비", criterion: "비용 계정과 증빙 항목 확인", context: "비용 계정 · 예시 증빙 항목 일치", followUp: "원본 품목 명세와 비용 계정을 확인해 주세요." },
};

export function getReviewEvidence(record) {
  const example = evidenceExamples[record.id];
  const hasEvidence = Boolean(example?.file);
  const receiptAmount = example?.receiptAmount ?? record.amount;
  const fields = [
    { label: "결제 일자", recorded: record.date, evidence: hasEvidence ? record.date : "미등록", status: hasEvidence ? "일치" : "증빙 없음" },
    { label: "가맹점", recorded: record.shop, evidence: hasEvidence ? record.shop : "미등록", status: hasEvidence ? "일치" : "증빙 없음" },
    { label: "결제 금액", recorded: `${record.amount}원`, evidence: hasEvidence ? `${receiptAmount}원` : "미등록", status: !hasEvidence ? "증빙 없음" : receiptAmount === record.amount ? "일치" : "불일치" },
  ];
  if (example?.purpose) fields.push({ label: "업무 목적", recorded: "설명·승인 확인 대상", evidence: example.purpose, status: "확인 필요" });
  return {
    file: example?.file ?? null,
    account: example?.account ?? "자료 미등록",
    criterion: example?.criterion ?? "연결 자료 확인 필요",
    context: example?.context ?? record.evidence,
    followUp: example?.followUp ?? "이 거래에 연결된 원본 자료를 확인해 주세요.",
    fields,
    duplicate: example?.duplicate ?? null,
    fingerprint: example?.fingerprint ?? null,
    forensics: [
      { label: "파일 동일성", status: !hasEvidence ? "증빙 없음" : example.duplicate ? "재사용 신호 예시" : "검사 예시", detail: !hasEvidence ? "연결된 파일이 없어 비교할 수 없습니다." : example.duplicate ? `${example.duplicate}와 같은 파일 지문으로 설정된 예시입니다.` : "추가 동일성 신호를 설정하지 않은 예시입니다." },
      { label: "이미지 흔적", status: hasEvidence ? "검사 예시" : "증빙 없음", detail: hasEvidence ? "이미지 변형 분석은 연결 전입니다. 원본 이미지를 확인해 주세요." : "증빙을 등록하면 이미지 비교를 진행할 수 있습니다." },
      { label: "생성·수정 이력", status: hasEvidence ? "검사 예시" : "증빙 없음", detail: hasEvidence ? "실제 메타데이터를 추출하지 않은 화면 예시입니다." : "파일 생성·수정 이력을 확인할 증빙이 없습니다." },
    ],
  };
}
