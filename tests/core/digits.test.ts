/**
 * Тесты фабрики валидаторов цифр.
 *
 * Проверяют контракт `createDigitValidator`: алфавиты четырёх систем счисления,
 * регистронезависимость hex, отказ на некорректном вводе и независимость
 * валидаторов друг от друга.
 */

import { createDigitValidator } from '../../src/core/digits.js';
import type { Base } from '../../src/core/digits.js';

const validCases: [string, Base][] = [
  ['0', 2],
  ['1', 2],
  ['7', 8],
  ['9', 10],
  ['9', 16],
  ['a', 16],
  ['f', 16],
  ['A', 16],
  ['F', 16],
];

const invalidCases: [string, Base][] = [
  ['2', 2],
  ['a', 2],
  ['8', 8],
  ['a', 8],
  ['a', 10],
  ['A', 10],
  ['-', 10],
  ['g', 16],
  ['G', 16],
];

describe('createDigitValidator', () => {
  it('returns a predicate function', () => {
    expect(typeof createDigitValidator(10)).toBe('function');
  });

  it.each(validCases)('accepts "%s" in base %s', (char, base) => {
    expect(createDigitValidator(base)(char)).toBe(true);
  });

  it.each(invalidCases)('rejects "%s" in base %s', (char, base) => {
    expect(createDigitValidator(base)(char)).toBe(false);
  });

  it.each(['', '12', ' ', '-1'])('rejects malformed input %p', (char) => {
    expect(createDigitValidator(10)(char)).toBe(false);
  });

  it('keeps validators for different bases independent', () => {
    const binary = createDigitValidator(2);
    const hex = createDigitValidator(16);

    expect(binary('a')).toBe(false);
    expect(hex('a')).toBe(true);
  });

  it('is deterministic for repeated calls', () => {
    const isValid = createDigitValidator(16);

    expect(isValid('b')).toBe(true);
    expect(isValid('b')).toBe(true);
  });
});
