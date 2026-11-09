import test from 'node:test';
import assert from 'node:assert/strict';
import { auditScenarios, getDepartmentSignals, getScenarioSignals, getAuditRows } from '../src/audit-data.js';
import { departments } from '../src/departments.js';

const total = (items) => items.reduce((sum, item) => sum + item.anomalies, 0);

test('department overview and its scenario drilldowns reconcile with the review queue', () => {
  for (const category of ['all', 'rules', 'compare', 'forgery', 'discover']) {
    const overview = getDepartmentSignals(departments, category);
    assert.equal(overview.length, 6);
    assert.equal(total(overview), getAuditRows(departments, null, category).length);
    for (const department of overview) {
      const scenarios = getScenarioSignals(departments, department.id, category);
      assert.equal(total(scenarios), department.anomalies, department.id);
      for (const scenario of scenarios) {
        assert.equal(scenario.name, scenario.title);
        assert.equal(scenario.anomalies, getAuditRows(departments, department.id, category, {scenarioId:scenario.id}).length);
      }
    }
  }
});

test('selecting one scenario leaves sibling counts available in the department scene', () => {
  const before = getScenarioSignals(departments, 'sales');
  assert.equal(before.length, 7);
  assert.deepEqual(before.filter(item => item.anomalies > 0).map(item => item.id), ['holiday', 'split', 'missing']);
  assert.deepEqual(getAuditRows(departments, 'sales', 'all', {scenarioId:'holiday'}).map(item => item.id), ['SL-0241']);
  assert.deepEqual(getScenarioSignals(departments, 'sales', 'all', {scenarioId:'holiday'}), before);
});

test('an organization-wide scenario filter reconciles department counts with its queue', () => {
  const options = {scenarioId:'missing', fromDate:'2026.03.01', toDate:'2026.03.31'};
  const overview = getDepartmentSignals(departments, 'all', options);
  assert.equal(total(overview), getAuditRows(departments, null, 'all', options).length);
  assert.deepEqual(overview.filter(item => item.anomalies > 0).map(item => item.id), ['sales','finance']);
  for (const department of overview) assert.equal(department.anomalies, getAuditRows(departments, department.id, 'all', options).length);
});

test('top eight ranks by matching signals, keeps tie order, and preserves source totals', () => {
  const source = Array.from({length:10}, (_, i) => ({id:`d${i}`,exampleTransactions:Array.from({length:i}, (_, n) => ({id:`${i}-${n}`, date:'2026.03.20',level:'보통', type:'휴일 사용'}))}));
  const ranked = getDepartmentSignals(source);
  assert.equal(ranked.length, 8);
  assert.deepEqual(ranked.map(x => x.id), ['d9','d8','d7','d6','d5','d4','d3','d2']);
  assert.deepEqual(getDepartmentSignals(departments).map(item => item.id), ['sales', 'finance', 'marketing', 'operations', 'people', 'engineering']);
  assert.equal(departments[0].anomalies, 14);
  assert.ok(getDepartmentSignals(departments).some(item => item.anomalies === 0));
});

test('category and date constraints apply to both levels, including all-zero departments', () => {
  const dates = {fromDate:'2026.03.20', toDate:'2026.03.20'};
  const overview = getDepartmentSignals(departments, 'all', dates);
  assert.equal(total(overview), getAuditRows(departments, null, 'all', dates).length);
  for (const department of overview) assert.equal(total(getScenarioSignals(departments, department.id, 'all', dates)), department.anomalies);
  assert.deepEqual(getScenarioSignals(departments, 'operations', 'compare', dates).filter(item => item.anomalies > 0).map(item => item.id), ['amount']);
  assert.deepEqual(getAuditRows(departments, 'operations', 'compare', {...dates, scenarioId:'amount'}).map(item => item.id), ['OP-0064']);
  const emptyDates = {fromDate:'2026.04.01'};
  assert.equal(total(getDepartmentSignals(departments, 'all', emptyDates)),0);
  assert.equal(getScenarioSignals(departments, 'engineering').length,7);
  assert.equal(total(getScenarioSignals(departments, 'engineering')),0);
  assert.equal(getAuditRows(departments, null, 'all', {includeNormal:true}).length,16);
  assert.equal(auditScenarios.length,7);
});
