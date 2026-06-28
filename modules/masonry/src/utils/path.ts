/**
 * Brick outline geometry utility.
 *
 * Translates raw dimension inputs — stroke width, widget size, param/arg slot sizes, and an
 * optional nesting cavity size — into an SVG path string and a set of layout bounds.
 *
 * This module is intentionally agnostic of brick semantics (value, expression, statement).
 * It only understands geometry; all structural constraints and type rules live upstream.
 *
 * The API is two-step by design: `new BrickOutlineGenerator(minimums)` binds the size minimums
 * once (making the instance safe to memoize), and `generate` / `computeDimensions` are cheap to
 * call on every render.
 *
 * All generated paths trace the brick outline in **clockwise** winding order (SVG y-down space),
 * starting from the top-left corner and proceeding one named segment at a time.
 */

import type {
    Bounds,
    BrickComputedDimensions,
    BrickMinimums,
    BrickOutlineInput,
    BrickOutlineOutput,
    Point,
} from '@/@types/brick.types';

// ────────────────────────── Dimension Calculation ────────────────────────────────────────────────

interface NormalizedInput extends Omit<
    BrickOutlineInput,
    'hasPrevNotch' | 'hasNextNotch' | 'hasOutputNotch'
> {
    hasNesting: boolean;
    hasPrevNotch: boolean;
    hasNextNotch: boolean;
    hasOutputNotch: boolean;
}

export class BrickOutlineGenerator {
    // ── Head padding ──
    /** Distance from the top edge of the head to its inner content */
    protected static readonly HEAD_PAD_Y1 = 6;
    /** Distance from the bottom edge of the head to its inner content */
    protected static readonly HEAD_PAD_Y2 = 6;
    /** Distance from the left edge of the head to its inner content */
    protected static readonly HEAD_PAD_X1 = 12;
    /** Distance from the right edge of the head to its inner content */
    protected static readonly HEAD_PAD_X2 = 12;

    // ── Gutters ──
    /** Horizontal gap between the main widget and the parameter labels */
    protected static readonly WIDGET_PARAM_GUTTER_X = 12;
    /** Vertical gap between stacked parameter labels */
    protected static readonly PARAM_GUTTER_Y = 12;

    // ── Tail ──
    /** Horizontal width of the tail's indent that forms the nesting cavity notch */
    protected static readonly TAIL_INDENT_W = 8;
    /** Total width of the closing step at the bottom of the tail */
    protected static readonly TAIL_STEP_W = 48;
    /** Height of the closing step at the bottom of the tail */
    protected static readonly TAIL_STEP_H = 12;

    // ── Notch geometry ──
    // V-notches (top/bottom/nested horizontal edges): semicircular groove or tab.
    // H-notches (left/right vertical edges): semicircular groove or tab.
    // Groove radius = tab radius + strokeWidth (accounts for SVG stroke bleed).
    // Lip arc radii are derived from strokeWidth at each call site.

    /** Centre-line radius for convex V-notch tabs. */
    protected static readonly V_NOTCH_RADIUS = 2;
    /** End-to-end centre-line width for V-notches. */
    protected static readonly V_NOTCH_WIDTH = 16;
    /** x-offset from the left edge (or TAIL_INDENT_W for nested notches) to a V-notch centre. */
    protected static readonly V_NOTCH_OFFSET_X = 18;

    /** Centre-line radius for convex H-notch tabs. */
    protected static readonly H_NOTCH_RADIUS = 2;
    /** End-to-end centre-line width for H-notches. */
    protected static readonly H_NOTCH_WIDTH = 16;
    /** y-offset from the top of an arg slot down to an H-notch centre. */
    protected static readonly H_NOTCH_OFFSET_Y = 16;

    // ── Corner geometry ──
    // Each edge pulled in by CORNER_RADIUS with a quarter-circle arc.
    // Cavity corners use CORNER_RADIUS + strokeWidth (accounts for SVG stroke bleed).

    /** Radius of the brick's rounded outer (convex) corners. */
    protected static readonly CORNER_RADIUS = 4;

    private input: NormalizedInput = {
        strokeWidth: 0,
        widgetDims: { w: 0, h: 0 },
        paramArgDims: [],
        hasNesting: false,
        hasPrevNotch: false,
        hasNextNotch: false,
        hasOutputNotch: false,
    };

    private dimensions: BrickComputedDimensions = {
        width: 0,
        height: 0,
        headWidth: 0,
        headHeight: 0,
        nestWidth: 0,
        nestHeight: 0,
        tailWidth: 0,
        tailHeight: 0,
    };

    public constructor(private readonly minimums: BrickMinimums) {}

    private normalizeInput(input: BrickOutlineInput): NormalizedInput {
        const hasNesting = input.nestingDims !== undefined;
        const hasPrevNotch = input.hasPrevNotch ?? false;
        const hasNextNotch = input.hasNextNotch ?? false;
        const hasOutputNotch = input.hasOutputNotch ?? false;

        return {
            ...input,
            hasNesting,
            hasPrevNotch,
            hasNextNotch,
            hasOutputNotch,
        };
    }

    /**
     * Shallow-plus-array equality for two `NormalizedInput` objects.
     * Avoids JSON serialisation on the render-critical path.
     */
    private inputsEqual(a: NormalizedInput, b: NormalizedInput): boolean {
        if (
            a.strokeWidth !== b.strokeWidth ||
            a.hasNesting !== b.hasNesting ||
            a.hasPrevNotch !== b.hasPrevNotch ||
            a.hasNextNotch !== b.hasNextNotch ||
            a.hasOutputNotch !== b.hasOutputNotch ||
            a.widgetDims.w !== b.widgetDims.w ||
            a.widgetDims.h !== b.widgetDims.h ||
            (a.nestingDims?.w ?? null) !== (b.nestingDims?.w ?? null) ||
            (a.nestingDims?.h ?? null) !== (b.nestingDims?.h ?? null) ||
            a.paramArgDims.length !== b.paramArgDims.length
        ) {
            return false;
        }
        return a.paramArgDims.every((row, i) => {
            const bRow = b.paramArgDims[i];
            return (
                (row.param?.w ?? null) === (bRow.param?.w ?? null) &&
                (row.param?.h ?? null) === (bRow.param?.h ?? null) &&
                (row.arg?.w ?? null) === (bRow.arg?.w ?? null) &&
                (row.arg?.h ?? null) === (bRow.arg?.h ?? null)
            );
        });
    }

    // ────────────────────────── Arc Helpers ──────────────────────────────────────────────────────

    /**
     * Relative SVG arc (`a`) from `end` and `centre` (both relative to the start);
     * radius and sweep derived. Limited to a quarter turn.
     */
    private arc(end: Point, centre: Point): string {
        const radius = Math.hypot(centre.x, centre.y);
        // Cross product of (start→centre) and (start→end), with start at the origin.
        // Negative ⇒ the turn is clockwise ⇒ SVG sweep flag 1 (in y-down space).
        const sweepFlag = centre.y * end.x - centre.x * end.y < 0 ? 1 : 0;
        return `a ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}`;
    }

    /** Inward U-shape groove arc (left → right). Used by top notch and nested bottom notch. */
    private buildVGroove(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const lip = strokeWidth / 2;
        const R = BrickOutlineGenerator.V_NOTCH_RADIUS + strokeWidth;
        const middle = BrickOutlineGenerator.V_NOTCH_WIDTH - 2 * (lip + R);
        return [
            // Quarter-arc: horizontal (left) → vertical (down). CW
            this.arc({ x: lip, y: lip }, { x: lip, y: 0 }),
            // Inner curve and straight span: vertical (down) → vertical (up). CCW (U-shape)
            this.arc({ x: R, y: R }, { x: 0, y: R }),
            `h ${middle}`,
            this.arc({ x: R, y: -R }, { x: R, y: 0 }),
            // Quarter-arc: vertical (up) → horizontal (right). CW
            this.arc({ x: lip, y: -lip }, { x: 0, y: -lip }),
        ];
    }

    /** Outward U-shape tab arc (right → left). Used by bottom notch and nested top notch. */
    private buildVTab(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const lip = (3 * strokeWidth) / 2;
        const R = BrickOutlineGenerator.V_NOTCH_RADIUS;
        const middle = BrickOutlineGenerator.V_NOTCH_WIDTH - 2 * (lip + R);
        return [
            // Quarter-arc: horizontal (right) → vertical (down). CCW
            this.arc({ x: -lip, y: lip }, { x: -lip, y: 0 }),
            // Inner curve and straight span: vertical (down) → vertical (up). CW (U-shape)
            this.arc({ x: -R, y: R }, { x: 0, y: R }),
            `h ${-middle}`,
            this.arc({ x: -R, y: -R }, { x: -R, y: 0 }),
            // Quarter-arc: vertical (up) → horizontal (left). CCW
            this.arc({ x: -lip, y: -lip }, { x: 0, y: -lip }),
        ];
    }

    // ────────────────────────── Path Segments ────────────────────────────────────────────────────

    /**
     * Top edge of the brick, left → right.
     * Draws a full-size arc groove (hasPrevNotch) for interlocking with bricks above.
     * The groove cuts INWARD into the brick body.
     */
    private segTopEdge(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { width } = this.dimensions;
        const hasPrevNotch = this.input.hasPrevNotch;
        // Start point sits after the rounded top-left corner: inset by strokeWidth/2 and CORNER_RADIUS.
        const start = `M ${strokeWidth / 2 + BrickOutlineGenerator.CORNER_RADIUS} ${strokeWidth / 2}`;
        // Convex top-right corner: end CR right + CR down, curving around a centre CR to the right.
        const corner = this.arc(
            { x: BrickOutlineGenerator.CORNER_RADIUS, y: BrickOutlineGenerator.CORNER_RADIUS },
            { x: BrickOutlineGenerator.CORNER_RADIUS, y: 0 },
        );

        // No notch — single flat span, inset by strokeWidth/2 + CORNER_RADIUS at each end.
        if (!hasPrevNotch) {
            const length =
                width -
                strokeWidth -
                BrickOutlineGenerator.CORNER_RADIUS -
                BrickOutlineGenerator.CORNER_RADIUS;
            return [start, `h ${length}`, corner];
        }

        // flatBefore: horizontal run from the starting M position to the notch left edge
        // flatAfter:  horizontal run from the notch right edge to the rounded top-right corner
        const flatBefore =
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;
        const flatAfter =
            width -
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;

        return [
            start,
            // flat run to groove left edge
            `h ${flatBefore}`,
            ...this.buildVGroove(),
            // flat run to brick right edge
            `h ${flatAfter}`,
            corner,
        ];
    }

    /**
     * Right edge of the head, top → bottom.
     * Draws one full-size concave groove per arg slot, cutting INWARD into the brick (−x).
     * Each groove receives one argument brick plugged in from the right.
     */
    private segHeadRight(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { headHeight } = this.dimensions;
        const notchCentres: number[] = [];
        let slotTop = 0;
        for (const { arg } of this.input.paramArgDims) {
            const rowH = Math.max(arg?.h ?? 0, this.minimums.minArgHeight);
            if (arg !== null) {
                notchCentres.push(slotTop + BrickOutlineGenerator.H_NOTCH_OFFSET_Y);
            }
            slotTop += rowH;
        }
        // The edge runs between the two corners, each inset by strokeWidth/2 + CORNER_RADIUS.
        // below the rounded top-right corner
        const edgeStart = strokeWidth / 2 + BrickOutlineGenerator.CORNER_RADIUS;
        // above the rounded bottom-right corner
        const edgeEnd = headHeight - strokeWidth / 2 - BrickOutlineGenerator.CORNER_RADIUS;

        // Convex bottom-right corner: end CR left + CR down, curving around a centre CR below.
        const corner = this.arc(
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: BrickOutlineGenerator.CORNER_RADIUS },
            { x: 0, y: BrickOutlineGenerator.CORNER_RADIUS },
        );

        // No notches — single straight run.
        if (notchCentres.length === 0) {
            return [`v ${edgeEnd - edgeStart}`, corner];
        }

        // small flare arc radius, proportional to the stroke
        const lip = strokeWidth / 2;
        const R = BrickOutlineGenerator.H_NOTCH_RADIUS + strokeWidth;
        const middle = BrickOutlineGenerator.H_NOTCH_WIDTH - 2 * (lip + R);

        const segs: string[] = [];
        // current y of the pen, travelling downwards
        let pen = edgeStart;

        for (const centre of notchCentres) {
            // Build the notch span from its centre, one portion above and below:
            //   centre        — the notch centre
            //   semicircleTop — one radius above the centre
            //   notchTop      — one lip arc above the semicircle (where the groove begins)
            const semicircleTop = centre - middle / 2 - R;
            const notchTop = semicircleTop - lip;
            // ...and symmetrically downwards (where the groove ends):
            const semicircleBottom = centre + middle / 2 + R;
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
            segs.push(this.arc({ x: -lip, y: lip }, { x: 0, y: lip }));
            // 3. semicircle: the concave groove dipping into the brick (−x)
            segs.push(this.arc({ x: -R, y: R }, { x: -R, y: 0 }));
            segs.push(`v ${middle}`);
            segs.push(this.arc({ x: R, y: R }, { x: 0, y: R }));
            // 4. lip arc: bring the edge back out
            segs.push(this.arc({ x: lip, y: lip }, { x: lip, y: 0 }));

            pen = notchBottom;
        }

        // 5. remaining flat run down to the bottom corner
        segs.push(`v ${edgeEnd - pen}`);
        segs.push(corner);
        return segs;
    }

    /**
     * Bottom edge of the head (used for bricks without nesting), right → left.
     * Draws a smaller arc tab (hasNextNotch) protruding OUTWARD below the brick.
     * Width is reduced by 2*s so it fits snugly inside the top groove when bricks stack.
     */
    private segHeadBottom(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { width } = this.dimensions;
        const hasNextNotch = this.input.hasNextNotch;
        const span =
            width -
            strokeWidth -
            BrickOutlineGenerator.CORNER_RADIUS -
            BrickOutlineGenerator.CORNER_RADIUS;

        // Convex bottom-left corner: end CR left + CR up, curving around a centre CR to the left.
        const corner = this.arc(
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: -BrickOutlineGenerator.CORNER_RADIUS },
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: 0 },
        );

        // No notch — single flat span going left.
        if (!hasNextNotch) {
            return [`h ${-span}`, corner];
        }

        if (
            BrickOutlineGenerator.V_NOTCH_WIDTH <=
            2 * ((3 * strokeWidth) / 2 + BrickOutlineGenerator.V_NOTCH_RADIUS)
        ) {
            return [`h ${-span}`, corner];
        }

        const flatBefore =
            width -
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;
        const flatAfter =
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;

        return [
            // flat run to tab right edge
            `h ${-flatBefore}`,
            ...this.buildVTab(),
            // flat run to brick left edge
            `h ${-flatAfter}`,
            corner,
        ];
    }

    /**
     * Left edge of the brick, bottom → top.
     * Draws a single smaller convex tab (hasOutputNotch) protruding OUTWARD from the brick (−x).
     * Tab radius is H_NOTCH_RADIUS; the parent's right groove uses H_NOTCH_RADIUS + strokeWidth.
     */
    private segLeftEdge(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { height } = this.dimensions;
        const hasOutputNotch = this.input.hasOutputNotch;
        // The edge runs between the two corners, each inset by strokeWidth/2 + CORNER_RADIUS; travelled upward.
        // above the rounded bottom-left corner
        const edgeStart = height - strokeWidth / 2 - BrickOutlineGenerator.CORNER_RADIUS;
        // below the rounded top-left corner
        const edgeEnd = strokeWidth / 2 + BrickOutlineGenerator.CORNER_RADIUS;

        const tabR = BrickOutlineGenerator.H_NOTCH_RADIUS;
        const lip = (3 * strokeWidth) / 2;
        const middle = BrickOutlineGenerator.H_NOTCH_WIDTH - 2 * (lip + tabR);

        // Convex top-left corner: end CR right + CR up, curving around a centre CR above.
        const corner = this.arc(
            { x: BrickOutlineGenerator.CORNER_RADIUS, y: -BrickOutlineGenerator.CORNER_RADIUS },
            { x: 0, y: -BrickOutlineGenerator.CORNER_RADIUS },
        );

        if (!hasOutputNotch) {
            return [`v ${-(edgeStart - edgeEnd)}`, corner];
        }

        if (middle <= 0) {
            return [`v ${-(edgeStart - edgeEnd)}`, corner];
        }

        const notchBottom = BrickOutlineGenerator.H_NOTCH_OFFSET_Y + middle / 2 + tabR + lip;
        const notchTop = BrickOutlineGenerator.H_NOTCH_OFFSET_Y - middle / 2 - tabR - lip;

        // Fall back to a straight edge if the tab wouldn't fit between the two corners.
        if (notchBottom > edgeStart || notchTop < edgeEnd) {
            return [`v ${-(edgeStart - edgeEnd)}`, corner];
        }

        return [
            // 1. flat run up to where the tab begins
            `v ${-(edgeStart - notchBottom)}`,
            // 2. lip arc: peel the edge outwards (−x)
            this.arc({ x: -lip, y: -lip }, { x: 0, y: -lip }),
            // 3. semicircle: the convex tab bulging out (−x)
            this.arc({ x: -tabR, y: -tabR }, { x: -tabR, y: 0 }),
            `v ${-middle}`,
            this.arc({ x: tabR, y: -tabR }, { x: 0, y: -tabR }),
            // 4. lip arc: bring the edge back in
            this.arc({ x: lip, y: -lip }, { x: lip, y: 0 }),
            // 5. remaining flat run up to the top-left corner
            `v ${-(notchTop - edgeEnd)}`,
            corner,
        ];
    }

    /**
     * Cavity roof segment, right → left.
     * Draws a smaller arc tab protruding DOWN into the cavity.
     * Width is reduced by 2*s so it fits inside the nested-bottom groove.
     */
    private segTailCavityRoof(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { width } = this.dimensions;
        // The two cavity corners run a stroke-width larger so a nested brick's rounded convex
        // corner seats flush inside them (same idea as groove = tab + strokeWidth).
        const cavityCornerRadius = BrickOutlineGenerator.CORNER_RADIUS + strokeWidth;

        const span =
            width -
            BrickOutlineGenerator.TAIL_INDENT_W -
            strokeWidth -
            BrickOutlineGenerator.CORNER_RADIUS -
            cavityCornerRadius;

        // Concave roof → spine corner: end crc left + crc down, curving around a centre crc to the left.
        const corner = this.arc(
            { x: -cavityCornerRadius, y: cavityCornerRadius },
            { x: -cavityCornerRadius, y: 0 },
        );

        if (
            BrickOutlineGenerator.V_NOTCH_WIDTH <=
            2 * ((3 * strokeWidth) / 2 + BrickOutlineGenerator.V_NOTCH_RADIUS)
        ) {
            return [`h ${-span}`, corner];
        }

        // Tab centre aligns with the inner brick's top/bottom notch centre.
        const flatBefore =
            width -
            BrickOutlineGenerator.TAIL_INDENT_W -
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            (3 * strokeWidth) / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;
        const flatAfter =
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 +
            strokeWidth / 2 -
            cavityCornerRadius;

        return [
            // flat run to tab right edge
            `h ${-flatBefore}`,
            ...this.buildVTab(),
            // flat run to cavity left wall
            `h ${-flatAfter}`,
            corner,
        ];
    }

    private segTailCavityLeft(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const { nestHeight } = this.dimensions;
        const cavityCornerRadius = BrickOutlineGenerator.CORNER_RADIUS + strokeWidth;

        // Grows s/2 per seam: starts s/2 below the inset roof, ends s/2 above the inset floor.
        // Both ends meet concave cavity corners, so each is pulled in by cavityCornerRadius.
        const span =
            nestHeight +
            strokeWidth / 2 +
            strokeWidth / 2 -
            cavityCornerRadius -
            cavityCornerRadius;

        // Concave spine → foot corner: end crc right + crc down, curving around a centre crc below.
        const corner = this.arc(
            { x: cavityCornerRadius, y: cavityCornerRadius },
            { x: 0, y: cavityCornerRadius },
        );

        return [`v ${span}`, corner];
    }

    /**
     * Cavity foot segment, left → right.
     * Draws a full-size arc groove cutting DOWN into the foot.
     * Full-size so it receives the inner brick's bottom tab.
     */
    private segTailFoot(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const cavityCornerRadius = BrickOutlineGenerator.CORNER_RADIUS + strokeWidth;

        const span = BrickOutlineGenerator.TAIL_STEP_W - BrickOutlineGenerator.TAIL_INDENT_W;

        const flatBefore =
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 +
            strokeWidth / 2 -
            cavityCornerRadius;
        const flatAfter =
            span -
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            (3 * strokeWidth) / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;

        // Convex foot → step-right corner: end CR right + CR down, curving around a centre CR to the right.
        const corner = this.arc(
            { x: BrickOutlineGenerator.CORNER_RADIUS, y: BrickOutlineGenerator.CORNER_RADIUS },
            { x: BrickOutlineGenerator.CORNER_RADIUS, y: 0 },
        );

        return [
            // flat run to groove left edge
            `h ${flatBefore}`,
            ...this.buildVGroove(),
            // flat run to step right wall
            `h ${flatAfter}`,
            corner,
        ];
    }

    private segTailStepRight(): string[] {
        // Convex step-right → step-bottom corner: end CR left + CR down, curving around a centre CR below.
        const corner = this.arc(
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: BrickOutlineGenerator.CORNER_RADIUS },
            { x: 0, y: BrickOutlineGenerator.CORNER_RADIUS },
        );
        const CR = BrickOutlineGenerator.CORNER_RADIUS;
        return [`v ${BrickOutlineGenerator.TAIL_STEP_H - CR - CR}`, corner];
    }

    /**
     * Bottom of the tail step (nesting bricks only), right → left.
     * Draws a smaller arc tab (hasNextNotch) protruding downward, same shape as segHeadBottom.
     */
    private segTailStepBottom(): string[] {
        const strokeWidth = this.input.strokeWidth;
        const hasNextNotch = this.input.hasNextNotch;
        const span =
            BrickOutlineGenerator.TAIL_STEP_W -
            BrickOutlineGenerator.CORNER_RADIUS -
            BrickOutlineGenerator.CORNER_RADIUS;

        // Convex step-bottom → left corner: end CR left + CR up, curving around a centre CR to the left.
        const corner = this.arc(
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: -BrickOutlineGenerator.CORNER_RADIUS },
            { x: -BrickOutlineGenerator.CORNER_RADIUS, y: 0 },
        );

        // No notch — single flat span going left.
        if (!hasNextNotch) {
            return [`h ${-span}`, corner];
        }

        if (
            BrickOutlineGenerator.V_NOTCH_WIDTH <=
            2 * ((3 * strokeWidth) / 2 + BrickOutlineGenerator.V_NOTCH_RADIUS)
        ) {
            return [`h ${-span}`, corner];
        }

        const flatBefore =
            BrickOutlineGenerator.TAIL_STEP_W -
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;
        const flatAfter =
            BrickOutlineGenerator.V_NOTCH_OFFSET_X -
            BrickOutlineGenerator.V_NOTCH_WIDTH / 2 -
            strokeWidth / 2 -
            BrickOutlineGenerator.CORNER_RADIUS;

        return [
            // flat run to tab right edge
            `h ${-flatBefore}`,
            ...this.buildVTab(),
            // flat run to step left wall
            `h ${-flatAfter}`,
            corner,
        ];
    }

    /**
     * Computes the bounding boxes for each visual region of a brick (widget, nesting area,
     * params, and args), applying minimum dimension constraints and aligning each region
     * to its corresponding slot in the outline geometry.
     */
    private generateBounds(): BrickOutlineOutput['bounds'] {
        const input = this.input;
        const { width, headHeight, nestHeight } = this.dimensions;
        const hasNesting = this.input.hasNesting;
        const minimums = this.minimums;
        const { minWidgetHeight, minNestHeight, minParamHeight, minArgHeight } = minimums;
        const strokeWidth = input.strokeWidth;

        const widget: Bounds = {
            x: strokeWidth / 2 + BrickOutlineGenerator.HEAD_PAD_X1,
            y: strokeWidth / 2 + BrickOutlineGenerator.HEAD_PAD_Y1,
            w: input.widgetDims.w,
            h: Math.max(input.widgetDims.h, minWidgetHeight),
        };

        let nesting: Bounds | undefined;
        if (hasNesting) {
            nesting = {
                x: BrickOutlineGenerator.TAIL_INDENT_W + strokeWidth / 2 + strokeWidth / 2,
                y: headHeight,
                w: input.nestingDims?.w ?? 0,
                h: Math.max(nestHeight, minNestHeight),
            };
        }

        const params: (Bounds | null)[] = [];
        const args: (Bounds | null)[] = [];
        let y = 0;

        for (const { param, arg } of input.paramArgDims) {
            const rowH = Math.max(arg?.h ?? 0, minArgHeight);

            if (arg !== null) {
                args.push({ x: width, y, w: arg.w, h: rowH });
            } else {
                args.push(null);
            }

            if (param !== null) {
                const paramH = Math.max(param.h, minParamHeight);
                // Centre the param label on its arg notch (H_NOTCH_OFFSET_Y below the row top);
                // fall back to centring within the row when the slot has no arg (no notch).
                const paramCentreY =
                    arg !== null ? BrickOutlineGenerator.H_NOTCH_OFFSET_Y : rowH / 2;
                params.push({
                    x: width - strokeWidth / 2 - BrickOutlineGenerator.HEAD_PAD_X2 - param.w,
                    y: y + paramCentreY - paramH / 2,
                    w: param.w,
                    h: paramH,
                });
            } else {
                params.push(null);
            }

            y += rowH;
        }

        return {
            widget,
            params: params.some((p) => p !== null) ? params : undefined,
            args: args.some((a) => a !== null) ? args : undefined,
            nesting,
        };
    }

    // ────────────────────────── Public API ───────────────────────────────────────────────────────

    /**
     * Computes the overall layout dimensions for a single brick frame.
     *
     * @param input - Stroke width, widget/param/arg dimensions, optional nesting,
     *               and optional previous, next, and output notch flags.
     * @returns Outer width and height, plus head, tail, and nest sub-dimensions.
     */
    public computeDimensions(input: BrickOutlineInput): BrickComputedDimensions {
        const inputNormalised = this.normalizeInput(input);

        const minimums = this.minimums;
        const { minWidth, minWidgetHeight, minNestHeight, minParamHeight, minArgHeight } = minimums;

        const params = inputNormalised.paramArgDims.map(
            (p) => p.param ?? { w: 0, h: minParamHeight },
        );

        // SVG strokes straddle the path line — s/2 bleeds outside on each side;
        // every segment includes s/2 at both ends so the stroke isn't clipped.
        const strokeWidth = inputNormalised.strokeWidth;

        // ── Width ──

        // ── Head ──
        const maxParamWidth = params.length > 0 ? Math.max(...params.map((p) => p.w)) : 0;
        const widgetParamGutter =
            maxParamWidth > 0 ? BrickOutlineGenerator.WIDGET_PARAM_GUTTER_X : 0;
        const headWidth =
            strokeWidth / 2 +
            BrickOutlineGenerator.HEAD_PAD_X1 +
            inputNormalised.widgetDims.w +
            widgetParamGutter +
            maxParamWidth +
            BrickOutlineGenerator.HEAD_PAD_X2 +
            strokeWidth / 2;

        // ── Tail ──
        const tailIndentWidth =
            strokeWidth / 2 +
            BrickOutlineGenerator.TAIL_INDENT_W +
            (inputNormalised.nestingDims?.w ?? 0) +
            strokeWidth / 2;
        const tailStepWidth = strokeWidth / 2 + BrickOutlineGenerator.TAIL_STEP_W + strokeWidth / 2;

        const tailWidth = inputNormalised.hasNesting ? Math.max(tailIndentWidth, tailStepWidth) : 0;

        const width = Math.max(headWidth, tailWidth, minWidth);

        // ── Height ──

        // ── Head ──
        const paramsTotalHeight = params.reduce((sum, p) => sum + p.h, 0);
        const paramGutterTotal =
            BrickOutlineGenerator.PARAM_GUTTER_Y * Math.max(0, params.length - 1);

        const headHeightByWidget =
            strokeWidth / 2 +
            BrickOutlineGenerator.HEAD_PAD_Y1 +
            Math.max(inputNormalised.widgetDims.h, minWidgetHeight) +
            BrickOutlineGenerator.HEAD_PAD_Y2 +
            strokeWidth / 2;
        const headHeightByParams =
            strokeWidth / 2 +
            BrickOutlineGenerator.HEAD_PAD_Y1 +
            paramsTotalHeight +
            paramGutterTotal +
            BrickOutlineGenerator.HEAD_PAD_Y2 +
            strokeWidth / 2;
        // No stroke clearance or padding — args are slots for external components whose
        // input dims already account for their own strokes, if present.
        // Each row must be at least minArgHeight tall, matching generateBounds and
        // segHeadRight so the outline is tall enough for every notch.
        const headHeightByArgs = inputNormalised.paramArgDims.reduce(
            (sum, { arg }) => sum + Math.max(arg?.h ?? 0, minArgHeight),
            0,
        );

        const headHeight = Math.max(headHeightByWidget, headHeightByParams, headHeightByArgs);

        // ── Tail ──
        const nestWidth = inputNormalised.hasNesting ? (input.nestingDims?.w ?? 0) : 0;
        const nestHeight = inputNormalised.hasNesting
            ? Math.max(input.nestingDims?.h ?? 0, minNestHeight)
            : 0;
        const tailHeight = inputNormalised.hasNesting
            ? nestHeight + strokeWidth / 2 + BrickOutlineGenerator.TAIL_STEP_H + strokeWidth / 2
            : 0;

        const height = headHeight + tailHeight;

        return {
            width,
            height,
            headWidth,
            headHeight,
            nestWidth,
            nestHeight,
            tailWidth,
            tailHeight,
        };
    }

    /**
     * Computes the SVG path and layout bounds for a single brick frame.
     *
     * @param input - Stroke width, widget/param/arg dimensions, optional nesting,
     *               and optional previous, next, and output notch flags.
     * @returns SVG path string, outer frame dimensions, content-region bounds,
     *          and notch protrusion depths (for SVG viewBox sizing).
     */
    public generate(input: BrickOutlineInput): BrickOutlineOutput {
        // Recompute dimensions only when the normalised input has actually changed.
        const normalized = this.normalizeInput(input);
        if (!this.inputsEqual(normalized, this.input)) {
            this.input = normalized;
            this.dimensions = this.computeDimensions(input);
        }

        const { width, height } = this.dimensions;

        // Clockwise, segment by segment, starting from the top-left corner:
        // Without nesting: top → right → bottom → left → close
        // With nesting:    top → right → cavityRoof → cavityLeft → foot → stepRight → stepBottom → left → close
        const segments = !this.input.hasNesting
            ? [
                  ...this.segTopEdge(),
                  ...this.segHeadRight(),
                  ...this.segHeadBottom(),
                  ...this.segLeftEdge(),
                  'Z',
              ]
            : [
                  ...this.segTopEdge(),
                  ...this.segHeadRight(),
                  ...this.segTailCavityRoof(),
                  ...this.segTailCavityLeft(),
                  ...this.segTailFoot(),
                  ...this.segTailStepRight(),
                  ...this.segTailStepBottom(),
                  ...this.segLeftEdge(),
                  'Z',
              ];

        const path = segments.join(' ');

        const bounds = this.generateBounds();

        return {
            path,
            width,
            height,
            bounds,
        };
    }
}
