/**
 * Тесты ранжирования рекордов.
 *
 * Проверяют контракт `sortRecords`, `takeTop`, `addRecord` и `isRecordEntry`:
 * порядок «попытки → время → дата», иммутабельность сортировки, ограничение
 * топ-N и валидацию записей, прочитанных из хранилища.
 */

import {
  MAX_RECORDS,
  addRecord,
  isRecordEntry,
  sortRecords,
  takeTop,
} from '../../src/core/records.js';
import type { RecordEntry } from '../../src/core/records.js';

const record = (overrides: Partial<RecordEntry> = {}): RecordEntry => ({
  attempts: 5,
  timeMs: 10000,
  date: '2026-11-09T00:00:00.000Z',
  length: 4,
  base: 10,
  ...overrides,
});

describe('sortRecords', () => {
  it('orders by attempts ascending', () => {
    const sorted: RecordEntry[] = sortRecords([
      record({ attempts: 8 }),
      record({ attempts: 3 }),
      record({ attempts: 5 }),
    ]);

    expect(sorted.map((entry) => entry.attempts)).toEqual([3, 5, 8]);
  });

  it('breaks a tie by time ascending', () => {
    const sorted: RecordEntry[] = sortRecords([record({ timeMs: 3000 }), record({ timeMs: 1000 })]);

    expect(sorted.map((entry) => entry.timeMs)).toEqual([1000, 3000]);
  });

  it('breaks a tie by date ascending', () => {
    const sorted: RecordEntry[] = sortRecords([
      record({ date: '2026-11-09T10:00:00.000Z' }),
      record({ date: '2026-11-09T08:00:00.000Z' }),
    ]);

    expect(sorted.map((entry) => entry.date)).toEqual([
      '2026-11-09T08:00:00.000Z',
      '2026-11-09T10:00:00.000Z',
    ]);
  });

  it('does not mutate the input array', () => {
    const records = [record({ attempts: 8 }), record({ attempts: 3 })];

    sortRecords(records);

    expect(records.map((entry) => entry.attempts)).toEqual([8, 3]);
  });
});

describe('takeTop', () => {
  it('returns the best entries up to the limit', () => {
    const records = [record({ attempts: 8 }), record({ attempts: 3 }), record({ attempts: 5 })];
    const top: RecordEntry[] = takeTop(records, 2);
    expect(top.map((entry) => entry.attempts)).toEqual([3, 5]);
  });

  it('returns all entries when there are fewer than the limit', () => {
    expect(takeTop([record()], 10)).toHaveLength(1);
  });
});

describe('addRecord', () => {
  it('inserts a record in the correct position', () => {
    const records = [record({ attempts: 5 }), record({ attempts: 8 })];
    const updated: RecordEntry[] = addRecord(records, record({ attempts: 3 }));

    expect(updated.map((entry) => entry.attempts)).toEqual([3, 5, 8]);
  });

  it('keeps only the best MAX_RECORDS entries', () => {
    const records = Array.from({ length: MAX_RECORDS }, (_, index) =>
      record({ attempts: index + 1 }),
    );
    const updated: RecordEntry[] = addRecord(records, record({ attempts: 100 }));

    expect(updated).toHaveLength(MAX_RECORDS);
    expect(updated.at(-1)?.attempts).toBe(MAX_RECORDS);
  });

  it('does not mutate the input array', () => {
    const records = [record({ attempts: 5 })];

    addRecord(records, record({ attempts: 3 }));

    expect(records).toHaveLength(1);
  });
});

describe('isRecordEntry', () => {
  it('accepts a valid record', () => {
    expect(isRecordEntry(record())).toBe(true);
  });

  it.each([null, undefined, 'record', 42, []])('rejects %p', (value) => {
    expect(isRecordEntry(value)).toBe(false);
  });

  it('rejects a record with a wrong base', () => {
    expect(isRecordEntry({ ...record(), base: 7 })).toBe(false);
  });

  it('rejects a record with a non-numeric field', () => {
    expect(isRecordEntry({ ...record(), attempts: '5' })).toBe(false);
  });

  it('rejects a record with an invalid date', () => {
    expect(isRecordEntry({ ...record(), date: 'not-a-date' })).toBe(false);
  });
});
