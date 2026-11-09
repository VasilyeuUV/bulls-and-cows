/**
 * Тесты генерации секрета.
 *
 * Проверяют контракт `generateSecret`: длина, уникальность и допустимость
 * цифр, инъекцию источника случайности, детерминированность при фиксированном
 * `random` и отказ на невозможных настройках.
 */

import { createDigitValidator } from '../../src/core/digits.js';
import type { Base } from '../../src/core/digits.js';
import { generateSecret } from '../../src/core/secret.js';

const combos: [number, Base][] = [
  [2, 2],
  [2, 8],
  [6, 8],
  [2, 10],
  [6, 10],
  [2, 16],
  [6, 16],
];

describe('generateSecret', () => {
  it.each(combos)('returns %s unique digits in base %s', (length, base) => {
    const secret = generateSecret(length, base, () => 0.5);
    const digits = [...secret];

    expect(secret).toHaveLength(length);
    expect(new Set(digits).size).toBe(length);
    expect(digits.every(createDigitValidator(base))).toBe(true);
    expect(secret).toBe(secret.toLowerCase());
  });

  it('picks digits sequentially when random is constant zero', () => {
    expect(generateSecret(4, 10, () => 0)).toBe('0123');
    expect(generateSecret(2, 2, () => 0)).toBe('01');
    expect(generateSecret(4, 16, () => 0)).toBe('0123');
  });

  it('picks the last available digit when random approaches one', () => {
    expect(generateSecret(4, 10, () => 0.999999)).toBe('9876');
    expect(generateSecret(4, 16, () => 0.999999)).toBe('fedc');
  });

  it('is deterministic for the same random source', () => {
    expect(generateSecret(6, 16, () => 0.42)).toBe(generateSecret(6, 16, () => 0.42));
  });

  it('uses the provided random source', () => {
    const random = jest.fn(() => 0);

    generateSecret(4, 10, random);

    expect(random).toHaveBeenCalled();
  });

  it('does not touch Math.random when a random source is provided', () => {
    const spy = jest.spyOn(Math, 'random');

    generateSecret(4, 10, () => 0);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('falls back to Math.random by default', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0);

    const secret = generateSecret(4, 10);

    expect(spy).toHaveBeenCalled();
    expect(secret).toHaveLength(4);
    spy.mockRestore();
  });

  it('rejects a length greater than the alphabet size', () => {
    expect(() => generateSecret(3, 2)).toThrow(RangeError);
  });

  it('rejects a non-positive length', () => {
    expect(() => generateSecret(0, 10)).toThrow(RangeError);
  });
});
