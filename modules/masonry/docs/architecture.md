# Masonry — Architecture

High-level map of how the masonry sub-package is structured and why. Each section covers one
capability area. More sections will be added as the package grows.

---

## Brick

A brick is rendered by two cooperating pieces: a pure geometry utility and a React component
layer. Keeping them separate means the path math never knows about React, pixels, or brick
semantics — and the components never hand-roll geometry.

### Responsibility split

| Piece | Owns |
| --- | --- |
| `BrickOutlineGenerator` | SVG path and layout bounds. No React, no pixels, no brick semantics. |
| `BrickViewFixed` / `BrickViewInput` | React lifecycle, px↔SVG conversion, DOM measurement. |

### Data flow

```text
BrickViewProps
      │
      ▼
  measure DOM                   ← useLayoutEffect 1
  (getBoundingClientRect /
   ResizeObserver)
      │
      ▼
  pxToSvg(measuredDims)
      │
      ▼
  BrickOutlineGenerator
  .generate(normalisedInput)     ← pure geometry; memoized instance
      │
      ├── path  ──────────────→  <path d={path} transform="scale(brickScale)" />
      │
      └── bounds ─────────────→  <foreignObject x y width height />
                                 (one per content region: widget, each param label)
```

### Why two layout effects

Text and widget dimensions are not known until the DOM has rendered them. The first layout
effect measures the rendered output; the second converts those pixel measurements to SVG units
and calls the generator. Splitting them ensures the path is always generated from actual
rendered dimensions, not estimates.

### Memoization strategy

Each component creates one `BrickOutlineGenerator` instance via `useMemo`, keyed on the
minimums derived from `scaleLevel`. The instance is reused across renders; `generate` skips
recomputation internally when the normalised input is unchanged (shallow equality check). This
means the geometry work is O(1) on re-renders that don't change brick dimensions.

### Fixed vs. input bricks

`BrickViewFixed` and `BrickViewInput` share the same two-phase layout pattern but differ in
how they measure the widget:

- **Fixed** (`label`, `graphic`, `variant`): measures a static DOM element with
  `getBoundingClientRect` in a layout effect triggered by content changes.
- **Input** (`textbox`, `numberbox`, `toggle`, `slider`, `select`): attaches a
  `ResizeObserver` so the outline re-flows continuously as the user types or interacts.
