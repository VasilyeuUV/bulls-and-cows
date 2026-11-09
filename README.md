# Bulls and Cows

A browser game where the computer picks a secret number made of unique digits and the
player guesses it, receiving **bulls** (right digit, right place) and **cows** (right digit,
wrong place) after every attempt.

Built with TypeScript and the DOM API — no frameworks, no runtime dependencies, no bundler.

**Live demo:** https://vasilyeuuv.github.io/bulls-and-cows/

## Rules

- The secret contains `length` unique digits in the chosen numeral system.
- The secret may start with zero: `0123` is a valid four-digit secret in decimal.
- A guess must have the same length, contain only digits allowed by the system and have no
  repeated digits. Hex digits are case-insensitive.
- The round ends when `bulls === length`. Attempts and elapsed time are recorded.
- The best ten results are stored in `localStorage` and survive a page reload.

Available systems and lengths:

| System | Digits           | Lengths |
| ------ | ---------------- | ------- |
| bin    | `0`–`1`          | 2       |
| oct    | `0`–`7`          | 2–6     |
| dec    | `0`–`9`          | 2–6     |
| hex    | `0`–`9`, `a`–`f` | 2–6     |

## Features

- Settings screen with length and numeral system; binary system is limited to length 2.
- Live input filtering: characters not allowed by the selected system cannot be typed.
- Immutable attempt history with bulls and cows for every guess.
- Attempts counter and round timer.
- Top-10 records with tie-break by attempts, then time, then date.
- Duplicate guesses are rejected and do not create a second history entry.
- Round can be aborted with the exit button: the secret is not revealed and no record is saved.
- English and Russian UI with a language switch; the choice is persisted.
- Responsive layout with dark mode support.

## Tech stack

- TypeScript 6 (strict), ES modules, compiled by `tsc` — no bundler
- ESLint 10 (flat config) and Prettier 3
- Jest 30 with ts-jest
- Husky 9 and lint-staged
- Vanilla DOM: `createElement` and `textContent`, no `innerHTML`

## Requirements

- Node.js 20 or newer (the project is developed and tested on Node 24)
- npm

## Getting started

```bash
npm ci
npm run build
npx serve .
```

Open http://localhost:3000.

The app loads ES modules, so it must be served over HTTP — opening `index.html` directly
from the file system will not work due to module CORS restrictions. Any static server can be
used instead of `serve`, for example `python -m http.server 3000`.

## Scripts

| Script                 | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run build`        | Compile `src` to `dist` with `tsc` |
| `npm run watch`        | Rebuild on change                  |
| `npm run typecheck`    | Type-check without emitting        |
| `npm test`             | Run the Jest suite once            |
| `npm run test:watch`   | Run tests in watch mode            |
| `npm run lint`         | Lint the project with ESLint       |
| `npm run format`       | Format the project with Prettier   |
| `npm run format:check` | Check formatting without writing   |

Git hooks are installed by `npm ci` through the `prepare` script. `pre-commit` runs
`lint-staged` (ESLint and Prettier on staged files), `pre-push` runs the test suite.

## Project structure

```text
src/
├── core/      pure game logic: digits, validation, evaluation, generation,
│              counting, state, records, storage adapter
├── i18n/      English and Russian dictionaries, translation function
├── ui/        DOM helpers and application screens
└── main.ts    entry point
tests/
├── core/      unit tests for every pure function
└── i18n/      dictionary and language storage tests
```

The game logic has no DOM dependencies and is tested without a browser. `localStorage` is
accessed only through the storage adapter, which is replaced with an in-memory fake in tests.

## Testing

The core is covered by unit tests written before the implementation (TDD). Each required
function has a pair of commits: failing tests first, implementation second.

- 151 tests across 10 suites
- deterministic: randomness is injected as a function, storage as an object
- no timers, network or shared mutable state between tests
- `FIRST`: fast, independent, repeatable, self-validating, timely

## Design

Architecture, data structures, algorithms, complexity analysis and applied clean code
principles are described in [DESIGN.md](./DESIGN.md).

## Deployment

The site is built and published by GitHub Actions on every push to `bulls-and-cows`.
To enable it in a fork:

1. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Push to `bulls-and-cows` and wait for the workflow to finish.

The workflow compiles TypeScript, runs lint, type checks and tests, assembles `index.html`,
`styles.css` and `dist` into `_site` and uploads it as a Pages artifact.

## Workflow

- `main` stays clean: it contains only the initial `README.md` and `.gitignore`.
- Development happens in the `bulls-and-cows` branch.
- Commits follow the [RS School git convention](https://rs.school/docs/git-convention).
- The pull request from `bulls-and-cows` to `main` stays open and is not merged.

## License

ISC
