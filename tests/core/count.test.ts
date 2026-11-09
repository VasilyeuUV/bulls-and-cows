/**
 * Тесты подсчёта возможных секретов.
 *
 * Проверяют контракт `countPossibleSecrets`: формулу P(base, length),
 * краевые случаи (нулевая длина и длина больше алфавита) и рекуррентное
 * соотношение P(n, b) = b * P(n - 1, b - 1). Мемоизация проверяется
 * отдельно, в тестах `memoize`.
 */

import { countPossibleSecrets } from '../../src/core/count.js';

const cases: [number, number, number][] = [
  [0, 10, 1],
  [1, 10, 10],
  [2, 2, 2],
  [3, 8, 336],
  [4, 10, 5040],
  [6, 10, 151200],
  [2, 16, 240],
  [6, 16, 5765760],
  [10, 10, 3628800],
  [11, 10, 0],
];

describe('countPossibleSecrets', () => {
  it.each(cases)('length %s in base %s → %s', (length, base, expected) => {
    expect(countPossibleSecrets(length, base)).toBe(expected);
  });

  it('follows P(n, b) = b * P(n - 1, b - 1)', () => {
    expect(countPossibleSecrets(5, 12)).toBe(12 * countPossibleSecrets(4, 11));
  });
});
