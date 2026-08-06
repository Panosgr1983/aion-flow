/**
 * FAQ sync diff — pure logic, zero dependencies.
 * Computes the explicit operations needed to reconcile the current DB state
 * with the user-edited entries. Deletion is ALWAYS by explicit id (never by
 * positional slice), so a load failure / empty local state can never silently
 * wipe existing rows.
 */

export type FaqRow = { id: string; question: string; answer: string; sort_order: number };
export type FaqEntry = { id?: string; question: string; answer: string };

export type FaqDiff = {
  /** Existing rows the user explicitly removed (ids present in DB, absent in entries) */
  idsToDelete: string[];
  /** Entries that map to existing rows — update by id, preserving ids */
  toUpdate: { id: string; question: string; answer: string; sort_order: number }[];
  /** Entries without an id (or id not in DB) — insert */
  toInsert: { question: string; answer: string; sort_order: number }[];
};

export function computeFaqDiff(existing: FaqRow[], entries: FaqEntry[]): FaqDiff {
  const existingIds = existing.map(e => e.id);
  const entryIds = new Set(entries.map(e => e.id).filter((id): id is string => !!id));

  const idsToDelete = existingIds.filter(id => !entryIds.has(id));

  const toUpdate: FaqDiff['toUpdate'] = [];
  const toInsert: FaqDiff['toInsert'] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.id && existingIds.includes(entry.id)) {
      toUpdate.push({ id: entry.id, question: entry.question, answer: entry.answer, sort_order: i });
    } else {
      toInsert.push({ question: entry.question, answer: entry.answer, sort_order: i });
    }
  }

  return { idsToDelete, toUpdate, toInsert };
}
