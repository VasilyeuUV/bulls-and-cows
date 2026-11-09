/**
 * Оборачивает функцию кэшем результатов.
 *
 * Ключ кэша — сериализованные аргументы. Для одинаковых аргументов
 * возвращается закэшированный результат, исходная функция повторно
 * не вызывается. Кэш у каждой обёртки свой, поэтому независимые функции
 * не влияют друг на друга.
 *
 * @param fn - чистая функция, результат которой нужно запомнить
 * @returns обёртка с тем же контрактом, что и `fn`
 *
 * @example
 * const square = memoize((n: number) => n * n);
 * square(4); // 16 — исходная функция вызвана
 * square(4); // 16 — значение взято из кэша
 */
export const memoize = <Args extends unknown[], Result>(
  fn: (...args: Args) => Result,
): ((...args: Args) => Result) => {
  const cache = new Map<string, Result>();

  return (...args: Args): Result => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as Result;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  };
};
