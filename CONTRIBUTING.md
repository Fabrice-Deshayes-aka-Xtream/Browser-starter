# Contributing

Thanks for your interest! Bug reports, ideas and pull requests are welcome.

## Setup

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run lint
npm run type-check
npm test
npx playwright install chromium   # first time only
npm run build && npx playwright test
```

## Guidelines

- TypeScript strict, Vue 3 `<script setup>`; one component per file, features grouped under `src/features/<name>`.
- Comments in English, only where the code is not self-explanatory.
- Every user-facing string goes through vue-i18n (`src/shared/i18n`, `en` and `fr`).
- New block types: add a folder in `src/features/blocks`, extend the schema in `src/core/config/schema.ts` and register it in `blockRegistry.ts`.
- Configuration format changes require a version bump and a migration in `src/core/config/migrations.ts`.
- Use [Conventional Commits](https://www.conventionalcommits.org/).