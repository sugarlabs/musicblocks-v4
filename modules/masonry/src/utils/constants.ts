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

// ── Workspace ──

/**
 * How far `cleanWorkspace` keeps the towers from the canvas edges, in pixels: the first tower of
 * every column starts here, and a column may run down to this far from the bottom.
 */
export const CLEAN_WORKSPACE_PADDING = 24;

/** The room `cleanWorkspace` leaves between one tower and the next, and between columns. */
export const CLEAN_WORKSPACE_GAP = 24;
