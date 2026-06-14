import type {
    Bounds,
    BrickMinimums,
    BrickOutlineInput,
    BrickOutlineOutput,
} from '@masonry/@types/brick';

// ────────────────────────── Constants ────────────────────────────────────────────────────────────

// ── Head padding ──
/** Distance from the top edge of the head to its inner content */
export const HEAD_PAD_Y1 = 5;
/** Distance from the bottom edge of the head to its inner content */
export const HEAD_PAD_Y2 = 3;
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

// ── Notch geometry ──
// Each notch is a smooth semicircular arc.
//
// Groove (TopNotch / NestedBottomNotch) = full-size inward cut (width = NOTCH_WIDTH)
// Tab    (BottomNotch / NestedTopNotch)  = smaller outward protrusion (width = NOTCH_WIDTH - 2*s)
//
// Both notch centres align at x = NOTCH_OFFSET_X
// Tab width shrinks by s on each side (2*s total) for interlocking
// Groove uses the full NOTCH_WIDTH
// The lip is the small quarter-circle that flares each side into the semicircle
// (radius NOTCH_LIP_RADIUS); the inner corner is sharp (0)
// Sweep flags control convexity/concavity

/** Base width of the notch opening in SVG units */
export const NOTCH_WIDTH = 8;
/** Radius of the small lip arc that flares each side of the notch into the semicircle */
export const NOTCH_LIP_RADIUS = 1;
/** Offset along x from the brick's left edge to the top/bottom notch centre */
export const NOTCH_OFFSET_X = 12;
/** Offset along x to nested notch centres, measured from TAIL_INDENT_W */
export const NESTED_NOTCH_OFFSET_X = 12;

// ────────────────────────── Dimension Calculation ──────────────────────────

interface ComputedDimensions {
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick (headHeight + tailHeight) */
    height: number;
    /** Height of the top head section containing labels and args */
    headHeight: number;
    /** Height of the nesting cavity between the head and the tail step; 0 when no nesting */
    nestHeight: number;
}

export function computeDimensions(
    input: BrickOutlineInput,
    minimums: BrickMinimums,
): ComputedDimensions {
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

// ────────────────────────── Arc Helpers ──────────────────────────────────────────────────────────

/**
 * Generates an arc for a GROOVE (inward U-shape cut).
 * Used by TopNotch and NestedBottomNotch.
 * Direction: positive horizontal (left → right).
 *
 * @param w - Full width of the groove opening
 * @param r - Corner radius for the rounded transitions
 * @returns Array with 3 SVG arc command strings
 */
function arcGroove(w: number, r: number): string[] {
    const effectiveR = Math.min(r, w / 2);
    const R = (w - 2 * effectiveR) / 2;
    return [
        // Quarter-arc: horizontal (left) → vertical (down). CW
        `a ${effectiveR} ${effectiveR} 0 0 1 ${effectiveR} ${effectiveR}`,
        // Semicircle: vertical (down) → vertical (up). CCW (U-shape)
        `a ${R} ${R} 0 0 0 ${w - 2 * effectiveR} 0`,
        // Quarter-arc: vertical (up) → horizontal (right). CW
        `a ${effectiveR} ${effectiveR} 0 0 1 ${effectiveR} ${-effectiveR}`,
    ];
}

/**
 * Generates an arc for a TAB (outward U-shape protrusion).
 * Used by BottomNotch and NestedTopNotch.
 * Direction: negative horizontal (right → left).
 *
 * @param w - Width of the tab (NOTCH_WIDTH - 2*s)
 * @param r - Corner radius for the rounded transitions
 * @returns Array with 3 SVG arc command strings
 */
function arcTab(w: number, r: number): string[] {
    const effectiveR = Math.min(r, w / 2);
    const R = (w - 2 * effectiveR) / 2;
    return [
        // Quarter-arc: horizontal (right) → vertical (down). CCW
        `a ${effectiveR} ${effectiveR} 0 0 0 ${-effectiveR} ${effectiveR}`,
        // Semicircle: vertical (down) → vertical (up). CW (U-shape)
        `a ${R} ${R} 0 0 1 ${-(w - 2 * effectiveR)} 0`,
        // Quarter-arc: vertical (up) → horizontal (left). CCW
        `a ${effectiveR} ${effectiveR} 0 0 0 ${-effectiveR} ${-effectiveR}`,
    ];
}

// ────────────────────────── Path Segments ────────────────────────────────────────────────────────

/**
 * Top edge of the brick, left → right.
 * Draws a full-size arc groove (hasTopNotch) for interlocking with bricks above.
 * The groove cuts INWARD into the brick body.
 *
 * @param width       - Total outer width of the brick
 * @param strokeWidth - Stroke width in SVG units
 * @param hasTopNotch - Whether to draw the top notch groove
 */
function segTopEdge(width: number, strokeWidth: number, hasTopNotch: boolean): string[] {
    const s = strokeWidth;

    // ── No notch — single flat span, inset by s/2 at each end ──
    if (!hasTopNotch) {
        return [`M ${s / 2} ${s / 2}`, `h ${width - s}`];
    }

    // ── Positioning ──
    // flatBefore: horizontal run from the starting M position to the notch left edge
    // flatAfter:  horizontal run from the notch right edge to the brick's right edge
    const r = NOTCH_WIDTH / 2;
    const flatBefore = NOTCH_OFFSET_X - r - s / 2;
    const flatAfter = width - s / 2 - NOTCH_OFFSET_X - r;

    return [
        `M ${s / 2} ${s / 2}`,
        `h ${flatBefore}`, // RIGHT — flat run to groove left edge
        ...arcGroove(NOTCH_WIDTH, NOTCH_LIP_RADIUS), // Arc groove
        `h ${flatAfter}`, // RIGHT — flat run to brick right edge
    ];
}

function segHeadRight(headHeight: number, strokeWidth: number): string[] {
    return [`v ${headHeight - strokeWidth / 2 - strokeWidth / 2}`];
}

/**
 * Bottom edge of the head (used for bricks without nesting), right → left.
 * Draws a smaller arc tab (hasBottomNotch) protruding OUTWARD below the brick.
 * Width is reduced by 2*s so it fits snugly inside the top groove when bricks stack.
 *
 * @param width          - Total outer width of the brick
 * @param strokeWidth    - Stroke width in SVG units
 * @param hasBottomNotch - Whether to draw the bottom notch tab
 */
function segHeadBottom(width: number, strokeWidth: number, hasBottomNotch: boolean): string[] {
    const s = strokeWidth;

    // ── No notch — single flat span going left ──
    if (!hasBottomNotch) {
        return [`h ${-(width - s)}`];
    }

    // ── Bottom notch dimensions ──
    // Tab is narrower than the groove by s on each side for stroke interlocking
    const tabWidth = NOTCH_WIDTH - 2 * s;

    // Guard: tab must be valid
    if (tabWidth <= 0) {
        return [`h ${-(width - s)}`];
    }

    // ── With bottom notch (going RIGHT → LEFT) ──
    // flatBefore: from the brick's right edge to the tab's right edge
    // flatAfter:  from the tab's left edge to the brick's left edge
    const r = NOTCH_WIDTH / 2;
    const flatBefore = width - NOTCH_OFFSET_X - r + s / 2;
    const flatAfter = NOTCH_OFFSET_X - r + s / 2;

    return [
        `h ${-flatBefore}`, // LEFT — flat run to tab right edge
        ...arcTab(tabWidth, NOTCH_LIP_RADIUS), // Arc tab
        `h ${-flatAfter}`, // LEFT — flat run to brick left edge
    ];
}

function segLeftEdge(height: number, strokeWidth: number): string[] {
    return [`v ${-(height - strokeWidth / 2 - strokeWidth / 2)}`];
}

/**
 * Cavity roof segment, right → left.
 * Draws a smaller arc tab (hasNestedTopNotch) protruding DOWN into the cavity.
 * Width is reduced by 2*s so it fits inside the nested-bottom groove.
 *
 * @param width              - Total outer width of the brick
 * @param strokeWidth        - Stroke width in SVG units
 * @param hasNestedTopNotch  - Whether to draw the nested-top notch tab
 */
function segTailCavityRoof(
    width: number,
    strokeWidth: number,
    hasNestedTopNotch: boolean,
): string[] {
    const s = strokeWidth;
    const span = width - TAIL_INDENT_W - s / 2 - s / 2;

    // No nested notch — single flat span
    if (!hasNestedTopNotch) {
        return [`h ${-span}`];
    }

    // Nested-top is the SMALLER tab: width reduced by 2*s for interlocking
    const tabWidth = NOTCH_WIDTH - 2 * s;

    // Guard: tab must be valid
    if (tabWidth <= 0) {
        return [`h ${-span}`];
    }

    // Going RIGHT → LEFT along the cavity roof
    // Tab left edge at absolute x = TAIL_INDENT_W + NESTED_NOTCH_OFFSET_X + s
    // flatBefore: from the cavity right wall to the tab's right edge
    // flatAfter:  from the tab's left edge to the cavity left wall
    // Add s/2 because the inner brick's visual offset starts at TAIL_INDENT_W + s, but the cavity wall path is at TAIL_INDENT_W + s/2
    const r = NOTCH_WIDTH / 2;
    const offset = NESTED_NOTCH_OFFSET_X - r + s / 2;
    const flatBefore = span - (offset + NOTCH_WIDTH - s);
    const flatAfter = offset + s;

    return [
        `h ${-flatBefore}`, // LEFT — flat run to tab right edge
        ...arcTab(tabWidth, NOTCH_LIP_RADIUS), // Arc tab
        `h ${-flatAfter}`, // LEFT — flat run to cavity left wall
    ];
}

function segTailCavityLeft(nestHeight: number, strokeWidth: number): string[] {
    // Grows s/2 per seam: starts s/2 below the inset roof, ends s/2 above the inset floor.
    return [`v ${nestHeight + strokeWidth / 2 + strokeWidth / 2}`];
}

/**
 * Cavity foot segment, left → right.
 * Draws a full-size arc groove (hasNestedBottomNotch) cutting DOWN into the foot.
 * Full-size so it receives the inner brick's bottom tab.
 *
 * @param _strokeWidth          - Stroke width in SVG units (unused; groove is full-size)
 * @param hasNestedBottomNotch  - Whether to draw the nested-bottom notch groove
 */
function segTailFoot(strokeWidth: number, hasNestedBottomNotch: boolean): string[] {
    const s = strokeWidth;
    const span = TAIL_STEP_W - TAIL_INDENT_W;

    // No nested notch — single flat span
    if (!hasNestedBottomNotch) {
        return [`h ${span}`];
    }

    // Left → Right along cavity floor.
    // +s/2 offsets the nested notch to align with the inserted inner brick.
    const r = NOTCH_WIDTH / 2;
    const offset = NESTED_NOTCH_OFFSET_X - r + s / 2;
    const flatBefore = offset;
    const flatAfter = span - offset - NOTCH_WIDTH;

    return [
        `h ${flatBefore}`, // RIGHT — flat run to groove left edge
        ...arcGroove(NOTCH_WIDTH, NOTCH_LIP_RADIUS), // Arc groove
        `h ${flatAfter}`, // RIGHT — flat run to step right wall
    ];
}

function segTailStepRight(): string[] {
    return [`v ${TAIL_STEP_H}`];
}

/**
 * Bottom of the tail step (nesting bricks only), right → left.
 * Draws a smaller arc tab protruding downward, same shape as segHeadBottom.
 *
 * @param hasBottomNotch - Whether to draw the bottom notch tab
 * @param strokeWidth    - Stroke width in SVG units
 */
function segTailStepBottom(hasBottomNotch: boolean, strokeWidth: number): string[] {
    const s = strokeWidth;

    // ── No notch — single flat span going left ──
    if (!hasBottomNotch) {
        return [`h ${-TAIL_STEP_W}`];
    }

    // ── Bottom notch dimensions (strokeWidth narrower for interlocking) ──
    const tabWidth = NOTCH_WIDTH - 2 * s;

    // Guard: tab must be valid
    if (tabWidth <= 0) {
        return [`h ${-TAIL_STEP_W}`];
    }

    // ── With bottom notch (Right → Left) ──
    // Absolute center is NOTCH_OFFSET_X, adjusting for the TAIL_STEP_W inward shift.
    const r = NOTCH_WIDTH / 2;
    const flatBefore = TAIL_STEP_W - NOTCH_OFFSET_X - r + 1.5 * s;
    const flatAfter = NOTCH_OFFSET_X - r + s / 2;

    return [
        `h ${-flatBefore}`, // LEFT — flat run to tab right edge
        ...arcTab(tabWidth, NOTCH_LIP_RADIUS), // Arc tab
        `h ${-flatAfter}`, // LEFT — flat run to step left wall
    ];
}

function generateBounds(
    input: BrickOutlineInput,
    width: number,
    headHeight: number,
    nestHeight: number,
    hasNesting: boolean,
    minimums: BrickMinimums,
): BrickOutlineOutput['bounds'] {
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
): (input: BrickOutlineInput) => BrickOutlineOutput {
    /**
     * Computes the SVG path and layout bounds for a single brick frame.
     *
     * @param input - Stroke width, label/param/arg dimensions, optional nesting,
     *               and optional topNotch / bottomNotch flags.
     * @returns SVG path string, outer frame dimensions, content-region bounds,
     *          and notch protrusion depths (for SVG viewBox sizing).
     */
    return (input: BrickOutlineInput): BrickOutlineOutput => {
        const { width, height, headHeight, nestHeight } = computeDimensions(input, minimums);

        const hasNesting = input.nestingDims !== undefined;
        const strokeWidth = input.strokeWidth;

        // ── Resolve notch flags (default: no notches) ──
        const hasTopNotch = input.topNotch ?? false;
        const hasBottomNotch = input.bottomNotch ?? false;
        // Nested notches only apply when there is nesting
        const hasNestedTopNotch = hasNesting && (input.nestedTopNotch ?? false);
        const hasNestedBottomNotch = hasNesting && (input.nestedBottomNotch ?? false);

        // ── Compute notch protrusion depths (for SVG viewBox sizing) ──
        const tabWidth = NOTCH_WIDTH - 2 * strokeWidth;
        const canDrawTab = tabWidth > 0;
        const topNotchDepth = 0; // Inward groove; no extra top space needed
        const bottomNotchDepth = hasBottomNotch && canDrawTab ? tabWidth / 2 : 0;
        const nestedTopNotchDepth = 0; // Tab goes inward into cavity
        const nestedBottomNotchDepth = 0; // Groove goes into foot (no external protrusion)

        // ── Build the SVG path segments ──
        // Brick without nesting: top → right → bottom → left → close
        // Nesting brick: top → right → cavityRoof → cavityLeft → foot → stepRight → stepBottom → left → close
        const segments = !hasNesting
            ? [
                  ...segTopEdge(width, strokeWidth, hasTopNotch),
                  ...segHeadRight(headHeight, strokeWidth),
                  ...segHeadBottom(width, strokeWidth, hasBottomNotch),
                  ...segLeftEdge(height, strokeWidth),
                  'z',
              ]
            : [
                  ...segTopEdge(width, strokeWidth, hasTopNotch),
                  ...segHeadRight(headHeight, strokeWidth),
                  ...segTailCavityRoof(width, strokeWidth, hasNestedTopNotch),
                  ...segTailCavityLeft(nestHeight, strokeWidth),
                  ...segTailFoot(strokeWidth, hasNestedBottomNotch),
                  ...segTailStepRight(),
                  ...segTailStepBottom(hasBottomNotch, strokeWidth),
                  ...segLeftEdge(height, strokeWidth),
                  'z',
              ];

        const path = segments.join(' ');

        const bounds = generateBounds(input, width, headHeight, nestHeight, hasNesting, minimums);

        return {
            path,
            width,
            height,
            bounds,
            topNotchDepth,
            bottomNotchDepth,
            nestedTopNotchDepth,
            nestedBottomNotchDepth,
        };
    };
}
