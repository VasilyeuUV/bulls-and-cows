import { isRecordEntry } from './records.js';
import type { RecordEntry } from './records.js';

/** Ключ, под которым таблица рекордов хранится в `localStorage`. */
export const RECORDS_KEY = 'bulls-and-cows:records:v1';

/** Минимальный интерфейс хранилища — подмножество `Storage`. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Читает таблицу рекордов.
 *
 * Любые проблемы с данными — отсутствие ключа, повреждённый JSON, значение
 * не массивом или невалидные элементы — приводят к пустой таблице.
 *
 * @param storage - хранилище; в тестах фейк, в приложении `localStorage`
 * @returns массив валидных рекордов
 */
export const loadRecords = (storage: StorageLike): RecordEntry[] => {
  const raw = storage.getItem(RECORDS_KEY);

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed.filter(isRecordEntry) : [];
  } catch {
    return [];
  }
};

/**
 * Сохраняет таблицу рекордов.
 *
 * @param storage - хранилище
 * @param records - рекорды для сохранения
 */
export const saveRecords = (storage: StorageLike, records: readonly RecordEntry[]): void => {
  storage.setItem(RECORDS_KEY, JSON.stringify(records));
};
