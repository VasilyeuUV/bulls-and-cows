/** Системы счисления, поддерживаемые игрой. */
export type Base = 2 | 8 | 10 | 16;

/** Алфавиты цифр для каждой системы; hex — в нижнем регистре. */
const DIGITS: Record<Base, string> = {
  2: '01',
  8: '01234567',
  10: '0123456789',
  16: '0123456789abcdef',
};

/**
 * Создаёт предикат «символ — допустимая цифра в системе `base`.
 *
 * Фабрика каррирована: первый вызов фиксирует систему счисления, второй
 * проверяет ровно один символ. Для hex регистр не важен: сравнение идёт
 * в нижнем регистре.
 *
 * @param base - система счисления
 * @returns предикат для одного символа
 *
 * @example
 * const isHexDigit = createDigitValidator(16);
 * isHexDigit('a'); // true
 * isHexDigit('A'); // true
 * isHexDigit('g'); // false
 */
export const createDigitValidator =
  (base: Base) =>
  (char: string): boolean =>
    char.length === 1 && DIGITS[base].includes(char.toLowerCase());
