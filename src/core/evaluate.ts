/**
 * Сравнивает попытку с секретом и считает bulls и cows.
 *
 * Bull — цифра угадана и стоит на своём месте. Cow — цифра есть в секрете,
 * но стоит на другом месте. Сравнение регистронезависимо: `A` и `a` — одна
 * цифра, поэтому обе строки приводятся к нижнему регистру.
 *
 * Ожидается, что цифры в секрете и попытке не повторяются — это гарантирует
 * `isValidGuess`. При повторах результат не определён.
 *
 * @param secret - секретное число в виде строки цифр
 * @param guess - проверенная попытка игрока
 * @returns количество bulls и cows
 *
 * @example
 * evaluateGuess('1234', '1243'); // { bulls: 2, cows: 2 }
 * evaluateGuess('1234', '4321'); // { bulls: 0, cows: 4 }
 * evaluateGuess('1234', '5678'); // { bulls: 0, cows: 0 }
 */
export const evaluateGuess = (secret: string, guess: string): { bulls: number; cows: number } => {
  const secretDigits = [...secret.toLowerCase()];
  const guessDigits = [...guess.toLowerCase()];

  const bulls = guessDigits.filter((digit, index) => digit === secretDigits[index]).length;
  const cows = guessDigits.filter(
    (digit, index) => digit !== secretDigits[index] && secretDigits.includes(digit),
  ).length;

  return { bulls, cows };
};
