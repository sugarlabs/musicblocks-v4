# ESLint Lint Report — Post v8→v10 Upgrade

## Packages Passing

`lib/assets`, `lib/config`, `lib/events`, `lib/i18n`, `lib/transport`, `lib/components`,
`modules/editor`, `modules/menu`, `modules/painter` (warnings only, no errors)

---

## Packages Failing

### `lib/view` — 2 errors

| Rule | Count | Location |
|------|------:|----------|
| `@eslint-react/dom-no-flush-sync` | 2 | `src/components/index.tsx:73,99` |

### `modules/code-builder` — 12 errors

| Rule | Count | Location |
|------|------:|----------|
| `@eslint-react/static-components` | 8 | story components |
| `@eslint-react/no-nested-component-definitions` | 4 | story components |

### `modules/singer` — 2 errors

| Rule | Count | Location |
|------|------:|----------|
| `no-useless-assignment` | 2 | `src/core/keySignature.ts:285,1424` |

### `modules/masonry` — 16 errors

| Rule | Count |
|------|------:|
| `@eslint-react/static-components` | 6 |
| `react-hooks/set-state-in-effect` | 4 |
| `@eslint-react/unsupported-syntax` | 2 |
| `@eslint-react/no-nested-component-definitions` | 2 |
| `no-useless-assignment` | 2 |

### `modules/program` — 1 error

| Rule | Count | Location |
|------|------:|----------|
| `no-useless-assignment` | 1 | `src/compiler/parser.ts:618` |

### `modules/runtime` — 1 error

| Rule | Count | Location |
|------|------:|----------|
| `no-useless-assignment` | 1 | `src/interpreter/instructions/compare-jump-instruction.ts:34` |

### `app` — 2 errors

| Rule | Count | Location |
|------|------:|----------|
| `@eslint-react/dom-no-flush-sync` | 2 | `src/splash/index.tsx:67,105` |

---

## Remaining Distinct Rules Causing Errors

| Rule | Packages Affected | Source |
|------|-------------------|--------|
| `no-useless-assignment` | `singer`, `masonry`, `program`, `runtime` | Added to `eslintJs.configs.recommended` in ESLint v9+ |
| `@eslint-react/static-components` | `code-builder`, `masonry` | New rule in `@eslint-react` `recommended-typescript` |
| `@eslint-react/no-nested-component-definitions` | `code-builder`, `masonry` | New rule in `@eslint-react` `recommended-typescript` |
| `react-hooks/set-state-in-effect` | `masonry` | New rule in `eslint-plugin-react-hooks` v5 `recommended-latest` |
| `@eslint-react/dom-no-flush-sync` | `lib/view`, `app` | New rule in `@eslint-react` `recommended-typescript` |
| `@eslint-react/unsupported-syntax` | `masonry` | New rule in `@eslint-react` `recommended-typescript` (IIFEs in JSX) |
