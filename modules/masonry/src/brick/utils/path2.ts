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

// ── Right notch ──
// A concave groove on the right edge that receives a side-attached arg's tab.
// Profile (top → bottom): flat → small lip arc → semicircle → small lip arc → flat.
// The lip arcs round the corners where the vertical edge meets the semicircle; their
// radius scales with the stroke (3s/2) so the flare stays proportional as the stroke
// changes. The semicircle radius is a fixed constant.

/** Radius of the semicircular groove on the right edge */
export const NOTCH_RADIUS = 4;
/** Gap from the top of an argument slot down to its notch centre (shared by the right
 * grooves and the left tab, so they stay aligned). */
export const NOTCH_OFFSET = 9;

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

// ────────────────────────── Path Segments ────────────────────────────────────────────────────────

function segTopEdge(width: number, strokeWidth: number): string[] {
    // All segments inset by s/2: outline starts at (s/2, s/2); full-span edges lose s/2 at each end.
    return [
        `M ${strokeWidth / 2} ${strokeWidth / 2}`,
        `h ${width - strokeWidth / 2 - strokeWidth / 2}`,
    ];
}

/**
 * Right edge of the head, top → bottom.
 * Draws a concave semicircular groove (hasRightNotch) for a side-attached arg.
 *
 * @param headHeight    - Height of the head section
 * @param strokeWidth   - Stroke width in SVG units
 * @param hasRightNotch - Whether to cut the right notch groove
 */
/**
 * Right edge of the head, top → bottom.
 * Draws one concave semicircular groove per entry in `notchCentres` (each value is
 * the absolute y of a notch centre), with flat runs between them.
 *
 * Each groove is built from its centre outwards, one portion at a time:
 *   flat run → lip arc → semicircle → lip arc → flat run.
 *
 * @param headHeight   - Height of the head section
 * @param strokeWidth  - Stroke width in SVG units
 * @param notchCentres - Absolute y positions (top → bottom) of each groove centre
 */
function segHeadRight(headHeight: number, strokeWidth: number, notchCentres: number[]): string[] {
    const s = strokeWidth;

    // The edge runs between the two corners, each inset by s/2 so the stroke isn't clipped.
    const edgeStart = s / 2; // top-right corner (pen arrives here)
    const edgeEnd = headHeight - s / 2; // bottom-right corner

    // ── No notches — single straight run ──
    if (notchCentres.length === 0) {
        return [`v ${edgeEnd - edgeStart}`];
    }

    const r = NOTCH_RADIUS; // semicircle (groove) radius
    const lip = (3 * s) / 2; // small flare arc radius, proportional to the stroke

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
        // 2. lip arc: peel the edge inwards (−x) into the groove
        segs.push(`a ${lip} ${lip} 0 0 1 ${-lip} ${lip}`);
        // 3. semicircle: the concave groove dipping into the brick (−x)
        segs.push(`a ${r} ${r} 0 0 0 0 ${2 * r}`);
        // 4. lip arc: bring the edge back out to the straight line
        segs.push(`a ${lip} ${lip} 0 0 1 ${lip} ${lip}`);

        pen = notchBottom;
    }

    // 5. remaining flat run down to the bottom corner
    segs.push(`v ${edgeEnd - pen}`);
    return segs;
}

function segHeadBottom(width: number, strokeWidth: number): string[] {
    return [`h ${-(width - strokeWidth / 2 - strokeWidth / 2)}`];
}

/**
 * Left edge of the brick, bottom → top.
 * Draws the single convex semicircular tab (at `tabCentre`) where this brick plugs into
 * its parent, bulging OUT of the brick (−x). The tab radius is one stroke width smaller
 * than the groove (NOTCH_RADIUS) so the wider groove receives it cleanly, and the
 * protrusion is deliberately NOT added to the brick's width/height.
 *
 * Mirrors segHeadRight but travels bottom → top, so each portion's displacement is
 * negative and the semicircle bulges out instead of cutting in.
 *
 * @param height       - Total outer height of the brick
 * @param strokeWidth  - Stroke width in SVG units
 * @param tabCentre    - Absolute y of the tab centre, or null for a plain edge
 */
function segLeftEdge(height: number, strokeWidth: number, tabCentre: number | null): string[] {
    const s = strokeWidth;

    // The edge runs between the two corners, each inset by s/2; travelled upward.
    const edgeStart = height - s / 2; // bottom-left corner (pen arrives here)
    const edgeEnd = s / 2; // top-left corner

    // Tab radius = groove radius minus one stroke width, so the wider groove (drawn at
    // NOTCH_RADIUS) receives this tab cleanly once both strokes are accounted for.
    const r = NOTCH_RADIUS - s;
    const lip = (3 * s) / 2; // small flare arc radius, proportional to the stroke (same as the groove's lip)

    // ── No tab (none requested, or the stroke shrank it away) — single straight run up ──
    if (tabCentre === null || r <= 0) {
        return [`v ${-(edgeStart - edgeEnd)}`];
    }

    // Build the tab span from its centre: one lip arc + one radius on each side.
    const notchBottom = tabCentre + r + lip; // where the tab begins (lower, reached first)
    const notchTop = tabCentre - r - lip; // where the tab ends (upper)

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
    input: BrickOutlineInput,
    width: number,
    headHeight: number,
    nestHeight: number,
    hasNesting: boolean,
    minimums: BrickMinimums,
): BrickOutlineOutput['bounds'] {
    const { minLabelHeight, minNestHeight, minParamHeight, minArgHeight } = minimums;
    const strokeWidth = input.strokeWidth;

    // Centre the label on the notch line (NOTCH_OFFSET below the top) so the label
    // lines up with the connection point. For a label-only head this is also its centre.
    const labelH = Math.max(input.labelDims.h, minLabelHeight);
    const label: Bounds = {
        x: strokeWidth / 2 + HEAD_PAD_X1,
        y: NOTCH_OFFSET - labelH / 2,
        w: input.labelDims.w,
        h: labelH,
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
     * @param input - Stroke width, label/param/arg dimensions, optional nesting.
     * @returns SVG path string, outer frame dimensions, and content-region bounds.
     */
    return (input: BrickOutlineInput): BrickOutlineOutput => {
        const { width, height, headHeight, nestHeight } = computeDimensions(input, minimums);

        const hasNesting = input.nestingDims !== undefined;
        const strokeWidth = input.strokeWidth;

        const wantLeft = input.leftNotch ?? false;

        // Constant gap from the top of an argument slot down to that slot's notch centre.
        const offset = NOTCH_OFFSET;

        // ── Right edge: one groove per argument slot ──
        // The presence of an argument is the signal — no separate flag is needed. Walk the
        // slots top → bottom, tracking each slot's top edge. A groove's centre is that slot
        // top plus the constant offset, so every groove stays the same distance below where
        // the previous argument ended (independent of arg heights).
        const rightCentres: number[] = [];
        let slotTop = 0;
        for (const { arg } of input.paramArgDims) {
            const rowH = Math.max(arg?.h ?? 0, minimums.minArgHeight);
            if (arg !== null) {
                const centre = slotTop + offset;
                rightCentres.push(centre);
            }
            slotTop += rowH;
        }

        // ── Left edge: a single tab where this brick plugs into its parent ──
        // Aligned with the TOP right groove: the first slot's top is 0, so its centre is
        // just the offset — independent of the argument count.
        const leftTabCentre = wantLeft ? offset : null;

        const segments = !hasNesting
            ? [
                  ...segTopEdge(width, strokeWidth),
                  ...segHeadRight(headHeight, strokeWidth, rightCentres),
                  ...segHeadBottom(width, strokeWidth),
                  ...segLeftEdge(height, strokeWidth, leftTabCentre),
                  'z',
              ]
            : [
                  ...segTopEdge(width, strokeWidth),
                  ...segHeadRight(headHeight, strokeWidth, rightCentres),
                  ...segTailCavityRoof(width, strokeWidth),
                  ...segTailCavityLeft(nestHeight, strokeWidth),
                  ...segTailFoot(),
                  ...segTailStepRight(),
                  ...segTailStepBottom(),
                  ...segLeftEdge(height, strokeWidth, leftTabCentre),
                  'z',
              ];

        const path = segments.join(' ');

        const bounds = generateBounds(input, width, headHeight, nestHeight, hasNesting, minimums);

        // How far the left tabs protrude beyond the brick's left edge (x = 0).
        // Reported separately so renderers can give it a viewing gutter WITHOUT it
        // counting toward width/height (which would push connected bricks apart).
        const tabRadius = NOTCH_RADIUS - strokeWidth;
        const lip = (3 * strokeWidth) / 2;
        const leftNotchDepth = leftTabCentre !== null && tabRadius > 0 ? lip + tabRadius : 0;

        return { path, width, height, bounds, leftNotchDepth };
    };
}
