import type { StorageLike } from '../core/storage.js';
import { en } from './en.js';
import type { TranslationKey } from './en.js';
import { ru } from './ru.js';

/** Поддерживаемые языки интерфейса. */
export type Language = 'en' | 'ru';

/** Параметры подстановки в шаблон строки. */
export type TranslationParams = Readonly<Record<string, string | number | undefined>>;

/** Ключ, под которым выбранный язык хранится в `localStorage`. */
export const LANGUAGE_KEY = 'bulls-and-cows:lang';

/** Язык по умолчанию. */
export const DEFAULT_LANGUAGE: Language = 'en';

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = { en, ru };

const PLACEHOLDER = /\{(\w+)\}/g;

const format = (template: string, params: TranslationParams): string =>
  template.replace(PLACEHOLDER, (placeholder: string, name: string) => {
    const value = params[name];

    return value === undefined ? placeholder : String(value);
  });

/**
 * Возвращает строку интерфейса на выбранном языке.
 *
 * Плейсхолдеры вида `{name}` заменяются значениями из `params`; если
 * параметр не передан, плейсхолдер остаётся как есть — это позволяет
 * заметить ошибку в тестах, а не получить пустую строку.
 *
 * @param language - язык интерфейса
 * @param key - ключ перевода
 * @param params - значения для подстановки
 * @returns готовая строка
 *
 * @example
 * t('en', 'settings.possible', { count: 5040 }); // '5040 possible secrets'
 */
export const t = (
  language: Language,
  key: TranslationKey,
  params: TranslationParams = {},
): string => format(TRANSLATIONS[language][key], params);

/**
 * Проверяет, что значение — поддерживаемый язык.
 *
 * @param value - значение из хранилища
 * @returns `true`, если язык поддерживается
 */
export const isLanguage = (value: unknown): value is Language => value === 'en' || value === 'ru';

/**
 * Читает выбранный язык из хранилища.
 *
 * @param storage - хранилище
 * @returns сохранённый язык либо `en` по умолчанию
 */
export const loadLanguage = (storage: StorageLike): Language => {
  const raw = storage.getItem(LANGUAGE_KEY);

  return isLanguage(raw) ? raw : DEFAULT_LANGUAGE;
};

/**
 * Сохраняет выбранный язык.
 *
 * @param storage - хранилище
 * @param language - язык интерфейса
 */
export const saveLanguage = (storage: StorageLike, language: Language): void => {
  storage.setItem(LANGUAGE_KEY, language);
};

export type { TranslationKey };
