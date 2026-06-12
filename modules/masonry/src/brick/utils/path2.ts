import type {
    Bounds,
    BrickMinimums,
    BrickOutlineInput2,
    BrickOutlineOutput2,
} from '@masonry/@types/brick';

// ────────────────────────── Constants ────────────────────────────────────────────────────────────

// ── Head padding ──
/** Distance from the top edge of the head to its inner content */
export const HEAD_PAD_Y1 = 4;
/** Distance from the bottom edge of the head to its inner content */
export const HEAD_PAD_Y2 = 4;
/** Distance from the left edge of the head to its inner content */
export const HEAD_PAD_X1 = 7;
/** Distance from the right edge of the head to its inner content */
export const HEAD_PAD_X2 = 7;

// ── Gutters ──
/** Horizontal gap between the main label and the parameter labels */
export const LABEL_PARAM_GUTTER_X = 10;
/** Vertical gap between stacked parameter labels */
export const PARAM_GUTTER_Y = 8;

// ── Tail ──
/** Horizontal width of the tail's indent that forms the nesting cavity notch */
export const TAIL_INDENT_W = 6;
/** Total width of the closing step at the bottom of the tail */
export const TAIL_STEP_W = 30;
/** Height of the closing step at the bottom of the tail */
export const TAIL_STEP_H = 6;

// ────────────────────────── Dimension Calculation ────────────────────────────────────────────────

interface ComputedDimensions2 {
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick (headHeight + tailHeight) */
    height: number;
    /** Height of the top head section containing labels and args */
    headHeight: number;
    /** Height of the nesting cavity between the head and the tail step; 0 when no nesting */
    nestHeight: number;
}

export function computeDimensions2(
    input: BrickOutlineInput2,
    minimums: BrickMinimums,
): ComputedDimensions2 {
    const { minWidth, minLabelHeight, minNestHeight, minParamHeight, minArgHeight } = minimums;
    const params = input.paramArgDims.map((p) => p.param ?? { w: 0, h: minParamHeight });
    const args = input.paramArgDims.map((p) => p.arg ?? { w: 0, h: minArgHeight });

    // SVG strokes straddle the path line — s/2 bleeds outside on each side;
    // every segment includes s/2 at both ends so the stroke isn't clipped.
    const strokeWidth = input.strokeWidth;

    // ── Width ──

    // ── Head ──
    const maxParamWidth = params.length > 0 ? Math.max(...params.map((p) => p.w)) : 0;
    const labelParamGutter = maxParamWidth > 0 ? LABEL_PARAM_GUTTER_X : 0;
    const headWidth =
        strokeWidth / 2 +
        HEAD_PAD_X1 +
        input.labelDims.w +
        labelParamGutter +
        maxParamWidth +
        HEAD_PAD_X2 +
        strokeWidth / 2;

    // ── Tail ──
    const tailIndentWidth =
        strokeWidth / 2 + TAIL_INDENT_W + (input.nestingDims?.w ?? 0) + strokeWidth / 2;
    const tailStepWidth = strokeWidth / 2 + TAIL_STEP_W + strokeWidth / 2;

    const tailWidth = Math.max(tailIndentWidth, tailStepWidth);

    const width = Math.max(headWidth, tailWidth, minWidth);

    // ── Height ──

    // ── Head ──
    const paramsTotalHeight = params.reduce((sum, p) => sum + p.h, 0);
    const paramGutterTotal = PARAM_GUTTER_Y * Math.max(0, params.length - 1);

    const headHeightByLabel =
        strokeWidth / 2 +
        HEAD_PAD_Y1 +
        Math.max(input.labelDims.h, minLabelHeight) +
        HEAD_PAD_Y2 +
        strokeWidth / 2;
    const headHeightByParams =
        strokeWidth / 2 +
        HEAD_PAD_Y1 +
        paramsTotalHeight +
        paramGutterTotal +
        HEAD_PAD_Y2 +
        strokeWidth / 2;
    // No stroke clearance or padding — args are slots for external components whose
    // input dims already account for their own strokes, if present.
    const headHeightByArgs = args.reduce((sum, a) => sum + a.h, 0);

    const headHeight = Math.max(headHeightByLabel, headHeightByParams, headHeightByArgs);

    // ── Tail ──
    const hasNesting = input.nestingDims !== undefined;
    const nestHeight = hasNesting ? Math.max(input.nestingDims?.h ?? 0, minNestHeight) : 0;
    const tailHeight = hasNesting
        ? nestHeight + strokeWidth / 2 + TAIL_STEP_H + strokeWidth / 2
        : 0;

    const height = headHeight + tailHeight;

    return { width, height, headHeight, nestHeight };
}

// ────────────────────────── Path Segments ────────────────────────────────────────────────────────

function segTopEdge(width: number, strokeWidth: number): string[] {
    // All segments inset by s/2: outline starts at (s/2, s/2); full-span edges lose s/2 at each end.
    return [
        `M ${strokeWidth / 2} ${strokeWidth / 2}`,
        `h ${width - strokeWidth / 2 - strokeWidth / 2}`,
    ];
}

function segHeadRight(headHeight: number, strokeWidth: number): string[] {
    return [`v ${headHeight - strokeWidth / 2 - strokeWidth / 2}`];
}

function segHeadBottom(width: number, strokeWidth: number): string[] {
    return [`h ${-(width - strokeWidth / 2 - strokeWidth / 2)}`];
}

function segLeftEdge(height: number, strokeWidth: number): string[] {
    return [`v ${-(height - strokeWidth / 2 - strokeWidth / 2)}`];
}

function segTailCavityRoof(width: number, strokeWidth: number): string[] {
    // Cavity walls each inset s/2 inward; the freed s is absorbed into the step height.
    const span = width - TAIL_INDENT_W - strokeWidth / 2 - strokeWidth / 2;
    return [`h ${-span}`];
}

function segTailCavityLeft(nestHeight: number, strokeWidth: number): string[] {
    // Grows s/2 per seam: starts s/2 below the inset roof, ends s/2 above the inset floor.
    return [`v ${nestHeight + strokeWidth / 2 + strokeWidth / 2}`];
}

function segTailFoot(): string[] {
    return [`h ${TAIL_STEP_W - TAIL_INDENT_W}`];
}

function segTailStepRight(): string[] {
    return [`v ${TAIL_STEP_H}`];
}

function segTailStepBottom(): string[] {
    return [`h ${-TAIL_STEP_W}`];
}

function generateBounds(
    input: BrickOutlineInput2,
    width: number,
    headHeight: number,
    nestHeight: number,
    hasNesting: boolean,
    minimums: BrickMinimums,
): BrickOutlineOutput2['bounds'] {
    const { minLabelHeight, minNestHeight, minParamHeight, minArgHeight } = minimums;
    const strokeWidth = input.strokeWidth;

    const label: Bounds = {
        x: strokeWidth / 2 + HEAD_PAD_X1,
        y: strokeWidth / 2 + HEAD_PAD_Y1,
        w: input.labelDims.w,
        h: Math.max(input.labelDims.h, minLabelHeight),
    };

    let nesting: Bounds | undefined;
    if (hasNesting) {
        nesting = {
            x: TAIL_INDENT_W + strokeWidth / 2 + strokeWidth / 2,
            y: headHeight,
            w: input.nestingDims?.w ?? 0,
            h: Math.max(nestHeight, minNestHeight),
        };
    }

    const params: Bounds[] = [];
    const args: Bounds[] = [];
    let y = 0;

    for (const { param, arg } of input.paramArgDims) {
        const rowH = Math.max(arg?.h ?? 0, minArgHeight);

        if (arg !== null) {
            args.push({ x: width, y, w: arg.w, h: rowH });
        }

        if (param !== null) {
            const paramH = Math.max(param.h, minParamHeight);
            params.push({
                x: width - strokeWidth / 2 - HEAD_PAD_X2 - param.w,
                y: y + (rowH - paramH) / 2,
                w: param.w,
                h: paramH,
            });
        }

        y += rowH;
    }

    return {
        label,
        params: params.length > 0 ? params : undefined,
        args: args.length > 0 ? args : undefined,
        nesting,
    };
}

// ────────────────────────── Public API ───────────────────────────────────────────────────────────

/**
 * Creates a reusable brick outline generator bound to the given size minimums.
 *
 * Minimums are fixed at creation time so the generator can be memoized and
 * called cheaply on every render.
 *
 * @param minimums - SVG-unit floor dimensions for width, heights, and slots.
 * @returns Generator that produces an SVG path and layout bounds for one brick.
 */
export function createBrickOutlineGenerator(
    minimums: BrickMinimums,
): (input: BrickOutlineInput2) => BrickOutlineOutput2 {
    /**
     * Computes the SVG path and layout bounds for a single brick frame.
     *
     * @param input - Stroke width, label/param/arg dimensions, optional nesting.
     * @returns SVG path string, outer frame dimensions, and content-region bounds.
     */
    return (input: BrickOutlineInput2): BrickOutlineOutput2 => {
        const { width, height, headHeight, nestHeight } = computeDimensions2(input, minimums);

        const hasNesting = input.nestingDims !== undefined;
        const strokeWidth = input.strokeWidth;

        const segments = !hasNesting
            ? [
                  ...segTopEdge(width, strokeWidth),
                  ...segHeadRight(headHeight, strokeWidth),
                  ...segHeadBottom(width, strokeWidth),
                  ...segLeftEdge(height, strokeWidth),
                  'z',
              ]
            : [
                  ...segTopEdge(width, strokeWidth),
                  ...segHeadRight(headHeight, strokeWidth),
                  ...segTailCavityRoof(width, strokeWidth),
                  ...segTailCavityLeft(nestHeight, strokeWidth),
                  ...segTailFoot(),
                  ...segTailStepRight(),
                  ...segTailStepBottom(),
                  ...segLeftEdge(height, strokeWidth),
                  'z',
              ];

        const path = segments.join(' ');

        const bounds = generateBounds(input, width, headHeight, nestHeight, hasNesting, minimums);

        return { path, width, height, bounds };
    };
}
