import { DIGITS } from './digits.js';
import type { Base } from './digits.js';

/**
 * Рекурсивно выбирает `count` цифр из пула, удаляя уже выбранные.
 *
 * @param pool - доступные цифры
 * @param count - сколько цифр осталось выбрать
 * @param random - источник случайности в диапазоне [0, 1)
 * @returns строка выбранных цифр в порядке выбора
 */
const pickDigits = (pool: string, count: number, random: () => number): string => {
  if (count === 0) {
    return '';
  }

  const index = Math.floor(random() * pool.length);
  const digit = pool.charAt(index);
  const rest = pool.slice(0, index) + pool.slice(index + 1);

  return digit + pickDigits(rest, count - 1, random);
};

/**
 * Генерирует секретное число — строку из уникальных цифр заданной системы.
 *
 * Цифры выбираются последовательно: на каждом шаге индекс считается как
 * `Math.floor(random() * pool.length)`, выбранная цифра удаляется из пула,
 * поэтому повторов быть не может. Ведущий ноль допустим: `0123` — корректный
 * секрет длины 4 в десятичной системе.
 *
 * Источник случайности передаётся параметром, чтобы генерацию можно было
 * протестировать с детерминированным `random`. По умолчанию используется
 * `Math.random`.
 *
 * @param length - количество цифр в секрете
 * @param base - система счисления
 * @param random - источник случайности в диапазоне [0, 1)
 * @returns секрет в виде строки цифр
 * @throws {RangeError} если длина нецелая, меньше 1 или больше размера алфавита
 *
 * @example
 * generateSecret(4, 10, () => 0);        // '0123'
 * generateSecret(4, 16, () => 0.999999); // 'fedc'
 */
export const generateSecret = (
  length: number,
  base: Base,
  random: () => number = Math.random,
): string => {
  const alphabet = DIGITS[base];

  if (!Number.isInteger(length) || length < 1 || length > alphabet.length) {
    throw new RangeError(`Cannot generate ${length} digits in base ${base}`);
  }

  return pickDigits(alphabet, length, random);
};
