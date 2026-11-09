import type { Base } from './digits.js';

/** Максимальное количество хранимых рекордов. */
export const MAX_RECORDS = 10;

/** Один результат игры, попадающий в таблицу рекордов. */
export interface RecordEntry {
  readonly attempts: number;
  readonly timeMs: number;
  readonly date: string;
  readonly length: number;
  readonly base: Base;
}

/** Поддерживаемые системы счисления. */
const BASES: readonly Base[] = [2, 8, 10, 16];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isBase = (value: unknown): value is Base => BASES.includes(value as Base);

/**
 * Сравнивает два рекорда по правилам таблицы.
 *
 * Порядок: меньше попыток — выше; при равенстве — меньше время; при равенстве
 * обоих — раньше дата. Подходит для `Array.prototype.sort`.
 *
 * @param a - первый рекорд
 * @param b - второй рекорд
 * @returns отрицательное число, если `a` выше, положительное — если ниже
 */
export const compareRecords = (a: RecordEntry, b: RecordEntry): number => {
  if (a.attempts !== b.attempts) {
    return a.attempts - b.attempts;
  }

  if (a.timeMs !== b.timeMs) {
    return a.timeMs - b.timeMs;
  }

  return a.date.localeCompare(b.date);
};

/**
 * Сортирует рекорды, не меняя исходный массив.
 *
 * @param records - рекорды в произвольном порядке
 * @returns новый отсортированный массив
 */
export const sortRecords = (records: readonly RecordEntry[]): RecordEntry[] =>
  [...records].sort(compareRecords);

/**
 * Возвращает лучшие `limit` рекордов.
 *
 * @param records - рекорды в произвольном порядке
 * @param limit - сколько записей оставить
 * @returns новый массив лучших записей
 */
export const takeTop = (
  records: readonly RecordEntry[],
  limit: number = MAX_RECORDS,
): RecordEntry[] => sortRecords(records).slice(0, limit);

/**
 * Добавляет рекорд и оставляет только лучшие `limit` записей.
 *
 * @param records - текущая таблица
 * @param record - новый результат
 * @param limit - размер таблицы
 * @returns новая таблица
 */
export const addRecord = (
  records: readonly RecordEntry[],
  record: RecordEntry,
  limit: number = MAX_RECORDS,
): RecordEntry[] => takeTop([...records, record], limit);

/**
 * Проверяет, что значение является корректной записью рекорда.
 *
 * Используется при чтении `localStorage`: повреждённые или устаревшие данные
 * отбрасываются, а не роняют приложение.
 *
 * @param value - значение из JSON
 * @returns `true`, если значение можно использовать как рекорд
 */
export const isRecordEntry = (value: unknown): value is RecordEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    isFiniteNumber(entry.attempts) &&
    isFiniteNumber(entry.timeMs) &&
    typeof entry.date === 'string' &&
    !Number.isNaN(Date.parse(entry.date)) &&
    isFiniteNumber(entry.length) &&
    isBase(entry.base)
  );
};
