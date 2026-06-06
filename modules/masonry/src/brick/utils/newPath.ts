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

export interface BrickOutlineOutput {
    path: string;
    width: number;
    height: number;
}

// ────────────────────────── Constants ──────────────────────────

const MIN_WIDTH = 100;
const MIN_HEIGHT = 40;
const MIN_NEST_HEIGHT = 40;
const PADDING = 8;
const NEST_INDENT = 16;

// ────────────────────────── Dimension Calculation ──────────────────────────

interface ComputedDimensions {
    width: number;
    height: number;
    topBarHeight: number;
    nestHeight: number;
    footerHeight: number;
    footerWidth: number;
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
