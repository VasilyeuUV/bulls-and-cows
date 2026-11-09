import type { Base } from './digits.js';
import { evaluateGuess } from './evaluate.js';

/** Настройки раунда. */
export interface Settings {
  readonly length: number;
  readonly base: Base;
}

/** Одна попытка игрока и результат её сравнения с секретом. */
export interface GuessEntry {
  readonly guess: string;
  readonly bulls: number;
  readonly cows: number;
  readonly at: number;
}

/** Состояние раунда. */
export interface GameState {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly startedAt: number;
  readonly finishedAt: number | null;
}

/**
 * Создаёт новое состояние раунда.
 *
 * Секрет приводится к нижнему регистру, история пуста, время окончания
 * не задано. Настройки копируются, чтобы состояние не зависело от объекта,
 * переданного вызывающим кодом.
 *
 * @param settings - длина и система счисления
 * @param secret - секретное число
 * @param startedAt - метка начала раунда
 * @returns начальное состояние
 */
export const createGame = (settings: Settings, secret: string, startedAt: number): GameState => ({
  settings: { ...settings },
  secret: secret.toLowerCase(),
  history: [],
  startedAt,
  finishedAt: null,
});

/**
 * Проверяет, была ли такая попытка уже сделана.
 *
 * Сравнение регистронезависимое: `A` и `a` — одна и та же цифра.
 *
 * @param state - текущее состояние
 * @param guess - проверяемая попытка
 * @returns `true`, если попытка уже есть в истории
 */
export const hasGuess = (state: GameState, guess: string): boolean =>
  state.history.some((entry) => entry.guess === guess.toLowerCase());

/**
 * Проверяет, угадан ли секрет.
 *
 * @param state - текущее состояние
 * @returns `true`, если в истории есть попытка с `bulls === length`
 */
export const isWon = (state: GameState): boolean =>
  state.history.some((entry) => entry.bulls === state.settings.length);

/**
 * Добавляет попытку к состоянию и возвращает новое состояние.
 *
 * Функция чистая: исходное состояние не меняется, история пополняется
 * новым массивом. Повторная попытка и попытка после окончания игры
 * игнорируются — возвращается тот же объект состояния, поэтому вызывающий
 * код может сравнить ссылки. Победа фиксируется в `finishedAt`.
 *
 * @param state - текущее состояние
 * @param guess - валидная попытка игрока
 * @param at - метка времени попытки
 * @returns новое состояние либо исходное, если попытка не принята
 */
export const applyGuess = (state: GameState, guess: string, at: number): GameState => {
  if (state.finishedAt !== null || hasGuess(state, guess)) {
    return state;
  }

  const normalized = guess.toLowerCase();
  const { bulls, cows } = evaluateGuess(state.secret, normalized);

  return {
    ...state,
    history: [...state.history, { guess: normalized, bulls, cows, at }],
    finishedAt: bulls === state.settings.length ? at : null,
  };
};
