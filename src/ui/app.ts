import { countPossibleSecrets } from '../core/count.js';
import { createDigitValidator } from '../core/digits.js';
import type { Base } from '../core/digits.js';
import { MAX_RECORDS, addRecord } from '../core/records.js';
import type { RecordEntry } from '../core/records.js';
import { generateSecret } from '../core/secret.js';
import { applyGuess, createGame, hasGuess, isWon } from '../core/state.js';
import type { GameState, Settings } from '../core/state.js';
import { loadRecords, saveRecords } from '../core/storage.js';
import type { StorageLike } from '../core/storage.js';
import { isValidGuess } from '../core/validate.js';
import { loadLanguage, saveLanguage, t } from '../i18n/index.js';
import type { Language } from '../i18n/index.js';
import { el, icon } from './dom.js';

/** Длины секрета, доступные в настройках. */
const LENGTHS = [2, 3, 4, 5, 6] as const;

/** Системы счисления в порядке отображения. */
const BASES = [2, 8, 10, 16] as const;

/** Короткие подписи систем счисления. */
const BASE_LABELS: Record<Base, string> = { 2: 'BIN', 8: 'OCT', 10: 'DEC', 16: 'HEX' };

/** Форматирует длительность в `мм:сс`. */
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/** Форматирует дату под выбранный язык. */
const formatDate = (iso: string, language: Language): string =>
  new Date(iso).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US');

/**
 * Создаёт приложение и монтирует его в переданный контейнер.
 *
 * Состояние хранится в замыкании: язык, таблица рекордов, текущий раунд
 * и черновик настроек. Любое изменение состояния приводит к перерисовке
 * экрана — разметка полностью генерируется кодом.
 *
 * @param root - контейнер, в который монтируется приложение
 * @param storage - хранилище; в браузере `localStorage`, в тестах можно подменить
 */
export const createApp = (root: HTMLElement, storage: StorageLike = localStorage): void => {
  let language = loadLanguage(storage);
  let records = loadRecords(storage);
  let game: GameState | null = null;
  let draft: Settings = { length: 4, base: 10 };
  let message: string | null = null;
  let timer: number | null = null;

  const container = el('div', { class: 'app' });
  root.append(container);

  const stopTimer = (): void => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const startTimer = (): void => {
    stopTimer();
    timer = window.setInterval(() => {
      const node = container.querySelector('[data-time]');

      if (node !== null && game !== null) {
        node.textContent = formatTime((game.finishedAt ?? Date.now()) - game.startedAt);
      }
    }, 500);
  };

  const saveResult = (finished: GameState): void => {
    stopTimer();

    const record: RecordEntry = {
      attempts: finished.history.length,
      timeMs: (finished.finishedAt ?? Date.now()) - finished.startedAt,
      date: new Date().toISOString(),
      length: finished.settings.length,
      base: finished.settings.base,
    };

    records = addRecord(records, record, MAX_RECORDS);
    saveRecords(storage, records);
  };

  const renderHeader = (): HTMLElement => {
    const toggle = el(
      'button',
      { class: 'lang-toggle', type: 'button', 'aria-label': t(language, 'common.language') },
      [language === 'en' ? 'RU' : 'EN'],
    );

    toggle.addEventListener('click', () => {
      language = language === 'en' ? 'ru' : 'en';
      saveLanguage(storage, language);
      render();
    });

    const exit = el(
      'button',
      {
        class: 'icon-button',
        type: 'button',
        'aria-label': t(language, 'game.exit'),
        title: t(language, 'game.exit'),
      },
      [icon(['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'])],
    );

    exit.addEventListener('click', () => {
      stopTimer();
      game = null;
      message = null;
      render();
    });

    const controls = el('div', { class: 'header-controls' }, [
      toggle,
      game !== null && game.finishedAt === null ? exit : null,
    ]);

    return el('header', { class: 'header' }, [
      el('h1', { class: 'title' }, [t(language, 'game.title')]),
      controls,
    ]);
  };

  const renderRecords = (): HTMLElement => {
    const heading = el('h2', { class: 'section-title' }, [t(language, 'records.title')]);

    if (records.length === 0) {
      return el('section', { class: 'records' }, [
        heading,
        el('p', { class: 'hint' }, [t(language, 'records.empty')]),
      ]);
    }

    const rows = records.map((record) =>
      el('tr', {}, [
        el('td', {}, [String(record.attempts)]),
        el('td', {}, [formatTime(record.timeMs)]),
        el('td', {}, [`${BASE_LABELS[record.base]} ${String(record.length)}`]),
        el('td', {}, [formatDate(record.date, language)]),
      ]),
    );

    return el('section', { class: 'records' }, [
      heading,
      el('table', { class: 'records-table' }, [
        el('thead', {}, [
          el('tr', {}, [
            el('th', {}, [t(language, 'records.attempts')]),
            el('th', {}, [t(language, 'records.time')]),
            el('th', {}, [t(language, 'records.settings')]),
            el('th', {}, [t(language, 'records.date')]),
          ]),
        ]),
        el('tbody', {}, rows),
      ]),
    ]);
  };

  const renderSettings = (): HTMLElement => {
    const baseSelect = el('select', { id: 'base', class: 'select' });

    BASES.forEach((base) => {
      baseSelect.append(
        el('option', { value: String(base) }, [`${BASE_LABELS[base]} (${String(base)})`]),
      );
    });

    baseSelect.value = String(draft.base);
    baseSelect.addEventListener('change', () => {
      const base = Number(baseSelect.value) as Base;
      draft = { base, length: Math.min(draft.length, base) };
      render();
    });

    const lengthSelect = el('select', { id: 'length', class: 'select' });

    LENGTHS.forEach((length) => {
      const option = el('option', { value: String(length) }, [String(length)]);

      if (length > draft.base) {
        option.disabled = true;
      }

      lengthSelect.append(option);
    });

    lengthSelect.value = String(draft.length);
    lengthSelect.addEventListener('change', () => {
      draft = { ...draft, length: Number(lengthSelect.value) };
      render();
    });

    const start = el('button', { class: 'primary', type: 'button' }, [
      t(language, 'settings.start'),
    ]);

    start.addEventListener('click', () => {
      const secret = generateSecret(draft.length, draft.base);
      game = createGame(draft, secret, Date.now());
      message = null;
      render();
      startTimer();
    });

    return el('section', { class: 'settings' }, [
      el('h2', { class: 'section-title' }, [t(language, 'settings.title')]),
      el('div', { class: 'field' }, [
        el('label', { for: 'length' }, [t(language, 'settings.length')]),
        lengthSelect,
      ]),
      el('div', { class: 'field' }, [
        el('label', { for: 'base' }, [t(language, 'settings.base')]),
        baseSelect,
      ]),
      el('p', { class: 'hint' }, [
        t(language, 'settings.possible', {
          count: countPossibleSecrets(draft.length, draft.base),
        }),
      ]),
      draft.base === 2 ? el('p', { class: 'hint' }, [t(language, 'settings.binaryHint')]) : null,
      start,
      renderRecords(),
    ]);
  };

  const renderGame = (current: GameState): HTMLElement => {
    const finished = current.finishedAt !== null;
    const timeText = formatTime((current.finishedAt ?? Date.now()) - current.startedAt);
    const time = el('span', { 'data-time': 'true' }, [timeText]);
    const attempts = el('span', {}, [String(current.history.length)]);

    const input = el('input', {
      class: 'guess-input',
      type: 'text',
      maxlength: String(current.settings.length),
      placeholder: t(language, 'game.guessPlaceholder', { length: current.settings.length }),
      autocomplete: 'off',
      spellcheck: 'false',
    });

    const isDigit = createDigitValidator(current.settings.base);

    input.addEventListener('input', () => {
      const filtered = [...input.value].filter(isDigit).join('');

      if (filtered !== input.value) {
        input.value = filtered;
      }
    });

    const submit = (): void => {
      const guess = input.value.toLowerCase();

      if (!isValidGuess(guess, current.settings.length, current.settings.base)) {
        message = t(language, 'game.invalid');
        render();
        return;
      }

      if (hasGuess(current, guess)) {
        message = t(language, 'game.duplicate');
        render();
        return;
      }

      const next = applyGuess(current, guess, Date.now());
      game = next;
      message = null;

      if (isWon(next)) {
        saveResult(next);
      }

      render();
    };

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        submit();
      }
    });

    const submitButton = el('button', { class: 'primary', type: 'button' }, [
      t(language, 'game.submit'),
    ]);

    submitButton.addEventListener('click', submit);

    const historyItems = [...current.history]
      .reverse()
      .map((entry) =>
        el('li', { class: 'history-item' }, [
          el('span', { class: 'history-guess' }, [entry.guess]),
          el('span', { class: 'history-score' }, [
            `${String(entry.bulls)} ${t(language, 'game.bulls')} · ${String(entry.cows)} ${t(
              language,
              'game.cows',
            )}`,
          ]),
        ]),
      );

    const newGame = el('button', { class: 'primary', type: 'button' }, [
      t(language, 'game.newGame'),
    ]);

    newGame.addEventListener('click', () => {
      stopTimer();
      game = null;
      message = null;
      render();
    });

    return el('section', { class: 'game' }, [
      el('div', { class: 'stats' }, [
        el('span', { class: 'stat' }, [`${t(language, 'game.attempts')}: `, attempts]),
        el('span', { class: 'stat' }, [`${t(language, 'game.time')}: `, time]),
      ]),
      finished ? null : el('div', { class: 'guess-row' }, [input, submitButton]),
      message === null ? null : el('p', { class: 'message' }, [message]),
      finished
        ? el('div', { class: 'win' }, [
            el('p', {}, [
              t(language, 'game.win', { attempts: current.history.length, time: timeText }),
            ]),
            el('p', {}, [`${t(language, 'game.secret')}: ${current.secret}`]),
          ])
        : null,
      el('ul', { class: 'history' }, historyItems),
      finished ? newGame : null,
    ]);
  };

  const render = (): void => {
    container.replaceChildren(
      renderHeader(),
      el('main', { class: 'main' }, [game === null ? renderSettings() : renderGame(game)]),
    );

    if (game !== null && game.finishedAt === null) {
      const input = container.querySelector<HTMLInputElement>('.guess-input');

      if (input !== null) {
        input.focus();
      }
    }
  };

  render();
};
