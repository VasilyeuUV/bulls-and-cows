/**
 * Тесты иммутабельного состояния раунда.
 *
 * Проверяют контракт `createGame` и `applyGuess`: начальное состояние,
 * добавление попытки без мутации предыдущего состояния, подсчёт bulls/cows,
 * обработку повторов, фиксацию победы и игнорирование попыток после неё.
 */

import { applyGuess, createGame, hasGuess, isWon } from '../../src/core/state.js';
import type { Settings } from '../../src/core/state.js';

const decSettings: Settings = { length: 4, base: 10 };
const hexSettings: Settings = { length: 4, base: 16 };

describe('createGame', () => {
  it('creates an empty game with the given start time', () => {
    const state = createGame(decSettings, '1234', 1000);

    expect(state).toEqual({
      settings: { length: 4, base: 10 },
      secret: '1234',
      history: [],
      startedAt: 1000,
      finishedAt: null,
    });
  });

  it('normalizes the secret to lower case', () => {
    expect(createGame(hexSettings, 'ABCD', 1000).secret).toBe('abcd');
  });

  it('gives each game its own history array', () => {
    const first = createGame(decSettings, '1234', 1000);
    const second = createGame(decSettings, '5678', 1000);

    expect(first.history).not.toBe(second.history);
  });
});

describe('applyGuess', () => {
  it('appends an entry with bulls, cows and timestamp', () => {
    const state = applyGuess(createGame(decSettings, '1234', 1000), '1243', 2000);

    expect(state.history).toEqual([{ guess: '1243', bulls: 2, cows: 2, at: 2000 }]);
  });

  it('does not mutate the previous state', () => {
    const initial = createGame(decSettings, '1234', 1000);

    applyGuess(initial, '5678', 2000);

    expect(initial.history).toHaveLength(0);
    expect(initial.finishedAt).toBeNull();
  });

  it('returns a new state object with a new history array', () => {
    const initial = createGame(decSettings, '1234', 1000);
    const next = applyGuess(initial, '5678', 2000);

    expect(next).not.toBe(initial);
    expect(next.history).not.toBe(initial.history);
  });

  it('keeps entries in the order they were made', () => {
    const first = applyGuess(createGame(decSettings, '1234', 1000), '5678', 2000);
    const second = applyGuess(first, '1243', 3000);

    expect(second.history.map((entry) => entry.guess)).toEqual(['5678', '1243']);
  });

  it('ignores a repeated guess and does not add a second entry', () => {
    const first = applyGuess(createGame(decSettings, '1234', 1000), '5678', 2000);
    const second = applyGuess(first, '5678', 3000);

    expect(second).toBe(first);
    expect(second.history).toHaveLength(1);
  });

  it('treats guesses case-insensitively when looking for duplicates', () => {
    const first = applyGuess(createGame(hexSettings, 'abcd', 1000), 'ABCD', 2000);
    const second = applyGuess(first, 'abcd', 3000);

    expect(first.history[0].guess).toBe('abcd');
    expect(second).toBe(first);
  });

  it('finishes the game on a winning guess', () => {
    const state = applyGuess(createGame(decSettings, '1234', 1000), '1234', 2500);

    expect(state.finishedAt).toBe(2500);
    expect(isWon(state)).toBe(true);
  });

  it('ignores guesses after the game is finished', () => {
    const won = applyGuess(createGame(decSettings, '1234', 1000), '1234', 2500);
    const after = applyGuess(won, '5678', 3000);

    expect(after).toBe(won);
    expect(after.history).toHaveLength(1);
  });
});

describe('isWon', () => {
  it('is false for a new game', () => {
    expect(isWon(createGame(decSettings, '1234', 1000))).toBe(false);
  });

  it('is false while the secret is not guessed', () => {
    const state = applyGuess(createGame(decSettings, '1234', 1000), '1235', 2000);

    expect(isWon(state)).toBe(false);
  });

  it('is true after a full match', () => {
    const state = applyGuess(createGame(decSettings, '1234', 1000), '1234', 2000);

    expect(isWon(state)).toBe(true);
  });
});

describe('hasGuess', () => {
  it('is false for a guess that was not tried', () => {
    expect(hasGuess(createGame(decSettings, '1234', 1000), '5678')).toBe(false);
  });

  it('is true for a tried guess regardless of case', () => {
    const state = applyGuess(createGame(hexSettings, 'abcd', 1000), 'ABCD', 2000);

    expect(hasGuess(state, 'abcd')).toBe(true);
    expect(hasGuess(state, 'AbCd')).toBe(true);
  });
});
