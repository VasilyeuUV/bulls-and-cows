/**
 * Тесты валидации попытки.
 *
 * Проверяют контракт `isValidGuess`: точная длина, допустимость каждого
 * символа для выбранной системы счисления и отсутствие повторов
 * (для hex — без учёта регистра).
 */

import type { Base } from '../../src/core/digits.js';
import { isValidGuess } from '../../src/core/validate.js';

const validCases: [string, number, Base][] = [
  ['0123', 4, 10],
  ['9876', 4, 10],
  ['1234', 4, 16],
  ['01', 2, 2],
  ['10', 2, 2],
  ['01234567', 8, 8],
  ['abcdef', 6, 16],
  ['ABCDEF', 6, 16],
  ['aBcD', 4, 16],
  ['012345', 6, 10],
];

const invalidCases: [string, number, Base][] = [
  ['012', 4, 10],
  ['01234', 4, 10],
  ['', 4, 10],
  ['0128', 4, 8],
  ['012a', 4, 10],
  ['1123', 4, 10],
  ['0102', 4, 10],
  ['1231', 4, 10],
  ['aAbB', 4, 16],
  ['00', 2, 2],
  ['-123', 4, 10],
  [' 123', 4, 10],
];

describe('isValidGuess', () => {
  it.each(validCases)('accepts %s (length %s, base %s)', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(true);
  });

  it.each(invalidCases)('rejects %s (length %s, base %s)', (guess, length, base) => {
    expect(isValidGuess(guess, length, base)).toBe(false);
  });

  it('accepts a guess that starts with zero', () => {
    expect(isValidGuess('0123', 4, 10)).toBe(true);
  });

  it('treats hex digits case-insensitively', () => {
    expect(isValidGuess('aBcD', 4, 16)).toBe(true);
    expect(isValidGuess('aA', 2, 16)).toBe(false);
  });
});
