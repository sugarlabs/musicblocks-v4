import type { BrickOutlineInput } from '../newPath';
import type { BrickOutlineInput2 } from '../../../@types/brick';

import type { BrickMinimums } from '../../../@types/brick';

import {
    generateBrickOutline,
    computeDimensions,
    createBrickOutlineGenerator,
    computeDimensions2,
} from '../newPath';

const MINIMUMS: BrickMinimums = {
    minWidth: 120,
    minLabelHeight: 20,
    minNestHeight: 40,
    minParamHeight: 20,
    minArgHeight: 40,
};

const generateBrickOutline2 = createBrickOutlineGenerator(MINIMUMS);

// ────────────────────────── Helpers ──────────────────────────

/** Parse an SVG path string and extract all {x, y} coordinates from M/L commands */
function parsePathPoints(path: string): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];
    const tokens = path.trim().split(/\s+/);
    let i = 0;
    while (i < tokens.length) {
        const cmd = tokens[i];
        if (cmd === 'M' || cmd === 'L') {
            points.push({ x: parseFloat(tokens[i + 1]), y: parseFloat(tokens[i + 2]) });
            i += 3;
        } else if (cmd === 'Z') {
            i += 1;
        } else {
            i += 1;
        }
    }
    return points;
}

/** Check that a path only contains M, L, Z commands and numeric coordinates */
function isValidSimplePath(path: string): boolean {
    // Should match pattern: M <num> <num> (L <num> <num>)* Z
    const pattern =
        /^M\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?(\s+L\s+-?\d+(\.\d+)?\s+-?\d+(\.\d+)?)*\s+Z$/;
    return pattern.test(path);
}

// ────────────────────────── Constants (mirrored for assertions) ──────────────────────────

const MIN_WIDTH = 100;
const MIN_HEIGHT = 40;
const NEST_INDENT = 16;

// ────────────────────────── Test Suites ──────────────────────────

describe('newPath: generateBrickOutline', () => {
    // ── Label only ──

    describe('Label only (no params, args, nestings)', () => {
        it('generates a simple rectangle for a basic label', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 60, h: 20 },
                paramLabels: [],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);
            const points = parsePathPoints(result.path);

            // Should be 4 points (rectangle) + Z
            expect(points).toHaveLength(4);
            expect(isValidSimplePath(result.path)).toBe(true);

            // Width = max(100, 8 + 60 + 8) = 100 (MIN_WIDTH wins)
            expect(result.width).toBe(MIN_WIDTH);
            // Height = max(40, 8 + 20 + 8) = 40 (MIN_HEIGHT wins)
            expect(result.height).toBe(MIN_HEIGHT);
        });

        it('expands beyond minimums for a large label', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 200, h: 50 },
                paramLabels: [],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            // Width = max(100, 8 + 200 + 8) = 216
            expect(result.width).toBe(216);
            // Height = max(40, 8 + 50 + 8) = 66
            expect(result.height).toBe(66);
        });
    });

    // ── Label + param labels ──

    describe('Label + parameter labels', () => {
        it('widens the brick when param labels are added', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 60, h: 20 },
                paramLabels: [
                    { w: 40, h: 15 },
                    { w: 30, h: 25 },
                ],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            // Width = max(100, 8 + 60 + 8(gap) + 40 + 8) = 124
            expect(result.width).toBe(124);
            // Height = max(40, 8 + max(20, 15 + 25) + 8) = max(40, 8 + 40 + 8) = 56
            expect(result.height).toBe(56);
        });
    });

    // ── Label + args ──

    describe('Label + arguments', () => {
        it('widens the brick when args are added', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 20 },
                paramLabels: [],
                args: [
                    { w: 40, h: 30 },
                    { w: 35, h: 25 },
                ],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            // Width = max(100, 8 + 80 + 8) = 100
            expect(result.width).toBe(MIN_WIDTH);
            // Height = max(40, 8 + max(20, 30 + 25) + 8) = max(40, 8 + 55 + 8) = 71
            expect(result.height).toBe(71);
        });
    });

    // ── Label + params + args ──

    describe('Label + params + args', () => {
        it('sums all horizontal widths correctly (excluding args) and vertical heights correctly', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 60, h: 20 },
                paramLabels: [{ w: 40, h: 18 }],
                args: [
                    { w: 50, h: 22 },
                    { w: 50, h: 22 },
                ],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            // Width = max(100, 8 + 60 + 8(gap) + 40 + 8) = 124
            expect(result.width).toBe(124);
            // Height = max(40, 8 + max(max(20, 18), 22 + 22) + 8) = max(40, 8 + 44 + 8) = 60
            expect(result.height).toBe(60);
        });
    });

    // ── Label + nestings (compound brick) ──

    describe('Label + nestings (compound brick)', () => {
        it('generates a C-shaped outline with nesting cavity', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 20 },
                paramLabels: [],
                args: [],
                nestings: [{ w: 60, h: 50 }],
            };

            const result = generateBrickOutline(input);
            const points = parsePathPoints(result.path);

            // Compound brick has 8 points (rectangle + cavity indent)
            expect(points).toHaveLength(8);
            expect(isValidSimplePath(result.path)).toBe(true);

            // Width = max(100, 8+80+8, 60+16) = 100 (MIN_WIDTH wins)
            expect(result.width).toBe(MIN_WIDTH);

            // topBarHeight = max(40, 8+20+8) = 40
            // nestHeight = max(40, 50) = 50
            // footerHeight = 40
            // Height = 40 + 50 + 40 = 130
            expect(result.height).toBe(130);
        });

        it('enforces minimum nesting height', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 20 },
                paramLabels: [],
                args: [],
                nestings: [{ w: 30, h: 10 }],
            };

            const result = generateBrickOutline(input);

            // nestHeight = max(40, 10) = 40
            // Height = 40 + 40 + 40 = 120
            expect(result.height).toBe(120);
        });

        it('sums multiple nesting heights', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 20 },
                paramLabels: [],
                args: [],
                nestings: [
                    { w: 50, h: 30 },
                    { w: 60, h: 40 },
                ],
            };

            const result = generateBrickOutline(input);

            // nestHeight = max(40, 30+40) = 70
            // Height = 40 + 70 + 40 = 150
            expect(result.height).toBe(150);
        });
    });

    // ── Full config (all 4 properties) ──

    describe('Full config (all 4 properties)', () => {
        it('handles a fully populated brick correctly', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 30 },
                paramLabels: [
                    { w: 40, h: 20 },
                    { w: 35, h: 25 },
                ],
                args: [{ w: 50, h: 35 }],
                nestings: [{ w: 100, h: 60 }],
            };

            const result = generateBrickOutline(input);
            const points = parsePathPoints(result.path);

            // Compound brick → 8 points
            expect(points).toHaveLength(8);

            // Width = max(100, 8+80+8+max(40,35)+8, 116) = max(100, 144, 116) = 144
            expect(result.width).toBe(144);

            // topBarHeight = max(40, 8 + max(30, 20+25, 35) + 8) = max(40, 8 + 45 + 8) = 61
            // nestHeight = max(40, 60) = 60
            // footerHeight = 40
            // Height = 61 + 60 + 40 = 161
            expect(result.height).toBe(161);
        });
    });

    // ── Minimum enforcement ──

    describe('Minimum enforcement', () => {
        it('enforces MIN_WIDTH and MIN_HEIGHT for zero-size inputs', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 0, h: 0 },
                paramLabels: [],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            expect(result.width).toBe(MIN_WIDTH);
            expect(result.height).toBe(MIN_HEIGHT);
        });

        it('enforces minimums even with tiny values', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 5, h: 3 },
                paramLabels: [{ w: 2, h: 1 }],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);

            // Width = max(100, 8+5+2+8) = 100
            expect(result.width).toBe(MIN_WIDTH);
            // Height = max(40, 8+max(3,1)+8) = 40
            expect(result.height).toBe(MIN_HEIGHT);
        });
    });

    // ── Path validity ──

    describe('Path validity', () => {
        const testInputs: { name: string; input: BrickOutlineInput }[] = [
            {
                name: 'simple brick',
                input: {
                    mainLabel: { w: 60, h: 20 },
                    paramLabels: [],
                    args: [],
                    nestings: [],
                },
            },
            {
                name: 'compound brick',
                input: {
                    mainLabel: { w: 80, h: 25 },
                    paramLabels: [{ w: 30, h: 15 }],
                    args: [{ w: 40, h: 20 }],
                    nestings: [{ w: 60, h: 50 }],
                },
            },
        ];

        testInputs.forEach(({ name, input }) => {
            it(`produces valid M/L/Z path for ${name}`, () => {
                const result = generateBrickOutline(input);

                expect(result.path).toBeTruthy();
                expect(result.path.startsWith('M')).toBe(true);
                expect(result.path.endsWith('Z')).toBe(true);
                expect(isValidSimplePath(result.path)).toBe(true);
            });
        });
    });

    // ── Determinism ──

    describe('Determinism', () => {
        it('produces identical output for identical inputs', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 100, h: 30 },
                paramLabels: [{ w: 40, h: 20 }],
                args: [{ w: 50, h: 25 }],
                nestings: [{ w: 70, h: 45 }],
            };

            const result1 = generateBrickOutline(input);
            const result2 = generateBrickOutline(input);

            expect(result1.path).toBe(result2.path);
            expect(result1.width).toBe(result2.width);
            expect(result1.height).toBe(result2.height);
        });
    });

    // ── Rectangle geometry verification ──

    describe('Rectangle geometry (simple bricks)', () => {
        it('path traces a correct rectangle matching computed dimensions', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 120, h: 30 },
                paramLabels: [],
                args: [],
                nestings: [],
            };

            const result = generateBrickOutline(input);
            const points = parsePathPoints(result.path);

            // Rectangle: (0,0) → (W,0) → (W,H) → (0,H)
            expect(points[0]).toEqual({ x: 0, y: 0 });
            expect(points[1]).toEqual({ x: result.width, y: 0 });
            expect(points[2]).toEqual({ x: result.width, y: result.height });
            expect(points[3]).toEqual({ x: 0, y: result.height });
        });
    });

    // ── C-shape geometry verification ──

    describe('C-shape geometry (compound bricks)', () => {
        it('path traces correct C-shape with nesting cavity', () => {
            const input: BrickOutlineInput = {
                mainLabel: { w: 80, h: 20 },
                paramLabels: [],
                args: [],
                nestings: [{ w: 50, h: 50 }],
            };

            const result = generateBrickOutline(input);
            const dims = computeDimensions(input);
            const points = parsePathPoints(result.path);

            // 8 points for C-shape (right-sided cavity):
            // (0,0) → (W,0) →
            // (W,tH) → (INDENT,tH) → (INDENT,tH+nH) → (fW,tH+nH) → (fW,H) →
            // (0,H)
            expect(points).toHaveLength(8);
            expect(points[0]).toEqual({ x: 0, y: 0 });
            expect(points[1]).toEqual({ x: result.width, y: 0 });
            expect(points[2]).toEqual({ x: result.width, y: dims.topBarHeight });
            expect(points[3]).toEqual({ x: NEST_INDENT, y: dims.topBarHeight });
            expect(points[4]).toEqual({ x: NEST_INDENT, y: dims.topBarHeight + dims.nestHeight });
            expect(points[5]).toEqual({
                x: dims.footerWidth,
                y: dims.topBarHeight + dims.nestHeight,
            });
            expect(points[6]).toEqual({ x: dims.footerWidth, y: result.height });
            expect(points[7]).toEqual({ x: 0, y: result.height });
        });
    });
});

// ────────────────────────── computeDimensions unit tests ──────────────────────────

describe('newPath: computeDimensions', () => {
    it('returns correct dimensions for a simple brick', () => {
        const dims = computeDimensions({
            mainLabel: { w: 80, h: 20 },
            paramLabels: [],
            args: [],
            nestings: [],
        });

        expect(dims.width).toBe(MIN_WIDTH); // max(100, 8+80+8=96) = 100
        expect(dims.height).toBe(MIN_HEIGHT); // max(40, 8+20+8=36) = 40
        expect(dims.topBarHeight).toBe(MIN_HEIGHT);
        expect(dims.nestHeight).toBe(0);
        expect(dims.footerHeight).toBe(0);
    });

    it('returns correct dimensions for a compound brick', () => {
        const dims = computeDimensions({
            mainLabel: { w: 80, h: 20 },
            paramLabels: [],
            args: [],
            nestings: [{ w: 60, h: 80 }],
        });

        expect(dims.topBarHeight).toBe(MIN_HEIGHT);
        expect(dims.nestHeight).toBe(80); // max(40, 80)
        expect(dims.footerHeight).toBe(MIN_HEIGHT);
        expect(dims.height).toBe(40 + 80 + 40); // 160
    });

    it('uses max nesting width for total width when it is larger', () => {
        const dims = computeDimensions({
            mainLabel: { w: 20, h: 10 },
            paramLabels: [],
            args: [],
            nestings: [{ w: 200, h: 50 }],
        });

        // footerWidth = NEST_INDENT + 200 + 8 = 16 + 200 + 8 = 224
        // topBarWidth = 8 + 20 + 8 = 36
        // width = max(100, 36, 224) = 224
        expect(dims.width).toBe(224);
    });
});

// ══════════════════════ V2: stroke-width-aware path ══════════════════════

// ────────────────────────── Helpers ──────────────────────────

interface RelSeg {
    cmd: 'm' | 'h' | 'v' | 'z';
    /** signed length for h/v; undefined for m/z */
    len?: number;
}

/**
 * Parse a relative SVG path (lowercase m/h/v + z) into its segments.
 * The leading `m dx dy` only positions the start, so it is recorded as a single
 * `m` with no length; `h`/`v` carry their signed relative displacement.
 */
function parseRelPath(path: string): RelSeg[] {
    const tokens = path.trim().split(/\s+/);
    const segs: RelSeg[] = [];
    let i = 0;
    while (i < tokens.length) {
        const cmd = tokens[i];
        if (cmd === 'm') {
            segs.push({ cmd: 'm' });
            i += 3; // m dx dy
        } else if (cmd === 'h' || cmd === 'v') {
            segs.push({ cmd, len: parseFloat(tokens[i + 1]) });
            i += 2;
        } else if (cmd === 'z' || cmd === 'Z') {
            segs.push({ cmd: 'z' });
            i += 1;
        } else {
            i += 1;
        }
    }
    return segs;
}

/** Net horizontal / vertical displacement of all h/v segments (should be 0 for a closed loop). */
function netDisplacement(path: string): { dx: number; dy: number } {
    let dx = 0;
    let dy = 0;
    for (const seg of parseRelPath(path)) {
        if (seg.cmd === 'h') dx += seg.len!;
        if (seg.cmd === 'v') dy += seg.len!;
    }
    return { dx, dy };
}

// ────────────────────────── Constants (mirrored for assertions) ──────────────────────────

const MIN_NEST_HEIGHT = 40;
const MIN_ARG_H = 40;
const HEAD_PAD_X1 = 7;
const HEAD_PAD_X2 = 7;
const LABEL_PARAM_GUTTER_X = 10;
const TAIL_INDENT_W = 6;
const TAIL_STEP_H = 6;
const TAIL_STEP_W = 30;

// ────────────────────────── computeDimensions2 ──────────────────────────

describe('path V2: computeDimensions2', () => {
    describe('width', () => {
        it('main label dominates (no stroke)', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 200, h: 30 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headWidth = HEAD_PAD_X1 + 200 + HEAD_PAD_X2 = 214 ; width = max(214, TAIL_STEP_W, minWidth)
            expect(dims.width).toBe(214);
        });

        it('MIN_WIDTH dominates a small brick (no stroke)', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 30, h: 10 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headWidth = HEAD_PAD_X1 + 30 + HEAD_PAD_X2 = 44 ; width = max(44, TAIL_STEP_W, minWidth) = 120
            expect(dims.width).toBe(MINIMUMS.minWidth);
        });

        it('adds s/2 + s/2 of stroke clearance to the head when the head dominates', () => {
            const s = 4;
            const dims = computeDimensions2(
                {
                    strokeWidth: s,
                    labelDims: { w: 200, h: 30 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headWidth = s + HEAD_PAD_X1 + 200 + HEAD_PAD_X2 = 218
            expect(dims.width).toBe(218);
        });

        it('does NOT add stroke clearance when MIN_WIDTH wins (documents the s-smaller edge case)', () => {
            const s = 4;
            const dims = computeDimensions2(
                {
                    strokeWidth: s,
                    labelDims: { w: 30, h: 10 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headWidth = s + HEAD_PAD_X1 + 30 + HEAD_PAD_X2 = 48 ; tailWidth = max(s+TAIL_INDENT_W, s+TAIL_STEP_W) = 34 ; width = max(48,34,120) = 120
            expect(dims.width).toBe(MINIMUMS.minWidth);
        });

        it('widens for the widest param plus the label gutter', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 60, h: 20 },
                    paramArgDims: [
                        { param: { w: 40, h: 15 }, arg: null },
                        { param: { w: 30, h: 25 }, arg: null },
                    ],
                },
                MINIMUMS,
            );
            // headWidth = HEAD_PAD_X1 + 60 + 10(gutter) + 40(maxParam) + HEAD_PAD_X2 = 124
            expect(dims.width).toBe(124);
        });

        it('tail (nesting) can drive the width', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 20, h: 10 },
                    paramArgDims: [],
                    nestingDims: { w: 200, h: 50 },
                },
                MINIMUMS,
            );
            // tailIndentWidth = TAIL_INDENT_W + 200 = 206 ; width = max(34, 206, minWidth) = 206
            expect(dims.width).toBe(206);
        });
    });

    describe('height', () => {
        it('falls back to the main-label minimum height', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 60, h: 10 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headHeight = HEAD_PAD_Y1 + max(10,20) + HEAD_PAD_Y2 = 28 ; no tail
            expect(dims.headHeight).toBe(28);
            expect(dims.height).toBe(28);
            expect(dims.nestHeight).toBe(0);
        });

        it('stacked null-arg rows drive head height via MIN_ARG_H', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 60, h: 20 },
                    paramArgDims: [
                        { param: { w: 40, h: 15 }, arg: null },
                        { param: { w: 30, h: 25 }, arg: null },
                    ],
                },
                MINIMUMS,
            );
            // argsTotalHeight = MIN_ARG_H + MIN_ARG_H + 0(gutter, s=0) = 80
            expect(dims.headHeight).toBe(2 * MIN_ARG_H);
        });

        it('adds strokeWidth once to the total height (top + bottom margin)', () => {
            const s = 6;
            const dims = computeDimensions2(
                {
                    strokeWidth: s,
                    labelDims: { w: 60, h: 30 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headHeight = s/2 + HEAD_PAD_Y1 + max(30,20) + HEAD_PAD_Y2 + s/2 = 3+4+30+4+3 = 44
            expect(dims.headHeight).toBe(44);
            expect(dims.height).toBe(44); // headHeight + 0 (no nesting)
        });

        it('compound brick height = headHeight + nestHeight + foot + s', () => {
            const s = 4;
            const dims = computeDimensions2(
                {
                    strokeWidth: s,
                    labelDims: { w: 80, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 50 },
                },
                MINIMUMS,
            );
            expect(dims.headHeight).toBe(32); // s/2 + HEAD_PAD_Y1 + max(20,20) + HEAD_PAD_Y2 + s/2
            expect(dims.nestHeight).toBe(50); // max(50,40)
            // height = headHeight + (nestHeight + s/2 + TAIL_STEP_H + s/2)
            expect(dims.height).toBe(32 + 50 + TAIL_STEP_H + s);
        });

        it('enforces the minimum nesting height', () => {
            const dims = computeDimensions2(
                {
                    strokeWidth: 0,
                    labelDims: { w: 80, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 5 },
                },
                MINIMUMS,
            );
            expect(dims.nestHeight).toBe(MIN_NEST_HEIGHT);
        });

        it('no gutter between stacked arg bricks (args supply their own spacing)', () => {
            const s = 4;
            const dims = computeDimensions2(
                {
                    strokeWidth: s,
                    labelDims: { w: 60, h: 20 },
                    paramArgDims: [
                        { param: null, arg: { w: 50, h: 30 } },
                        { param: null, arg: { w: 50, h: 30 } },
                    ],
                },
                MINIMUMS,
            );
            // argsTotalHeight = 30 + 30 = 60 ; no gutter added (args account for their own strokes)
            expect(dims.headHeight).toBe(30 + 30);
        });
    });
});

// ────────────────────────── generateBrickOutline2 ──────────────────────────

describe('path V2: generateBrickOutline2', () => {
    it('simple brick path with no stroke', () => {
        const result = generateBrickOutline2({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        // width = 120 (minWidth), headHeight = 28, height = 28
        expect(result.path).toBe('M 0 0 h 120 v 28 h -120 v -28 z');
        expect(result.width).toBe(120);
        expect(result.height).toBe(28);
    });

    it('simple brick path inset by s/2 with stroke', () => {
        const result = generateBrickOutline2({
            strokeWidth: 4,
            labelDims: { w: 200, h: 30 },
            paramArgDims: [],
        });
        // width = 218, headHeight = 42, height = 42
        // M s/2 s/2 ; h (218-4)=214 ; v headHeight-4=38 ; h -214 ; v -38
        expect(result.path).toBe('M 2 2 h 214 v 38 h -214 v -38 z');
        expect(result.width).toBe(218);
        expect(result.height).toBe(42);
    });

    it('compound brick path with no stroke', () => {
        const result = generateBrickOutline2({
            strokeWidth: 0,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        // width=120, headHeight=28, nestHeight=50, height=84
        expect(result.path).toBe('M 0 0 h 120 v 28 h -114 v 50 h 24 v 6 h -30 v -84 z');
    });

    it('compound brick path with stroke (cavity −s, foot +s)', () => {
        const result = generateBrickOutline2({
            strokeWidth: 4,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        // width=120, headHeight=32, nestHeight=50, height=92
        // M s/2 s/2 ; top: 120-4=116 ; head: 32-4=28 ; roof: -(120-6-4)=-110 ; spine: 50+4=54 ; foot: 24 ; step: 6 ; bottom: -30 ; left: -(92-4)=-88
        expect(result.path).toBe('M 2 2 h 116 v 28 h -110 v 54 h 24 v 6 h -30 v -88 z');
    });

    describe('well-formedness: the outline is a closed loop (net displacement = 0)', () => {
        const inputs: { name: string; input: BrickOutlineInput2 }[] = [
            {
                name: 'simple, s=0',
                input: { strokeWidth: 0, labelDims: { w: 60, h: 20 }, paramArgDims: [] },
            },
            {
                name: 'simple, s=4',
                input: { strokeWidth: 4, labelDims: { w: 200, h: 30 }, paramArgDims: [] },
            },
            {
                name: 'compound, s=0',
                input: {
                    strokeWidth: 0,
                    labelDims: { w: 80, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 50 },
                },
            },
            {
                name: 'compound, s=4',
                input: {
                    strokeWidth: 4,
                    labelDims: { w: 80, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 50 },
                },
            },
        ];

        inputs.forEach(({ name, input }) => {
            it(`closes for ${name}`, () => {
                const { dx, dy } = netDisplacement(generateBrickOutline2(input).path);
                expect(dx).toBe(0);
                expect(dy).toBe(0);
            });
        });
    });

    describe('s = 0 reduces to the original (stroke terms vanish)', () => {
        it('width has no stroke contribution at s=0', () => {
            const input: BrickOutlineInput2 = {
                strokeWidth: 0,
                labelDims: { w: 120, h: 30 },
                paramArgDims: [{ param: { w: 40, h: 18 }, arg: null }],
            };
            const dims = computeDimensions2(input, MINIMUMS);
            const headWidth = HEAD_PAD_X1 + 120 + LABEL_PARAM_GUTTER_X + 40 + HEAD_PAD_X2;
            expect(dims.width).toBe(Math.max(headWidth, TAIL_STEP_W, MINIMUMS.minWidth));
        });

        it('path starts at the origin (no inset) when s=0', () => {
            const { path } = generateBrickOutline2({
                strokeWidth: 0,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [],
            });
            expect(path.startsWith('M 0 0')).toBe(true);
        });
    });

    describe('bounds', () => {
        it('always emits bounds with labelMain; omits params, args, nesting when absent', () => {
            const result = generateBrickOutline2({
                strokeWidth: 0,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [],
            });
            expect(result.bounds).toBeDefined();
            expect(result.bounds.label).toBeTruthy();
            expect(result.bounds.params).toBeUndefined();
            expect(result.bounds.args).toBeUndefined();
            expect(result.bounds.nesting).toBeUndefined();
        });

        it('emits bounds for all regions when params, args, and nesting are present', () => {
            const result = generateBrickOutline2({
                strokeWidth: 0,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [{ param: { w: 40, h: 15 }, arg: { w: 50, h: 30 } }],
                nestingDims: { w: 50, h: 50 },
            });
            expect(result.bounds).toBeDefined();
            expect(result.bounds.label).toBeTruthy();
            expect(result.bounds.params).toHaveLength(1);
            expect(result.bounds.args).toHaveLength(1);
            expect(result.bounds.nesting).toBeTruthy();
        });
    });
});

// ────────────────────────── Validity boundary (geometric fit / well-formedness) ──────────────────────────

describe('path V2: validity boundaries (documented, not yet enforced)', () => {
    /**
     * The fixed-size tail features invert once the stroke exceeds them. The foot step
     * (TAIL_STEP_W - TAIL_INDENT_W = 24) is the first to go negative, so the outline
     * stops being well-formed at s >= 24.
     */
    it('the foot-step segment goes negative once s exceeds TAIL_STEP_W - TAIL_INDENT_W', () => {
        const footStepLen = (s: number) => TAIL_STEP_W - TAIL_INDENT_W - s;
        expect(footStepLen(23)).toBeGreaterThan(0);
        expect(footStepLen(24)).toBe(0);
        expect(footStepLen(25)).toBeLessThan(0);
    });

    /**
     * The stroke inset shrinks the cavity interior to (nestHeight - s), so nested
     * content of height h only fits while nestHeight - s >= h.
     */
    it('cavity interior shrinks by s below the computed nestHeight', () => {
        const s = 4;
        const dims = computeDimensions2(
            {
                strokeWidth: s,
                labelDims: { w: 80, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 50, h: 50 },
            },
            MINIMUMS,
        );
        const cavityInterior = dims.nestHeight - s;
        expect(cavityInterior).toBe(50 - s);
        // Content of height 50 no longer fits inside the inset cavity (50 - 4 = 46 < 50).
        expect(cavityInterior).toBeLessThan(50);
    });
});
