import { createDigitValidator } from './digits.js';
import type { Base } from './digits.js';

/**
 * Проверяет, является ли попытка корректной для текущих настроек.
 *
 * Попытка валидна, если в ней ровно `length` символов, каждый символ —
 * допустимая цифра системы `base` и цифры не повторяются. Регистр не важен:
 * `A` и `a` считаются одной цифрой. Ведущий ноль допустим, поэтому `0123`
 * в десятичной системе — корректная попытка длины 4.
 *
 * @param guess - введённая строка
 * @param length - требуемая длина секрета
 * @param base - система счисления
 * @returns `true`, если попытку можно сравнивать с секретом
 *
 * @example
 * isValidGuess('0123', 4, 10); // true
 * isValidGuess('1123', 4, 10); // false
 * isValidGuess('ABCD', 4, 16); // true
 */
export const isValidGuess = (guess: string, length: number, base: Base): boolean => {
  const digits = [...guess.toLowerCase()];
  const isDigit = createDigitValidator(base);

  return (
    digits.length === length && digits.every(isDigit) && new Set(digits).size === digits.length
  );
};
