// ── Scale levels ──
export const SCALE_LEVEL_CONFIG = {
    1: {
        brickScale: 0.75,
        minWidth: 80,
        minArgNestHeight: 24,
        minWidgetParamHeight: 14,
        fontSize: 12,
        lineHeight: 14,
    },
    2: {
        brickScale: 1,
        minWidth: 100,
        minArgNestHeight: 32,
        minWidgetParamHeight: 18,
        fontSize: 14,
        lineHeight: 18,
    },
    3: {
        brickScale: 1.25,
        minWidth: 120,
        minArgNestHeight: 40,
        minWidgetParamHeight: 20,
        fontSize: 16,
        lineHeight: 20,
    },
} as const;

/** A brick's scale level; mirrors the model's own default of 2. */
export type ScaleLevel = keyof typeof SCALE_LEVEL_CONFIG;
export const DEFAULT_SCALE_LEVEL: ScaleLevel = 2;

/** Derived from the config so stepping and clamping never hard-code the bounds. */
export const SCALE_LEVELS = Object.keys(SCALE_LEVEL_CONFIG)
    .map(Number)
    .sort((a, b) => a - b) as ScaleLevel[];
export const MIN_SCALE_LEVEL = SCALE_LEVELS[0];
export const MAX_SCALE_LEVEL = SCALE_LEVELS[SCALE_LEVELS.length - 1];

// ── Interaction ──

/**
 * Marks the fold toggle overlaid on a nesting brick's head.
 *
 * Shared because two places need to agree on it: the toggle stamps the attribute on itself, and
 * `useBrickMove` passes this selector as the draggable's `ignoreFrom`, so a press that lands on the
 * toggle folds the cavity instead of dragging the brick out of its tower.
 */
export const FOLD_TOGGLE_SELECTOR = '[data-fold-toggle]';

/**
 * Marks the positioning node of a brick on the canvas.
 *
 * Shared for the same reason as `FOLD_TOGGLE_SELECTOR`: `TowerBrickView` stamps the attribute on
 * its root, and `useCanvasPan` passes this selector as the canvas draggable's `ignoreFrom`, so a
 * press that lands on a brick drags the brick rather than panning the canvas underneath it.
 */
export const TOWER_BRICK_SELECTOR = '[data-tower-brick]';

/** How far (in pixels) the canvas pans per arrow-key press. */
export const PAN_STEP = 50;
/** How far (in pixels) the canvas pans per accelerated arrow-key press (Shift held). */
export const FAST_PAN_STEP = 100;
/** How far (in pixels) the canvas pans per PageUp / PageDown press. */
export const PAGE_PAN_STEP = 300;
