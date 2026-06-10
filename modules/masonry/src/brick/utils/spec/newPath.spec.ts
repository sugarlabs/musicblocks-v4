import { generateBrickOutline, computeDimensions } from '../newPath';
import type { BrickOutlineInput } from '../newPath';

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
