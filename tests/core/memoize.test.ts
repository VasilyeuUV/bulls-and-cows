/**
 * Тесты мемоизации.
 *
 * Проверяют контракт `memoize`: повторный вызов с теми же аргументами
 * не вызывает исходную функцию, разные аргументы кэшируются раздельно,
 * а кэши независимых функций не пересекаются.
 */

import { memoize } from '../../src/core/memoize.js';

describe('memoize', () => {
  it('calls the original function once for the same arguments', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn);

    expect(memoized(2, 3)).toBe(5);
    expect(memoized(2, 3)).toBe(5);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls the original function for different arguments', () => {
    const fn = jest.fn((a: number, b: number) => a * b);
    const memoized = memoize(fn);

    expect(memoized(2, 3)).toBe(6);
    expect(memoized(3, 2)).toBe(6);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('keeps caches of different functions separate', () => {
    const increment = jest.fn((value: number) => value + 1);
    const double = jest.fn((value: number) => value * 2);
    const memoizedIncrement = memoize(increment);
    const memoizedDouble = memoize(double);

    expect(memoizedIncrement(1)).toBe(2);
    expect(memoizedDouble(1)).toBe(2);
    expect(increment).toHaveBeenCalledTimes(1);
    expect(double).toHaveBeenCalledTimes(1);
  });
});
