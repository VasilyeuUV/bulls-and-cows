/**
 * Английские строки интерфейса.
 *
 * Ключи этого объекта задают тип `TranslationKey` для всего приложения,
 * поэтому набор строк в `ru.ts` проверяется компилятором: пропущенный
 * ключ не соберётся.
 */
export const en = {
  'settings.title': 'Settings',
  'settings.length': 'Secret length',
  'settings.base': 'Numeral system',
  'settings.start': 'Start game',
  'settings.possible': '{count} possible secrets',
  'settings.binaryHint': 'Binary system supports only length 2',
  'game.title': 'Bulls and Cows',
  'game.attempts': 'Attempts',
  'game.time': 'Time',
  'game.guessPlaceholder': 'Enter {length} digits',
  'game.submit': 'Check',
  'game.newGame': 'New game',
  'game.historyEmpty': 'No attempts yet',
  'game.bulls': 'Bulls',
  'game.cows': 'Cows',
  'game.secret': 'Secret',
  'game.win': 'You won in {attempts} attempts in {time}!',
  'game.duplicate': 'This guess was already tried',
  'game.invalid': 'Enter a valid guess',
  'records.title': 'Records',
  'records.empty': 'No records yet',
  'records.attempts': 'Attempts',
  'records.time': 'Time',
  'records.date': 'Date',
  'records.settings': 'Settings',
  'common.language': 'Language',
} as const;

/** Ключи переводов, доступные в приложении. */
export type TranslationKey = keyof typeof en;
