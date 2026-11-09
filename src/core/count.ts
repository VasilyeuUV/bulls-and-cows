import { memoize } from './memoize.js';

/**
 * Рекурсивно считает число размещений без повторений.
 *
 * Использует соотношение P(base, length) = base * P(base - 1, length - 1):
 * на первую позицию можно поставить любую из `base` цифр, на остальные —
 * любую из оставшихся. Базовые случаи: пустой секрет — один вариант,
 * длина больше алфавита — ноль вариантов.
 *
 * @param length - длина секрета
 * @param base - размер алфавита
 * @returns количество различных секретов
 */
const countArrangements = (length: number, base: number): number => {
  if (length === 0) {
    return 1;
  }

  if (length > base) {
    return 0;
  }

  return base * countPossibleSecrets(length - 1, base - 1);
};

/**
 * Считает, сколько различных секретов существует при данных длине и системе.
 *
 * Результат мемоизирован: повторные вызовы с теми же аргументами не
 * пересчитывают значение. Это важно, потому что функция вызывается при
 * каждом открытии экрана настроек.
 *
 * @param length - длина секрета
 * @param base - система счисления
 * @returns количество различных секретов
 *
 * @example
 * countPossibleSecrets(4, 10); // 5040
 * countPossibleSecrets(6, 16); // 5765760
 */
export const countPossibleSecrets = memoize(countArrangements);
