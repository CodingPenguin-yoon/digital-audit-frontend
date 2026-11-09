import test from 'node:test';
import assert from 'node:assert/strict';
import { departments } from '../src/departments.js';
import { getReviewEvidence } from '../src/review-data.js';

const records = departments.flatMap((department) => department.exampleTransactions);
const recordById = (id) => records.find((record) => record.id === id);

test('each transaction keeps its own identity and example evidence', () => {
  assert.equal(records.length, 16);
  for (const record of records) {
    const evidence = getReviewEvidence(record);
    assert.notEqual(evidence.account, '자료 미등록', record.id);
    assert.ok(evidence.criterion.length > 0, record.id);
    assert.ok(evidence.followUp.length > 0, record.id);
    assert.equal(evidence.fields.find((field) => field.label === '결제 일자').recorded, record.date);
    assert.equal(evidence.fields.find((field) => field.label === '가맹점').recorded, record.shop);
    assert.equal(evidence.fields.find((field) => field.label === '결제 금액').recorded, `${record.amount}원`);
    if (evidence.file) assert.ok(evidence.file.startsWith(record.id), record.id);
  }
});

test('missing files produce unavailable comparisons and forensic checks', () => {
  const missing = records.filter((record) => record.type === '증빙 누락');
  assert.deepEqual(missing.map((record) => record.id), ['SL-0235', 'FN-0106']);
  for (const record of missing) {
    const evidence = getReviewEvidence(record);
    assert.equal(evidence.file, null);
    assert.ok(evidence.fields.every((field) => field.evidence === '미등록' && field.status === '증빙 없음'));
    assert.ok(evidence.forensics.every((item) => item.status === '증빙 없음'));
    assert.equal(evidence.duplicate, null);
    assert.equal(evidence.fingerprint, null);
  }
});

test('the amount mismatch belongs only to the operations transaction', () => {
  const transaction = recordById('OP-0064');
  const evidence = getReviewEvidence(transaction);
  const amount = evidence.fields.find((field) => field.label === '결제 금액');
  assert.equal(amount.recorded, '198,000원');
  assert.equal(amount.evidence, '189,000원');
  assert.equal(amount.status, '불일치');
  assert.equal(evidence.fields.filter((field) => field.status === '불일치').length, 1);
  const sales = getReviewEvidence(recordById('SL-0238'));
  assert.equal(sales.fields.find((field) => field.label === '결제 금액').status, '일치');
  assert.ok(records.filter((record) => record.id !== transaction.id).every((record) =>
    getReviewEvidence(record).fields.every((field) => field.status !== '불일치')));
});

test('duplicate evidence associates the correct finance records without inventing a queue entry', () => {
  const evidence = getReviewEvidence(recordById('FN-0118'));
  assert.equal(evidence.duplicate, 'FN-0112');
  assert.equal(evidence.fingerprint, 'e91a…8f40');
  assert.equal(evidence.forensics[0].status, '재사용 신호 예시');
  assert.match(evidence.forensics[0].detail, /FN-0112/);
  assert.equal(recordById(evidence.duplicate), undefined);
  assert.ok(records.filter((record) => record.id !== 'FN-0118').every((record) => getReviewEvidence(record).duplicate === null));
});

test('no detected signal remains distinct from an auditor verdict or a real forensic result', () => {
  const normal = records.filter((record) => record.level === '정상');
  assert.equal(normal.length, 8);
  for (const record of normal) {
    const evidence = getReviewEvidence(record);
    assert.equal(record.type, '해당 없음');
    assert.ok(evidence.fields.every((field) => field.status === '일치'), record.id);
    assert.equal(evidence.duplicate, null);
    assert.ok(evidence.forensics.every((item) => item.status === '검사 예시'), record.id);
    assert.equal(Object.hasOwn(evidence, 'verdict'), false);
  }
});

test('an unregistered transaction cannot receive fabricated matching evidence', () => {
  const evidence = getReviewEvidence({ ...records[0], id: 'UNKNOWN' });
  assert.equal(evidence.file, null);
  assert.equal(evidence.account, '자료 미등록');
  assert.ok(evidence.fields.every((field) => field.status === '증빙 없음'));
  assert.ok(evidence.forensics.every((item) => item.status === '증빙 없음'));
});
