# Masonry — Documentation

## Status notice

The masonry sub-package is being actively rewritten. **Only the files listed in the
Active Source Files section below are current.** Every other file in `src/` is part of
the old implementation — still present to keep Git history intact, but treated as dead
code pending deletion.

The subdirectories in this `docs/` folder (`architecture/`, `functional-specification/`,
`technical-specification/`) document the old design and are retained as historical
reference only. They do not describe the new code.

---

## Active Documentation

| Document | What it covers |
| --- | --- |
| [architecture.md](./architecture.md) | How capability areas are structured: responsibility splits, data flow, key design decisions |
| [specification.md](./specification.md) | Domain model per capability area |

---

## Active Source Files

### Types and configuration

| File | Role |
| --- | --- |
| `src/@types/brick.types.ts` | `BrickViewProps`, `BrickOutlineInput/Output`, `BrickMinimums` |
| `src/utils/constants.ts` | `SCALE_LEVEL_CONFIG` — brickScale, min dimensions, font sizes |
| `src/lib/utils.ts` | `cn` helper (Tailwind class merging) |

### Path geometry utility

| File | Role |
| --- | --- |
| `src/utils/brick-shape.ts` | `BrickOutlineGenerator` — computes SVG paths and layout bounds |
| `src/utils/brick-shape.test.ts` | Unit tests for `computeDimensions` and `generate` |

### Brick component

| File | Role |
| --- | --- |
| `src/components/Brick/Brick.tsx` | `BrickView` — routes to `BrickViewFixed` or `BrickViewInput` |
| `src/components/Brick/BrickFixed.tsx` | Fixed-widget bricks: `label`, `graphic`, `variant` |
| `src/components/Brick/BrickInput.tsx` | Input-widget bricks with `ResizeObserver`-driven sizing |
| `src/components/Brick/BrickWidget.tsx` | Renders the correct input widget for `BrickViewInput` |
| `src/components/Brick/BrickFixed.test.tsx` | Tests for `BrickViewFixed`: label color, font sizes |
| `src/components/Brick/Brick.stories.tsx` | Storybook stories: all brick kinds and widget types |

### Path debug harness (Storybook only)

| File | Role |
| --- | --- |
| `src/components/Path/Path.tsx` | `PathBrickView` — SVG debug wrapper; Storybook only |
| `src/components/Path/Path.stories.tsx` | Storybook stories: notch variants, nesting, playground |

### UI primitives

| Directory | Role |
| --- | --- |
| `src/ui/` | shadcn/Radix UI components consumed by `BrickWidget` and `BrickFixed` |

---

## Playground

A standalone Vite + React app for manual, interactive testing of masonry components and
behaviours. It is not part of the library build — it exists only as a dev harness.

| Item | Detail |
| --- | --- |
| Location | `src/playground/` |
| Entry | `src/playground/index.tsx` |
| Script | `npm run playground2` (port 5602) |
| Routing | `react-router-dom` `BrowserRouter`; each page is a route in `App.tsx` |
| Pages | `src/playground/pages/` — one file per route |

See [`src/playground/README.md`](../src/playground/README.md) for routing conventions and
how to add new pages.

---

## Dead / Pending Replacement

The following `src/` directories and files belong to the old implementation. They are
**not used** by any of the active files above and will be deleted in a future cleanup pass.

- `src/brick/` — old brick model, view, and utilities (including the old `path.ts` and `path.spec.ts`)
- `src/collision-detection/` — old collision detection component
- `src/palette/` — old palette component
- `src/state/` — old drag and tower state
- `src/tower/` — old tower model and view
- `src/workspace/` — old workspace model and view
- `src/@types/brick.d.ts` — old brick type declarations
- `src/@types/tower.d.ts` — old tower type declarations
- `src/utils/ReverseMappingUtility.ts` — old reverse-mapping utility
- `src/utils/spec/reverseMapping.spec.ts` — old spec for the above
