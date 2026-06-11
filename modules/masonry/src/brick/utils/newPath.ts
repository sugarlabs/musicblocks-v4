// ────────────────────────── Types ──────────────────────────

interface Size {
    w: number;
    h: number;
}

interface Point {
    x: number;
    y: number;
}

export interface BrickOutlineInput {
    mainLabel: Size;
    paramLabels: Size[];
    args: Size[];
    nestings: Size[];
}

export interface BrickOutlineInput2 {
    /**
     * Stroke width of the outline. The outline is drawn inset by `strokeWidth / 2`
     * so the stroke stays inside the reported width/height instead of being clipped.
     * Pass 0 for no inset (original geometry).
     */
    strokeWidth: number;
    /** Dimensions of the main label text area */
    labelMainDims: Size;
    /** One entry per argument slot; each pairs a parameter label with its argument */
    paramArgDims: {
        /** Dimensions of the parameter label; null if the slot has no label (uses MIN_PARAM_H) */
        param: Size | null;
        /** Dimensions of the argument area; null if the slot has no argument (uses MIN_ARG_H) */
        arg: Size | null;
    }[];
    /**
     * Dimensions of the nested content area.
     * - `undefined` — no nesting, tail is not rendered
     * - `null` — nesting exists but content dimensions are unknown; falls back to MIN_NEST_HEIGHT
     * - `Size` — nesting exists with known content dimensions
     */
    nestingDims?: Size | null;
}

export interface BrickOutlineOutput {
    path: string;
    width: number;
    height: number;
}

export interface BrickOutlineOutput2 {
    /** SVG path string tracing the brick outline */
    path: string;
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick */
    height: number;
    /** Debug overlay rectangles for each layout region; only present when showMarkers is true */
    markers?: {
        /** Rect covering the main label area */
        labelMain: string;
        /** Rects covering each parameter label area; absent when no params are provided */
        labelParams?: string[];
        /** Rects covering each argument area; absent when no args are provided */
        args?: string[];
        /** Rect covering the nesting cavity; absent when there is no nesting */
        nesting?: string;
    };
}

// ────────────────────────── Constants ──────────────────────────

const MIN_HEIGHT = 40;
const PADDING = 8;
const NEST_INDENT = 16;

// ── Minimums ──
/** Minimum total outer width of the brick */
const MIN_WIDTH = 100;
/** Minimum height of the main label content */
const MIN_LABEL_MAIN_H = 20;
/** Minimum height of the nesting cavity */
const MIN_NEST_HEIGHT = 40;
/** Minimum height reserved for a null param slot */
const MIN_PARAM_H = 15;
/** Minimum height reserved for a null arg slot */
const MIN_ARG_H = 40;

// ── Head padding ──
/** Distance from the top edge of the head to its inner content */
const HEAD_PAD_Y1 = 10;
/** Distance from the bottom edge of the head to its inner content */
const HEAD_PAD_Y2 = 10;
/** Distance from the left edge of the head to its inner content */
const HEAD_PAD_X1 = 10;
/** Distance from the right edge of the head to its inner content */
const HEAD_PAD_X2 = 10;

// ── Gutters ──
/** Horizontal gap between the main label and the parameter labels */
const LABEL_PARAM_GUTTER_X = 10;
/** Vertical gap between stacked parameter labels */
const PARAM_GUTTER_Y = 10;

// ── Tail ──
/** Horizontal width of the tail's indent step that forms the nesting cavity notch */
const TAIL_INDENT_W = 10;
/** Height of the closing foot bar at the bottom of the tail */
const TAIL_FOOT_H = 10;
/** Width of the closing foot bar at the bottom of the tail */
const TAIL_FOOT_W = 40;

// ────────────────────────── Dimension Calculation ──────────────────────────

interface ComputedDimensions {
    width: number;
    height: number;
    topBarHeight: number;
    nestHeight: number;
    footerHeight: number;
    footerWidth: number;
}

interface ComputedDimensions2 {
    /** Total outer width of the brick */
    width: number;
    /** Total outer height of the brick (headHeight + tailHeight) */
    height: number;
    /** Height of the top head section containing labels and args */
    headHeight: number;
    /** Height of the nesting cavity between the head and the tail foot; 0 when no nesting */
    nestHeight: number;
}

/**
 * Computes the outer dimensions of the brick from the inner element sizes.
 *
 * Layout: all inner elements (mainLabel, paramLabels, args) sit side by side
 * horizontally in a single row. Nestings stack vertically below.
 */
export function computeDimensions(input: BrickOutlineInput): ComputedDimensions {
    const hasNesting = input.nestings.length > 0;

    // ── Top bar width: sum of main label + widest parameter + padding ──
    const maxParamWidth =
        input.paramLabels.length > 0 ? Math.max(...input.paramLabels.map((p) => p.w)) : 0;

    const paramGap = maxParamWidth > 0 ? PADDING : 0;
    const innerWidthSum = input.mainLabel.w + paramGap + maxParamWidth;
    const topBarWidth = PADDING + innerWidthSum + PADDING;

    // ── Top bar height: max of (mainLabel, stacked params, stacked args) ──
    const paramsTotalHeight = input.paramLabels.reduce((sum, p) => sum + p.h, 0);
    const argsTotalHeight = input.args.reduce((sum, a) => sum + a.h, 0);

    const maxInnerHeight = Math.max(input.mainLabel.h, paramsTotalHeight, argsTotalHeight);

    const topBarHeight = Math.max(MIN_HEIGHT, PADDING + maxInnerHeight + PADDING);

    // ── Nesting dimensions ──
    let nestHeight = 0;
    let footerHeight = 0;
    let footerWidth = 0;

    if (hasNesting) {
        const totalNestingHeight = input.nestings.reduce((sum, n) => sum + n.h, 0);
        nestHeight = Math.max(MIN_NEST_HEIGHT, totalNestingHeight);

        const maxNestingWidth =
            input.nestings.length > 0 ? Math.max(...input.nestings.map((n) => n.w)) : 0;
        const nestCavityWidth = NEST_INDENT + maxNestingWidth + PADDING;

        footerHeight = MIN_HEIGHT;
        footerWidth = Math.max(MIN_WIDTH, nestCavityWidth);
    }

    // ── Total outer dimensions ──
    const width = Math.max(MIN_WIDTH, topBarWidth, footerWidth);
    const height = hasNesting
        ? topBarHeight + nestHeight + footerHeight
        : Math.max(MIN_HEIGHT, topBarHeight);

    return { width, height, topBarHeight, nestHeight, footerHeight, footerWidth };
}

export function computeDimensions2(input: BrickOutlineInput2): ComputedDimensions2 {
    const params = input.paramArgDims.map((p) => p.param ?? { w: 0, h: MIN_PARAM_H });
    const args = input.paramArgDims.map((p) => p.arg ?? { w: 0, h: MIN_ARG_H });

    const strokeWidth = input.strokeWidth;

    // ── Width ──
    // Each content box reserves s/2 of stroke clearance on its left and right edges
    // (s/2 + s/2 per box) so the inset outline's stroke is not clipped.
    const maxParamWidth = params.length > 0 ? Math.max(...params.map((p) => p.w)) : 0;
    const labelParamGutter = maxParamWidth > 0 ? LABEL_PARAM_GUTTER_X : 0;
    const headWidth =
        strokeWidth / 2 +
        HEAD_PAD_X1 + HEAD_PAD_X2 + input.labelMainDims.w + labelParamGutter + maxParamWidth +
        strokeWidth / 2;

    const tailWidth =
        strokeWidth / 2 + TAIL_INDENT_W + (input.nestingDims?.w ?? 0) + strokeWidth / 2;

    const width = Math.max(headWidth, tailWidth, MIN_WIDTH);

    // ── Height of head ──
    const paramsTotalHeight = params.reduce((sum, p) => sum + p.h, 0);
    const paramGutterTotal = PARAM_GUTTER_Y * Math.max(0, params.length - 1);
    // Reserve a strokeWidth gap between stacked args so adjacent arg bricks' strokes
    // sit side by side without overlapping (mirrors the stroke spacing in path.ts).
    const argGutterTotal = strokeWidth * Math.max(0, args.length - 1);
    const argsTotalHeight = args.reduce((sum, a) => sum + a.h, 0) + argGutterTotal;

    const headHeight = Math.max(
        Math.max(input.labelMainDims.h, MIN_LABEL_MAIN_H) + HEAD_PAD_Y1 + HEAD_PAD_Y2,
        HEAD_PAD_Y1 + HEAD_PAD_Y2 + paramsTotalHeight + paramGutterTotal,
        argsTotalHeight,
    );

    // ── Height of tail ──
    const hasNesting = input.nestingDims !== undefined;
    const nestHeight = hasNesting ? Math.max(input.nestingDims?.h ?? 0, MIN_NEST_HEIGHT) : 0;
    const tailHeight = hasNesting ? nestHeight + TAIL_FOOT_H : 0;

    // Only the outer perimeter gains clearance: the head↔tail seam is interior, so
    // strokeWidth is added once to the total (s/2 top + s/2 bottom), not to headHeight.
    const height = headHeight + tailHeight + strokeWidth;

    return { width, height, headHeight, nestHeight};
}

// ────────────────────────── Outline Generation ──────────────────────────

/**
 * Generates the sequence of coordinates that trace the brick's outer boundary.
 *
 * @param dims - The precomputed layout dimensions
 * @param hasNesting - Whether the brick has nested children (compound style)
 * @returns An array of coordinates tracing the perimeter clockwise
 */
function generateOutlinePoints(dims: ComputedDimensions, hasNesting: boolean): Point[] {
    const { width, height, topBarHeight, nestHeight, footerWidth } = dims;
    const points: Point[] = [];

    // 1. Top edge (left to right)
    points.push({ x: 0, y: 0 });
    points.push({ x: width, y: 0 });

    // 2. Right side (top to bottom)
    if (!hasNesting) {
        // Simple brick: straight vertical right edge
        points.push({ x: width, y: height });
    } else {
        // Compound brick: trace the C-shaped nesting cavity
        // Down the top bar's right edge
        points.push({ x: width, y: topBarHeight });
        // Inward (left) to form the cavity roof
        points.push({ x: NEST_INDENT, y: topBarHeight });
        // Down the cavity's left vertical spine
        points.push({ x: NEST_INDENT, y: topBarHeight + nestHeight });
        // Outward (right) to form the cavity floor
        points.push({ x: footerWidth, y: topBarHeight + nestHeight });
        // Down the footer's right edge
        points.push({ x: footerWidth, y: height });
    }

    // 3. Bottom edge (right to left)
    // Moves to the bottom-left corner
    points.push({ x: 0, y: height });

    // 4. Left side (bottom to top)
    // We omit the final point at (0, 0) because the SVG 'Z' command
    // will automatically close the path with a straight line.

    return points;
}

// ────────────────────────── SVG Path Conversion ──────────────────────────

/**
 * Converts an array of {x, y} coordinates into an SVG path string.
 * Uses M (move to start), L (line to each point), and Z (close path).
 */
function pointsToPath(points: Point[]): string {
    if (points.length === 0) return '';

    const [start, ...rest] = points;
    const segments = [`M ${start.x} ${start.y}`];

    for (const pt of rest) {
        segments.push(`L ${pt.x} ${pt.y}`);
    }

    segments.push('Z');
    return segments.join(' ');
}

// ────────────────────────── Public API ──────────────────────────

/**
 * Generates a brick outline SVG path from its inner dimension properties.
 *
 * @param input - The dimensions of the brick's inner elements
 * @returns The SVG path string and computed outer dimensions
 */
export function generateBrickOutline(input: BrickOutlineInput): BrickOutlineOutput {
    // 1. Calculate dimensions
    const dims = computeDimensions(input);
    const hasNesting = input.nestings.length > 0;

    // 2. Generate geometry points
    const points = generateOutlinePoints(dims, hasNesting);

    // 3. Convert to SVG path
    const path = pointsToPath(points);

    return {
        path,
        width: dims.width,
        height: dims.height,
    };
}

// ────────────────────────── Path Segments ──────────────────────────

// The whole outline is inset by s/2: it starts at (s/2, s/2) and every full-span
// edge is shortened by s (s/2 of clearance at each end).
function segTopEdge(width: number, strokeWidth: number): string[] {
    return [`m ${strokeWidth / 2} ${strokeWidth / 2}`, `h ${width - strokeWidth}`];
}

// The head's right edge runs from the top inset down to the cavity-roof seam.
// Both ends shift down by s/2, so its length equals headHeight unchanged.
function segHeadRight(headHeight: number): string[] {
    return [`v ${headHeight}`];
}

function segHeadBottom(width: number, strokeWidth: number): string[] {
    return [`h ${-(width - strokeWidth)}`];
}

function segLeftEdge(height: number, strokeWidth: number): string[] {
    return [`v ${-(height - strokeWidth)}`];
}

// Tail edges keep their nominal feature sizes, but the concave cavity shrinks by
// s/2 per wall (insetting the solid pushes its notch walls into the cavity): the
// roof, spine and floor each move inward, and the freed s is absorbed by the foot.
function segTailCavityRoof(width: number, strokeWidth: number): string[] {
    return [`h ${-(width - TAIL_INDENT_W - strokeWidth)}`];
}

function segTailCavityLeft(nestHeight: number, strokeWidth: number): string[] {
    return [`v ${nestHeight - strokeWidth}`];
}

function segTailFootStep(strokeWidth: number): string[] {
    return [`h ${TAIL_FOOT_W - TAIL_INDENT_W - strokeWidth}`];
}

function segTailFootRight(strokeWidth: number): string[] {
    return [`v ${TAIL_FOOT_H + strokeWidth}`];
}

function segTailBottom(strokeWidth: number): string[] {
    return [`h ${-(TAIL_FOOT_W - strokeWidth)}`];
}

function generateMarkers(
    input: BrickOutlineInput2,
    width: number,
    headHeight: number,
    nestHeight: number,
    hasNesting: boolean,
): BrickOutlineOutput2['markers'] {
    // Anchors are positioned relative to the now-inset outline: distances from the
    // top/left edges gain s/2, and the right edge sits at (width - s/2).
    const s = input.strokeWidth;
    const mainLabelRect = [
        `M ${HEAD_PAD_X1 + s / 2} ${HEAD_PAD_Y1 + s / 2}`,
        `h ${input.labelMainDims.w}`,
        `v ${input.labelMainDims.h}`,
        `h ${-input.labelMainDims.w}`,
        'Z',
    ].join(' ');

    let nestingRect: string | undefined;
    if (hasNesting) {
        const nestingW = input.nestingDims?.w ?? 0;
        // The nested child is its own brick with stroke s. Inset its outline a full s
        // inside the parent's cavity outline (s/2 for the parent stroke + s/2 for the
        // child stroke) so the two strokes sit adjacent without ever overlapping.
        nestingRect = [
            `M ${TAIL_INDENT_W + 1.5 * s} ${headHeight + 1.5 * s}`,
            `h ${nestingW - s}`,
            `v ${nestHeight - 3 * s}`,
            `h ${-(nestingW - s)}`,
            'Z',
        ].join(' ');
    }

    const paramRects: string[] = [];
    const argRectList: string[] = [];
    let y = 0;

    for (const { param, arg } of input.paramArgDims) {
        const rowH = arg?.h ?? MIN_ARG_H;

        if (arg !== null) {
            // Each arg is its own brick with stroke s, sitting to the right of the
            // parent. Place its outline at width + s/2 so the arg's stroke edge meets
            // the parent's outer stroke edge (x = width) — adjacent, never overlapping.
            argRectList.push(
                [`M ${width + s / 2} ${y + s / 2}`, `h ${arg.w}`, `v ${arg.h}`, `h ${-arg.w}`, 'Z'].join(
                    ' ',
                ),
            );
        }

        if (param !== null) {
            const paramY = y + (rowH - param.h) / 2 + s / 2;
            const x = width - s / 2 - HEAD_PAD_X2 - param.w;
            paramRects.push(
                [`M ${x} ${paramY}`, `h ${param.w}`, `v ${param.h}`, `h ${-param.w}`, 'Z'].join(' '),
            );
        }

        // Advance past this row plus the strokeWidth gap reserved between arg bricks
        // (matches argGutterTotal in computeDimensions2).
        y += rowH + s;
    }

    return {
        labelMain: mainLabelRect,
        labelParams: paramRects.length > 0 ? paramRects : undefined,
        args: argRectList.length > 0 ? argRectList : undefined,
        nesting: nestingRect,
    };
}

/**
 * Generates a brick outline SVG path from its inner dimension properties.
 *
 * @param input - The dimensions of the brick's inner elements
 * @param showMarkers - Whether to include marker elements for debugging layout
 * @returns The SVG path string and computed outer dimensions
 */
export function generateBrickOutline2(
    input: BrickOutlineInput2,
    showMarkers: boolean = false,
): BrickOutlineOutput2 {
    const { width, height, headHeight, nestHeight } = computeDimensions2(input);
    const hasNesting = input.nestingDims !== undefined;
    const s = input.strokeWidth;

    const segments = !hasNesting
        ? [
              ...segTopEdge(width, s),
              ...segHeadRight(headHeight),
              ...segHeadBottom(width, s),
              ...segLeftEdge(height, s),
              'z',
          ]
        : [
              ...segTopEdge(width, s),
              ...segHeadRight(headHeight),
              ...segTailCavityRoof(width, s),
              ...segTailCavityLeft(nestHeight, s),
              ...segTailFootStep(s),
              ...segTailFootRight(s),
              ...segTailBottom(s),
              ...segLeftEdge(height, s),
              'z',
          ];

    const path = segments.join(' ');
    const markers = showMarkers
        ? generateMarkers(input, width, headHeight, nestHeight, hasNesting)
        : undefined;

    return { path, width, height, markers };
}
