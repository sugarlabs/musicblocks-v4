import type { BrickOutlineInput2, BrickOutlineOutput2, Size } from '../../@types/brick';

// ────────────────────────── Types ──────────────────────────

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

export interface BrickOutlineOutput {
    path: string;
    width: number;
    height: number;
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
/** Horizontal width of the tail's indent that forms the nesting cavity notch */
const TAIL_INDENT_W = 10;
/** Total width of the closing step at the bottom of the tail */
const TAIL_STEP_W = 40;
/** Height of the closing step at the bottom of the tail */
const TAIL_STEP_H = 10;

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
    /** Height of the nesting cavity between the head and the tail step; 0 when no nesting */
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
        input.labelMainDims.w +
        labelParamGutter +
        maxParamWidth +
        HEAD_PAD_X2 +
        strokeWidth / 2;

    // ── Tail ──
    const tailIndentWidth =
        strokeWidth / 2 + TAIL_INDENT_W + (input.nestingDims?.w ?? 0) + strokeWidth / 2;
    const tailStepWidth = strokeWidth / 2 + TAIL_STEP_W + strokeWidth / 2;

    const tailWidth = Math.max(tailIndentWidth, tailStepWidth);

    const width = Math.max(headWidth, tailWidth, MIN_WIDTH);

    // ── Height ──

    // ── Head ──
    const paramsTotalHeight = params.reduce((sum, p) => sum + p.h, 0);
    const paramGutterTotal = PARAM_GUTTER_Y * Math.max(0, params.length - 1);

    const headHeightByLabel =
        strokeWidth / 2 +
        HEAD_PAD_Y1 +
        Math.max(input.labelMainDims.h, MIN_LABEL_MAIN_H) +
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
    const nestHeight = hasNesting ? Math.max(input.nestingDims?.h ?? 0, MIN_NEST_HEIGHT) : 0;
    const tailHeight = hasNesting
        ? nestHeight + strokeWidth / 2 + TAIL_STEP_H + strokeWidth / 2
        : 0;

    const height = headHeight + tailHeight;

    return { width, height, headHeight, nestHeight };
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

function generateMarkers(
    input: BrickOutlineInput2,
    width: number,
    headHeight: number,
    nestHeight: number,
    hasNesting: boolean,
): BrickOutlineOutput2['markers'] {
    const strokeWidth = input.strokeWidth;

    const mainLabelRect = [
        `M ${strokeWidth / 2 + HEAD_PAD_X1} ${strokeWidth / 2 + HEAD_PAD_Y1}`,
        `h ${input.labelMainDims.w}`,
        `v ${input.labelMainDims.h}`,
        `h ${-input.labelMainDims.w}`,
        'Z',
    ].join(' ');

    let nestingRect: string | undefined;
    if (hasNesting) {
        const nestingW = input.nestingDims?.w ?? 0;
        nestingRect = [
            `M ${TAIL_INDENT_W + strokeWidth / 2 + strokeWidth / 2} ${headHeight}`,
            `h ${nestingW}`,
            `v ${nestHeight}`,
            `h ${-nestingW}`,
            'Z',
        ].join(' ');
    }

    const paramRects: string[] = [];
    const argRectList: string[] = [];
    let y = 0;

    for (const { param, arg } of input.paramArgDims) {
        const rowH = arg?.h ?? MIN_ARG_H;

        if (arg !== null) {
            argRectList.push(
                [`M ${width} ${y}`, `h ${arg.w}`, `v ${arg.h}`, `h ${-arg.w}`, 'Z'].join(' '),
            );
        }

        if (param !== null) {
            const paramY = y + (rowH - param.h) / 2;
            const x = width - strokeWidth / 2 - HEAD_PAD_X2 - param.w;
            paramRects.push(
                [`M ${x} ${paramY}`, `h ${param.w}`, `v ${param.h}`, `h ${-param.w}`, 'Z'].join(
                    ' ',
                ),
            );
        }

        y += rowH;
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
    const markers = showMarkers
        ? generateMarkers(input, width, headHeight, nestHeight, hasNesting)
        : undefined;

    return { path, width, height, markers };
}
