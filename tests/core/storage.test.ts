/**
 * Тесты адаптера хранилища.
 *
 * Проверяют контракт `loadRecords` и `saveRecords` на фейковом хранилище:
 * отсутствие данных, повреждённый JSON, фильтрация невалидных записей
 * и сохранение под ожидаемым ключом.
 */

import { RECORDS_KEY, loadRecords, saveRecords } from '../../src/core/storage.js';
import type { StorageLike } from '../../src/core/storage.js';
import type { RecordEntry } from '../../src/core/records.js';

const memoryStorage = (): StorageLike => {
  const data = new Map<string, string>();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

const record: RecordEntry = {
  attempts: 5,
  timeMs: 10000,
  date: '2026-11-09T00:00:00.000Z',
  length: 4,
  base: 10,
};

describe('loadRecords', () => {
  it('returns an empty list when nothing was saved', () => {
    expect(loadRecords(memoryStorage())).toEqual([]);
  });

  it('returns an empty list for corrupted JSON', () => {
    const storage = memoryStorage();
    storage.setItem(RECORDS_KEY, '{oops');

    expect(loadRecords(storage)).toEqual([]);
  });

  it('returns an empty list when the value is not an array', () => {
    const storage = memoryStorage();
    storage.setItem(RECORDS_KEY, '{"attempts":5}');

    expect(loadRecords(storage)).toEqual([]);
  });

  it('reads saved records', () => {
    const storage = memoryStorage();
    storage.setItem(RECORDS_KEY, JSON.stringify([record]));

    expect(loadRecords(storage)).toEqual([record]);
  });

  it('drops invalid entries but keeps valid ones', () => {
    const storage = memoryStorage();
    storage.setItem(RECORDS_KEY, JSON.stringify([record, { attempts: 'five' }, null]));

    expect(loadRecords(storage)).toEqual([record]);
  });
});

describe('saveRecords', () => {
  it('writes records under the versioned key', () => {
    const storage = memoryStorage();
    const setItem = jest.spyOn(storage, 'setItem');

    saveRecords(storage, [record]);

    expect(setItem).toHaveBeenCalledWith(RECORDS_KEY, JSON.stringify([record]));
  });

  it('round-trips records through the storage', () => {
    const storage = memoryStorage();
    saveRecords(storage, [record]);

    expect(loadRecords(storage)).toEqual([record]);
  });
});
