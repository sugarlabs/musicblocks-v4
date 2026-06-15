import type {
    Bounds,
    BrickMinimums,
    BrickOutlineInput,
    BrickOutlineOutput,
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

// ── Notch geometry ──
// Groove (TopNotch / NestedBottomNotch) = full-size inward cut (width = NOTCH_WIDTH)
// Tab    (BottomNotch / NestedTopNotch) = smaller outward protrusion (width = NOTCH_WIDTH - 2*s)
// Lip = small quarter-circle that rounds each notch entry/exit corner

/** Base width of the notch opening in SVG units */
export const NOTCH_WIDTH = 8;
/** Corner radius at each notch entry/exit */
export const NOTCH_LIP_RADIUS = 1;
/** Offset along x to all vertical notch centres — top/bottom notches measured from the brick's
 *  left edge; nested notches measured from TAIL_INDENT_W. Identical by design so notches align. */
export const NOTCH_OFFSET_X = 12;

// ── Right notch ──
// Profile (top → bottom): flat → lip arc → semicircle → lip arc → flat.

/** Radius of the semicircular groove on the right edge */
export const NOTCH_RADIUS = 4;
/** Gap from the top of an argument slot down to its notch centre (shared by the right
 * grooves and the left tab, so they stay aligned). */
export const NOTCH_OFFSET_Y = 9;

// ────────────────────────── Dimension Calculation ────────────────────────────────────────────────

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

/**
 * Returns the y-coordinate of each right-edge notch centre, one per argument slot.
 * Each centre sits NOTCH_OFFSET_Y below the top of its row, regardless of row height.
 */
function computeArgNotchCentreYs(
    paramArgDims: BrickOutlineInput['paramArgDims'],
    minArgHeight: number,
): number[] {
    const centreYs: number[] = [];
    let slotTop = 0;
    for (const { arg } of paramArgDims) {
        const rowH = Math.max(arg?.h ?? 0, minArgHeight);
        if (arg !== null) {
            centreYs.push(slotTop + NOTCH_OFFSET_Y);
        }
        slotTop += rowH;
    }
    return centreYs;
}

// ────────────────────────── Arc Helpers ──────────────────────────────────────────────────────────

/** Inward U-shape groove arc (left → right). Used by top notch and nested bottom notch. */
function buildVGroove(): string[] {
    const w = NOTCH_WIDTH;
    const effectiveR = Math.min(NOTCH_LIP_RADIUS, w / 2);
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

/** Outward U-shape tab arc (right → left). Used by bottom notch and nested top notch. */
function buildVTab(w: number): string[] {
    const effectiveR = Math.min(NOTCH_LIP_RADIUS, w / 2);
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
 * @param strokeWidth - Stroke width in SVG units
 * @param width       - Total outer width of the brick
 * @param hasTopNotch - Whether to draw the top notch groove
 */
function segTopEdge(strokeWidth: number, width: number, hasTopNotch: boolean): string[] {
    // No notch — single flat span, inset by strokeWidth/2 at each end.
    if (!hasTopNotch) {
        return [`M ${strokeWidth / 2} ${strokeWidth / 2}`, `h ${width - strokeWidth}`];
    }

    // flatBefore: horizontal run from the starting M position to the notch left edge
    // flatAfter:  horizontal run from the notch right edge to the brick's right edge
    const r = NOTCH_WIDTH / 2;
    const flatBefore = NOTCH_OFFSET_X - r - strokeWidth / 2;
    const flatAfter = width - strokeWidth / 2 - NOTCH_OFFSET_X - r;

    return [
        `M ${strokeWidth / 2} ${strokeWidth / 2}`,
        `h ${flatBefore}`, // flat run to groove left edge
        ...buildVGroove(),
        `h ${flatAfter}`, // flat run to brick right edge
    ];
}

/**
 * Right edge of the head, top → bottom.
 * Draws one full-size concave groove per entry in `notchCentres`, cutting INWARD into the brick (−x).
 * Each groove receives one argument brick plugged in from the right.
 *
 * @param strokeWidth  - Stroke width in SVG units
 * @param headHeight   - Height of the head section
 * @param notchCentres - Absolute y positions (top → bottom) of each groove centre
 */
function segHeadRight(strokeWidth: number, headHeight: number, notchCentres: number[]): string[] {
    // The edge runs between the two corners, each inset by strokeWidth/2 so the stroke isn't clipped.
    const edgeStart = strokeWidth / 2; // top-right corner (pen arrives here)
    const edgeEnd = headHeight - strokeWidth / 2; // bottom-right corner

    // No notches — single straight run.
    if (notchCentres.length === 0) {
        return [`v ${edgeEnd - edgeStart}`];
    }

    const r = NOTCH_RADIUS; // semicircle (groove) radius
    const lip = (3 * strokeWidth) / 2; // small flare arc radius, proportional to the stroke

    const segs: string[] = [];
    let pen = edgeStart; // current y of the pen, travelling downwards

    for (const centre of notchCentres) {
        // Build the notch span from its centre, one portion above and below:
        //   centre        — the notch centre
        //   semicircleTop — one radius above the centre
        //   notchTop      — one lip arc above the semicircle (where the groove begins)
        const semicircleTop = centre - r;
        const notchTop = semicircleTop - lip;
        // ...and symmetrically downwards (where the groove ends):
        const semicircleBottom = centre + r;
        const notchBottom = semicircleBottom + lip;

        // Skip a notch that would overlap the previous one or run past the bottom corner,
        // so the path stays continuous instead of self-crossing.
        if (notchTop < pen || notchBottom > edgeEnd) {
            continue;
        }

        // 1. flat run down to where the groove begins
        const flatBefore = notchTop - pen;
        segs.push(`v ${flatBefore}`);
        // 2. lip arc: peel the edge inwards (−x)
        segs.push(`a ${lip} ${lip} 0 0 1 ${-lip} ${lip}`);
        // 3. semicircle: the concave groove dipping into the brick (−x)
        segs.push(`a ${r} ${r} 0 0 0 0 ${2 * r}`);
        // 4. lip arc: bring the edge back out
        segs.push(`a ${lip} ${lip} 0 0 1 ${lip} ${lip}`);

        pen = notchBottom;
    }

    // 5. remaining flat run down to the bottom corner
    segs.push(`v ${edgeEnd - pen}`);
    return segs;
}

/**
 * Bottom edge of the head (used for bricks without nesting), right → left.
 * Draws a smaller arc tab (hasBottomNotch) protruding OUTWARD below the brick.
 * Width is reduced by 2*s so it fits snugly inside the top groove when bricks stack.
 *
 * @param strokeWidth    - Stroke width in SVG units
 * @param width          - Total outer width of the brick
 * @param hasBottomNotch - Whether to draw the bottom notch tab
 */
function segHeadBottom(strokeWidth: number, width: number, hasBottomNotch: boolean): string[] {
    // No notch — single flat span going left.
    if (!hasBottomNotch) {
        return [`h ${-(width - strokeWidth)}`];
    }

    // Tab is narrower than the groove by strokeWidth on each side for stroke interlocking
    const tabWidth = NOTCH_WIDTH - 2 * strokeWidth;

    if (tabWidth <= 0) {
        return [`h ${-(width - strokeWidth)}`];
    }

    // flatBefore: from the brick's right edge to the tab's right edge
    // flatAfter:  from the tab's left edge to the brick's left edge
    const r = NOTCH_WIDTH / 2;
    const flatBefore = width - NOTCH_OFFSET_X - r + strokeWidth / 2;
    const flatAfter = NOTCH_OFFSET_X - r + strokeWidth / 2;

    return [
        `h ${-flatBefore}`, // flat run to tab right edge
        ...buildVTab(tabWidth),
        `h ${-flatAfter}`, // flat run to brick left edge
    ];
}

/**
 * Left edge of the brick, bottom → top.
 * Draws a single smaller convex tab (hasLeftNotch) protruding OUTWARD from the brick (−x).
 * Radius is reduced by one stroke width from NOTCH_RADIUS so the parent's right groove receives it cleanly.
 *
 * @param strokeWidth   - Stroke width in SVG units
 * @param height        - Total outer height of the brick
 * @param hasLeftNotch  - Whether to draw the left tab
 */
function segLeftEdge(strokeWidth: number, height: number, hasLeftNotch: boolean): string[] {
    // The edge runs between the two corners, each inset by strokeWidth/2; travelled upward.
    const edgeStart = height - strokeWidth / 2; // bottom-left corner (pen arrives here)
    const edgeEnd = strokeWidth / 2; // top-left corner

    // Tab radius = groove radius minus one stroke width, so the wider groove (drawn at
    // NOTCH_RADIUS) receives this tab cleanly once both strokes are accounted for.
    const r = NOTCH_RADIUS - strokeWidth;
    const lip = (3 * strokeWidth) / 2; // flare arc radius, proportional to the stroke

    // No tab (none requested, or the stroke shrank it away) — single straight run up.
    if (!hasLeftNotch || r <= 0) {
        return [`v ${-(edgeStart - edgeEnd)}`];
    }

    // Build the tab span from its centre: one lip arc + one radius on each side.
    const notchBottom = NOTCH_OFFSET_Y + r + lip; // where the tab begins (lower, reached first)
    const notchTop = NOTCH_OFFSET_Y - r - lip; // where the tab ends (upper)

    // Fall back to a straight edge if the tab wouldn't fit between the two corners.
    if (notchBottom > edgeStart || notchTop < edgeEnd) {
        return [`v ${-(edgeStart - edgeEnd)}`];
    }

    return [
        `v ${-(edgeStart - notchBottom)}`, // 1. flat run up to where the tab begins
        `a ${lip} ${lip} 0 0 0 ${-lip} ${-lip}`, // 2. lip arc: peel the edge outwards (−x)
        `a ${r} ${r} 0 0 1 0 ${-2 * r}`, // 3. semicircle: the convex tab bulging out (−x)
        `a ${lip} ${lip} 0 0 0 ${lip} ${-lip}`, // 4. lip arc: bring the edge back in
        `v ${-(notchTop - edgeEnd)}`, // 5. remaining flat run up to the top-left corner
    ];
}

/**
 * Cavity roof segment, right → left.
 * Draws a smaller arc tab (hasNestedTopNotch) protruding DOWN into the cavity.
 * Width is reduced by 2*s so it fits inside the nested-bottom groove.
 *
 * @param strokeWidth        - Stroke width in SVG units
 * @param width              - Total outer width of the brick
 */
function segTailCavityRoof(strokeWidth: number, width: number): string[] {
    const span = width - TAIL_INDENT_W - strokeWidth;

    // Nested-top is the SMALLER tab: width reduced by 2*strokeWidth for interlocking
    const tabWidth = NOTCH_WIDTH - 2 * strokeWidth;

    if (tabWidth <= 0) {
        return [`h ${-span}`];
    }

    // Tab left edge at absolute x = TAIL_INDENT_W + NOTCH_OFFSET_X + strokeWidth
    // flatBefore: from the cavity right wall to the tab's right edge
    // flatAfter:  from the tab's left edge to the cavity left wall
    // Add strokeWidth/2 because the inner brick's visual offset starts at TAIL_INDENT_W + strokeWidth,
    // but the cavity wall path is at TAIL_INDENT_W + strokeWidth/2
    const r = NOTCH_WIDTH / 2;
    const offset = NOTCH_OFFSET_X - r + strokeWidth / 2;
    const flatBefore = span - (offset + NOTCH_WIDTH - strokeWidth);
    const flatAfter = offset + strokeWidth;

    return [
        `h ${-flatBefore}`, // flat run to tab right edge
        ...buildVTab(tabWidth),
        `h ${-flatAfter}`, // flat run to cavity left wall
    ];
}

function segTailCavityLeft(strokeWidth: number, nestHeight: number): string[] {
    // Grows s/2 per seam: starts s/2 below the inset roof, ends s/2 above the inset floor.
    return [`v ${nestHeight + strokeWidth / 2 + strokeWidth / 2}`];
}

/**
 * Cavity foot segment, left → right.
 * Draws a full-size arc groove cutting DOWN into the foot.
 * Full-size so it receives the inner brick's bottom tab.
 *
 * @param strokeWidth          - Stroke width in SVG units
 */
function segTailFoot(strokeWidth: number): string[] {
    const span = TAIL_STEP_W - TAIL_INDENT_W;

    // +strokeWidth/2 offsets the nested notch to align with the inserted inner brick.
    const r = NOTCH_WIDTH / 2;
    const offset = NOTCH_OFFSET_X - r + strokeWidth / 2;
    const flatBefore = offset;
    const flatAfter = span - offset - NOTCH_WIDTH;

    return [
        `h ${flatBefore}`, // flat run to groove left edge
        ...buildVGroove(),
        `h ${flatAfter}`, // flat run to step right wall
    ];
}

function segTailStepRight(): string[] {
    return [`v ${TAIL_STEP_H}`];
}

/**
 * Bottom of the tail step (nesting bricks only), right → left.
 * Draws a smaller arc tab protruding downward, same shape as segHeadBottom.
 *
 * @param strokeWidth    - Stroke width in SVG units
 * @param hasBottomNotch - Whether to draw the bottom notch tab
 */
function segTailStepBottom(strokeWidth: number, hasBottomNotch: boolean): string[] {
    // No notch — single flat span going left.
    if (!hasBottomNotch) {
        return [`h ${-TAIL_STEP_W}`];
    }

    // Tab is narrower than the groove by strokeWidth on each side for stroke interlocking
    const tabWidth = NOTCH_WIDTH - 2 * strokeWidth;

    if (tabWidth <= 0) {
        return [`h ${-TAIL_STEP_W}`];
    }

    // Absolute center is NOTCH_OFFSET_X, adjusting for the TAIL_STEP_W inward shift.
    const r = NOTCH_WIDTH / 2;
    const flatBefore = TAIL_STEP_W - NOTCH_OFFSET_X - r + 1.5 * strokeWidth;
    const flatAfter = NOTCH_OFFSET_X - r + strokeWidth / 2;

    return [
        `h ${-flatBefore}`, // flat run to tab right edge
        ...buildVTab(tabWidth),
        `h ${-flatAfter}`, // flat run to step left wall
    ];
}

/**
 * Computes the bounding boxes for each visual region of a brick (label, nesting area,
 * params, and args), applying minimum dimension constraints and aligning each region
 * to its corresponding slot in the outline geometry.
 */
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

        const strokeWidth = input.strokeWidth;
        const hasNesting = input.nestingDims !== undefined;

        const hasTopNotch = input.hasTopNotch ?? false;
        const hasBottomNotch = input.hasBottomNotch ?? false;
        const hasLeftNotch = input.hasLeftNotch ?? false;

        const argNotchCentreYs = computeArgNotchCentreYs(input.paramArgDims, minimums.minArgHeight);

        // Without nesting: top → right → bottom → left → close
        // With nesting:    top → right → cavityRoof → cavityLeft → foot → stepRight → stepBottom → left → close
        const segments = !hasNesting
            ? [
                  ...segTopEdge(strokeWidth, width, hasTopNotch),
                  ...segHeadRight(strokeWidth, headHeight, argNotchCentreYs),
                  ...segHeadBottom(strokeWidth, width, hasBottomNotch),
                  ...segLeftEdge(strokeWidth, height, hasLeftNotch),
                  'Z',
              ]
            : [
                  ...segTopEdge(strokeWidth, width, hasTopNotch),
                  ...segHeadRight(strokeWidth, headHeight, argNotchCentreYs),
                  ...segTailCavityRoof(strokeWidth, width),
                  ...segTailCavityLeft(strokeWidth, nestHeight),
                  ...segTailFoot(strokeWidth),
                  ...segTailStepRight(),
                  ...segTailStepBottom(strokeWidth, hasBottomNotch),
                  ...segLeftEdge(strokeWidth, height, hasLeftNotch),
                  'Z',
              ];

        const path = segments.join(' ');

        const bounds = generateBounds(input, width, headHeight, nestHeight, hasNesting, minimums);

        return {
            path,
            width,
            height,
            bounds,
        };
    };
}
