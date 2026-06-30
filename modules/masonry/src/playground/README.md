# Masonry Playground

A standalone Vite + React dev harness for manually testing masonry components and
behaviours. It is **not** part of the library build and is never published.

## Running

```sh
npm run playground2
```

Starts a dev server at `http://localhost:5602` with HMR.

## Structure

```text
src/playground/
├── index.html              # HTML entry point
├── index.tsx               # React root mount
├── App.tsx                 # BrowserRouter + route table (generated from pages.ts)
├── vite.config.ts          # Extends modules/masonry/vite.config.ts, adds react()
├── components/
│   ├── Layout.tsx          # Top bar + page outlet
│   └── TopBar.tsx          # Nav bar with home button and per-page route buttons
└── pages/
    ├── index.ts            # Single source of truth: path, label, description, component
    └── Home.tsx            # Catalog — lists all pages with descriptions
```

## Adding a page

1. Create `src/playground/pages/MyPage.tsx` and export a default component.

2. Add an entry to `pages.ts`:

   ```ts
   import MyPage from './pages/MyPage';

   export const pages: PageDef[] = [
     {
       path: '/my-page',
       label: 'My Page',
       description: 'One sentence on what this page demonstrates.',
       component: MyPage,
     },
   ];
   ```

   This automatically adds the route in `App.tsx`, a nav button in `TopBar`, and a
   catalog card on `Home`.

## Conventions

- One file per route under `pages/`. No nested folders unless a page is genuinely
  complex enough to warrant its own sub-components.
- Use the `@` alias for imports from the library source (`@/components/...`,
  `@/utils/...`). The alias resolves to `modules/masonry/src/`.
- Keep pages self-contained. Shared playground-only utilities can live directly in
  `src/playground/` alongside `App.tsx`.
- Pages fill the content area exactly — `Layout` constrains it to the remaining
  viewport height with no layout-level scroll. Implement scrolling inside the page
  if needed.
