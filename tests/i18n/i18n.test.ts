/**
 * Тесты локализации.
 *
 * Проверяют словари en/ru, функцию перевода с подстановкой параметров
 * и сохранение выбранного языка в хранилище.
 */

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_KEY,
  isLanguage,
  loadLanguage,
  saveLanguage,
  t,
} from '../../src/i18n/index.js';
import { en } from '../../src/i18n/en.js';
import { ru } from '../../src/i18n/ru.js';
import type { StorageLike } from '../../src/core/storage.js';

const memoryStorage = (): StorageLike => {
  const data = new Map<string, string>();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe('dictionaries', () => {
  it('contain the same set of keys', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort());
  });

  it('do not contain empty strings', () => {
    const values = [...Object.values(en), ...Object.values(ru)];

    expect(values.every((value: string) => value.trim().length > 0)).toBe(true);
  });
});

describe('t', () => {
  it('returns an English string', () => {
    expect(t('en', 'settings.title')).toBe('Settings');
  });

  it('returns a Russian string', () => {
    expect(t('ru', 'settings.title')).toBe('Настройки');
  });

  it('substitutes parameters', () => {
    expect(t('en', 'settings.possible', { count: 5040 })).toBe('5040 possible secrets');
  });

  it('keeps unknown placeholders untouched', () => {
    expect(t('en', 'settings.possible', {})).toBe('{count} possible secrets');
  });
});

describe('language storage', () => {
  it('defaults to English', () => {
    expect(loadLanguage(memoryStorage())).toBe(DEFAULT_LANGUAGE);
  });

  it('reads a saved language', () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_KEY, 'ru');

    expect(loadLanguage(storage)).toBe('ru');
  });

  it('falls back to English for an unknown value', () => {
    const storage = memoryStorage();
    storage.setItem(LANGUAGE_KEY, 'de');

    expect(loadLanguage(storage)).toBe('en');
  });

  it('saves the language under the expected key', () => {
    const storage = memoryStorage();
    const setItem = jest.spyOn(storage, 'setItem');

    saveLanguage(storage, 'ru');

    expect(setItem).toHaveBeenCalledWith(LANGUAGE_KEY, 'ru');
  });

  it('round-trips the language', () => {
    const storage = memoryStorage();
    saveLanguage(storage, 'ru');

    expect(loadLanguage(storage)).toBe('ru');
  });

  it('recognizes only supported languages', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('ru')).toBe(true);
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
