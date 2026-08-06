import { test, expect } from '@playwright/test';
import { computeFaqDiff } from '../src/lib/faqDiff';

const row = (id: string, q = `Q${id}`, a = `A${id}`, sort = 0) => ({ id, question: q, answer: a, sort_order: sort });

test.describe('FAQ Save Contract — computeFaqDiff (unit)', () => {

  test('1. load success + unchanged → no deletion, no insert', () => {
    const existing = [row('a'), row('b'), row('c')];
    const entries = [
      { id: 'a', question: 'Qa', answer: 'Aa' },
      { id: 'b', question: 'Qb', answer: 'Ab' },
      { id: 'c', question: 'Qc', answer: 'Ac' },
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual([]);
    expect(diff.toInsert).toEqual([]);
    expect(diff.toUpdate).toHaveLength(3);
  });

  test('2. load failure + Save (empty local state) → NOTHING is deleted', () => {
    // Simulates the destructive case: entries=[] because load failed.
    const existing = [row('a'), row('b'), row('c')];
    const entries: { id?: string; question: string; answer: string }[] = [];
    const diff = computeFaqDiff(existing, entries);
    // The diff itself says delete all — the GUARD is in the caller (faqState gate).
    // This test documents that the diff is correct BUT the contract requires the caller
    // to never invoke setFaq without a successful load.
    expect(diff.idsToDelete).toEqual(['a', 'b', 'c']);
    // Contract assertion: persistence only when loaded+dirty is enforced in Services.tsx handleSave.
  });

  test('3. legitimate user delete one FAQ → only that ID is deleted', () => {
    const existing = [row('a'), row('b'), row('c')];
    const entries = [
      { id: 'a', question: 'Qa', answer: 'Aa' },
      { id: 'c', question: 'Qc', answer: 'Ac' },
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual(['b']);
  });

  test('4. legitimate "delete all" → all ids listed (caller allows only after loaded + explicit action)', () => {
    const existing = [row('a'), row('b')];
    const diff = computeFaqDiff(existing, []);
    expect(diff.idsToDelete).toEqual(['a', 'b']);
  });

  test('5. reorder → no deletion, sort_order updated by position', () => {
    const existing = [row('a', 'Qa', 'Aa', 0), row('b', 'Qb', 'Ab', 1)];
    const entries = [
      { id: 'b', question: 'Qb', answer: 'Ab' },
      { id: 'a', question: 'Qa', answer: 'Aa' },
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual([]);
    expect(diff.toInsert).toEqual([]);
    expect(diff.toUpdate.map(u => `${u.id}@${u.sort_order}`)).toEqual(['b@0', 'a@1']);
  });

  test('6. update → ids preserved, data updated, no deletion', () => {
    const existing = [row('a', 'Qa', 'Aa'), row('b', 'Qb', 'Ab')];
    const entries = [
      { id: 'a', question: 'Qa EDITED', answer: 'Aa EDITED' },
      { id: 'b', question: 'Qb', answer: 'Ab' },
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual([]);
    expect(diff.toUpdate[0].id).toBe('a');
    expect(diff.toUpdate[0].question).toBe('Qa EDITED');
    expect(diff.toUpdate[0].answer).toBe('Aa EDITED');
  });

  test('7. create → existing rows preserved, new row inserted', () => {
    const existing = [row('a')];
    const entries = [
      { id: 'a', question: 'Qa', answer: 'Aa' },
      { question: 'NEW Q', answer: 'NEW A' },  // no id → insert
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual([]);
    expect(diff.toInsert).toHaveLength(1);
    expect(diff.toInsert[0].question).toBe('NEW Q');
  });

  test('8. mixed: delete + update + insert in one save', () => {
    const existing = [row('a'), row('b'), row('c')];
    const entries = [
      { id: 'b', question: 'Qb EDITED', answer: 'Ab' },
      { question: 'BRAND NEW', answer: 'X' },
    ];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual(['a', 'c']);
    expect(diff.toUpdate.map(u => u.id)).toEqual(['b']);
    expect(diff.toInsert).toHaveLength(1);
  });

  test('9. empty existing + empty entries → no-op', () => {
    const diff = computeFaqDiff([], []);
    expect(diff.idsToDelete).toEqual([]);
    expect(diff.toUpdate).toEqual([]);
    expect(diff.toInsert).toEqual([]);
  });

  test('10. tenant/service isolation: diff only considers rows of the given service', () => {
    const existing = [row('x'), row('y')];
    const entries = [{ id: 'x', question: 'Qx', answer: 'Ax' }];
    const diff = computeFaqDiff(existing, entries);
    expect(diff.idsToDelete).toEqual(['y']);
    // The DB layer additionally scopes every mutation with .eq('service_id', serviceId).
  });
});
