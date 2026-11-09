import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenarios, buildRiskMatrix, getAuditRows } from '../src/audit-data.js';
import { departments } from '../src/departments.js';

test('all matrix cells reconcile with unique review transactions', () => {
  for (const category of ['all', 'rules', 'compare', 'forgery', 'discover']) {
    const matrix = buildRiskMatrix(departments, category);
    const rows = getAuditRows(departments, null, category);
    assert.equal(matrix.total, rows.length);
    assert.equal(matrix.departments.length, 6);
    assert.equal(matrix.cells.length, matrix.departments.length * matrix.scenarios.length);
    for (const cell of matrix.cells) {
      assert.equal(cell.count, getAuditRows(departments, cell.departmentId, category, {scenarioId:cell.scenarioId}).length);
    }
  }
});

test('top eight ranks by matching signal counts and retains empty departments', () => {
  const source = Array.from({length:10}, (_, i) => ({id:`d${i}`,exampleTransactions:Array.from({length:i}, (_, n) => ({id:`${i}-${n}`, date:'2026.03.20',level:'보통', type:'휴일 사용'}))}));
  const matrix = buildRiskMatrix(source);
  assert.equal(matrix.departments.length, 8);
  assert.deepEqual(matrix.departments.map(x => x.id), ['d9','d8','d7','d6','d5','d4','d3','d2']);
  assert.ok(buildRiskMatrix(departments).departments.some(x => x.anomalies === 0));
});

test('date and scenario selections constrain both queue and matrix', () => {
  const dates = {fromDate:'2026.03.20', toDate:'2026.03.20'};
  assert.equal(buildRiskMatrix(departments, 'all', dates).total, getAuditRows(departments, null, 'all', dates).length);
  assert.deepEqual(getAuditRows(departments, 'operations', 'all', {...dates, scenarioId:'amount'}).map(x=>x.id), ['OP-0064']);
  assert.equal(buildRiskMatrix(departments, 'all', {fromDate:'2026.04.01'}).total,0);
  assert.equal(getAuditRows(departments, null, 'all', {includeNormal:true}).length,16);
  assert.equal(auditScenarios.length,7);
});
