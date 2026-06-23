import type { BrickMinimums, BrickOutlineInput } from '@/@types/brick';

import {
    HEAD_PAD_X1,
    HEAD_PAD_X2,
    HEAD_PAD_Y1,
    H_NOTCH_RADIUS,
    NOTCH_OFFSET_Y,
    CORNER_RADIUS,
    TAIL_INDENT_W,
    TAIL_STEP_W,
    createBrickOutlineGenerator,
} from '../path2';

const MINIMUMS: BrickMinimums = {
    minWidth: 120,
    minLabelHeight: 20,
    minNestHeight: 40,
    minParamHeight: 20,
    minArgHeight: 40,
};

const generateBrickOutline = createBrickOutlineGenerator(MINIMUMS);

// A single argument slot, reused across integration cases.
const oneArg = { param: null, arg: { w: 50, h: 40 } };

// ────────────────────────── 1. bounds (via the public generator) ───────────────────────────────────

describe('path V2: bounds', () => {
    it('always emits a label box; omits params, args, nesting when absent', () => {
        const { bounds } = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        expect(bounds.label).toEqual({
            x: HEAD_PAD_X1,
            y: HEAD_PAD_Y1,
            w: 60,
            h: MINIMUMS.minLabelHeight,
        });
        expect(bounds.params).toBeUndefined();
        expect(bounds.args).toBeUndefined();
        expect(bounds.nesting).toBeUndefined();
    });

    it('emits boxes for every region when params, args, and nesting are present', () => {
        const { bounds } = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [{ param: { w: 40, h: 15 }, arg: { w: 50, h: 30 } }],
            nestingDims: { w: 50, h: 50 },
        });
        expect(bounds.label).toBeTruthy();
        expect(bounds.params).toHaveLength(1);
        expect(bounds.args).toHaveLength(1);
        expect(bounds.nesting).toBeTruthy();
    });

    it('anchors the arg box to the right edge and centres the param box on its arg notch', () => {
        const { bounds, width } = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [{ param: { w: 40, h: 20 }, arg: { w: 50, h: 60 } }],
        });
        // Arg sits flush against the outer right edge.
        expect(bounds.args?.[0]?.x).toBe(width);
        // Param is right-aligned inside the head and vertically centred on the arg
        // notch (NOTCH_OFFSET_Y below the row top), not on the row itself.
        expect(bounds.params?.[0]?.x).toBe(width - HEAD_PAD_X2 - 40);
        expect(bounds.params?.[0]?.y).toBe(NOTCH_OFFSET_Y - 20 / 2);
    });
});

// ────────────────────────── 2. createBrickOutlineGenerator() — full-path integration ───────────────

describe('path V2: generateBrickOutline (integration)', () => {
    it('simple brick path with no stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        expect(result.path).toBe(
            'M 4 0 h 112 a 4 4 0 0 1 4 4 v 24 a 4 4 0 0 1 -4 4 h -112 a 4 4 0 0 1 -4 -4 v -24 a 4 4 0 0 1 4 -4 Z',
        );
        expect(result.width).toBe(120);
        expect(result.height).toBe(32);
    });

    it('simple brick path inset by s/2 with stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 4,
            labelDims: { w: 200, h: 30 },
            paramArgDims: [],
        });
        expect(result.path).toBe(
            'M 6 2 h 216 a 4 4 0 0 1 4 4 v 34 a 4 4 0 0 1 -4 4 h -216 a 4 4 0 0 1 -4 -4 v -34 a 4 4 0 0 1 4 -4 Z',
        );
        expect(result.width).toBe(228);
        expect(result.height).toBe(46);
    });

    it('compound brick path with no stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        expect(result.path).toBe(
            'M 4 0 h 112 a 4 4 0 0 1 4 4 v 24 a 4 4 0 0 1 -4 4 h -86 a 0 0 0 0 0 0 0 a 4 4 0 0 1 -4 4 a 4 4 0 0 1 -4 -4 a 0 0 0 0 0 0 0 h -10 a 4 4 0 0 0 -4 4 v 42 a 4 4 0 0 0 4 4 h 10 a 0 0 0 0 0 0 0 a 4 4 0 0 0 4 4 a 4 4 0 0 0 4 -4 a 0 0 0 0 0 0 0 h 14 a 4 4 0 0 1 4 4 v 4 a 4 4 0 0 1 -4 4 h -40 a 4 4 0 0 1 -4 -4 v -86 a 4 4 0 0 1 4 -4 Z',
        );
    });

    it('compound brick path with stroke (cavity −s, foot +s)', () => {
        const result = generateBrickOutline({
            strokeWidth: 4,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        expect(result.path).toBe(
            'M 6 2 h 108 a 4 4 0 0 1 4 4 v 24 a 4 4 0 0 1 -4 4 h -76 a 6 6 0 0 0 -6 6 a 2 2 0 0 1 -2 2 a 2 2 0 0 1 -2 -2 a 6 6 0 0 0 -6 -6 h -4 a 8 8 0 0 0 -8 8 v 38 a 8 8 0 0 0 8 8 h 4 a 2 2 0 0 1 2 2 a 6 6 0 0 0 6 6 a 6 6 0 0 0 6 -6 a 2 2 0 0 1 2 -2 h 8 a 4 4 0 0 1 4 4 v 4 a 4 4 0 0 1 -4 4 h -40 a 4 4 0 0 1 -4 -4 v -90 a 4 4 0 0 1 4 -4 Z',
        );
    });

    describe('the outline is always a closed loop (net displacement = 0)', () => {
        const inputs: { name: string; input: BrickOutlineInput }[] = [
            {
                name: 'simple, s=0',
                input: { strokeWidth: 0, labelDims: { w: 60, h: 20 }, paramArgDims: [] },
            },
            {
                name: 'simple, s=4',
                input: { strokeWidth: 4, labelDims: { w: 200, h: 30 }, paramArgDims: [] },
            },
            {
                name: 'simple with every notch',
                input: {
                    strokeWidth: 2,
                    labelDims: { w: 60, h: 20 },
                    paramArgDims: [oneArg, oneArg, oneArg],
                    hasTopNotch: true,
                    hasBottomNotch: true,
                    hasLeftNotch: true,
                },
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
                name: 'compound with every notch',
                input: {
                    strokeWidth: 2,
                    labelDims: { w: 60, h: 20 },
                    paramArgDims: [oneArg, oneArg],
                    nestingDims: { w: 80, h: 80 },
                    hasTopNotch: true,
                    hasBottomNotch: true,
                    hasLeftNotch: true,
                },
            },
        ];

        inputs.forEach(({ name, input }) => {
            it(`closes for ${name}`, () => {
                const { dx, dy } = netDisplacementFull(generateBrickOutline(input).path);
                expect(dx).toBeCloseTo(0);
                expect(dy).toBeCloseTo(0);
            });
        });
    });

    describe('notch wiring through the public API', () => {
        it('emits one right-edge groove per arg slot, radius H_NOTCH_RADIUS + s/2', () => {
            const s = 2;
            const r = generateBrickOutline({
                strokeWidth: s,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [oneArg, oneArg, oneArg],
            });
            const grooves = parseArcs(r.path).filter((a) => a.rx === H_NOTCH_RADIUS + s / 2);
            expect(grooves).toHaveLength(3);
        });

        it('the left tab centre aligns with the first right groove, both at NOTCH_OFFSET_Y', () => {
            const s = 4;
            const r = generateBrickOutline({
                strokeWidth: s,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [oneArg, oneArg, oneArg],
                hasLeftNotch: true,
            });
            const grooveCentres = semicircleCentresY(r.path, H_NOTCH_RADIUS + s / 2);
            const tabCentre = leftTabCentreY(r.path);
            expect(grooveCentres[0]).toBeCloseTo(NOTCH_OFFSET_Y);
            expect(tabCentre).toBeCloseTo(NOTCH_OFFSET_Y);
        });

        it('grooves do not change the reported width/height (they cut inward)', () => {
            const r = generateBrickOutline({
                strokeWidth: 2,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [oneArg, oneArg],
            });
            // The right-edge grooves carve inward, so the frame stays at the minWidth
            // floor (120) and the height is just the two 40-tall arg rows (80).
            expect(r.width).toBe(120);
            expect(r.height).toBe(80);
        });
    });

    describe('corner radius', () => {
        it('rounds all four corners of a simple brick, each convex (sweep 1)', () => {
            const r = generateBrickOutline({
                strokeWidth: 2,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [],
            });
            const corners = parseArcs(r.path).filter((a) => a.rx === CORNER_RADIUS);
            expect(corners).toHaveLength(4);
            expect(corners.every((a) => a.sweep === 1)).toBe(true);
        });

        it('a compound brick rounds the two cavity-mouth corners concavely, a stroke-width larger', () => {
            const s = 2;
            const r = generateBrickOutline({
                strokeWidth: s,
                labelDims: { w: 80, h: 20 },
                paramArgDims: [],
                nestingDims: { w: 50, h: 50 },
            });
            const convex = parseArcs(r.path).filter((a) => a.rx === CORNER_RADIUS && a.sweep === 1);
            const concave = parseArcs(r.path).filter(
                (a) => a.rx === CORNER_RADIUS + s && a.sweep === 0,
            );
            expect(convex).toHaveLength(6);
            expect(concave).toHaveLength(2);
        });
    });

    describe('validity boundaries (documented, not yet enforced)', () => {
        it('the foot-step segment goes negative once s exceeds TAIL_STEP_W - TAIL_INDENT_W', () => {
            const footStepLen = (s: number) => TAIL_STEP_W - TAIL_INDENT_W - s;
            expect(footStepLen(39)).toBeGreaterThan(0);
            expect(footStepLen(40)).toBe(0);
            expect(footStepLen(41)).toBeLessThan(0);
        });
    });
});

// ────────────────────────── path-parsing helpers (integration assertions) ──────────────────────────

interface ArcSeg {
    rx: number;
    sweep: number;
    dx: number;
    dy: number;
}

// Extracts every elliptical arc; merges each notch's two equal-radius quarter arcs back into one.
function parseArcs(path: string): ArcSeg[] {
    const tokens = path.trim().split(/\s+/);
    const arcs: ArcSeg[] = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === 'a') {
            const rx = parseFloat(tokens[i + 1]);
            const sweep = parseFloat(tokens[i + 5]);
            let dx = parseFloat(tokens[i + 6]);
            let dy = parseFloat(tokens[i + 7]);
            if (tokens[i + 8] === 'a' && Math.abs(parseFloat(tokens[i + 9]) - rx) < 1e-9) {
                dx += parseFloat(tokens[i + 14]);
                dy += parseFloat(tokens[i + 15]);
                i += 8;
            }
            arcs.push({ rx, sweep, dx, dy });
        }
    }
    return arcs;
}

/** Net displacement of the whole path, INCLUDING arc segments (0,0 for a closed loop). */
function netDisplacementFull(path: string): { dx: number; dy: number } {
    const tokens = path.trim().split(/\s+/);
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < tokens.length; i++) {
        const cmd = tokens[i];
        if (cmd === 'h') dx += parseFloat(tokens[i + 1]);
        else if (cmd === 'v') dy += parseFloat(tokens[i + 1]);
        else if (cmd === 'a') {
            dx += parseFloat(tokens[i + 6]);
            dy += parseFloat(tokens[i + 7]);
        }
    }
    return { dx, dy };
}

// Absolute y of each semicircle centre of the given radius (centre = y + dy/2).
function semicircleCentresY(path: string, radius: number): number[] {
    const tokens = path.trim().split(/\s+/);
    let y = 0;
    const centres: number[] = [];
    for (let i = 0; i < tokens.length; i++) {
        const cmd = tokens[i];
        if (cmd === 'M' || cmd === 'm') {
            y = parseFloat(tokens[i + 2]);
        } else if (cmd === 'v') {
            y += parseFloat(tokens[i + 1]);
        } else if (cmd === 'a') {
            const rx = parseFloat(tokens[i + 1]);
            let dy = parseFloat(tokens[i + 7]);
            if (tokens[i + 8] === 'a' && Math.abs(parseFloat(tokens[i + 9]) - rx) < 1e-9) {
                dy += parseFloat(tokens[i + 15]);
                i += 8;
            }
            if (Math.abs(rx - radius) < 1e-9) centres.push(y + dy / 2);
            y += dy;
        }
    }
    return centres;
}

// Absolute y of the left-edge tab centre (the only arc with dx=0 and dy<0, travelling upward).
function leftTabCentreY(path: string): number | undefined {
    const tokens = path.trim().split(/\s+/);
    let y = 0;
    for (let i = 0; i < tokens.length; i++) {
        const cmd = tokens[i];
        if (cmd === 'M' || cmd === 'm') y = parseFloat(tokens[i + 2]);
        else if (cmd === 'v') y += parseFloat(tokens[i + 1]);
        else if (cmd === 'a') {
            const rx = parseFloat(tokens[i + 1]);
            let dx = parseFloat(tokens[i + 6]);
            let dy = parseFloat(tokens[i + 7]);
            if (tokens[i + 8] === 'a' && Math.abs(parseFloat(tokens[i + 9]) - rx) < 1e-9) {
                dx += parseFloat(tokens[i + 14]);
                dy += parseFloat(tokens[i + 15]);
                i += 8;
            }
            if (dx === 0 && dy < 0) return y + dy / 2;
            y += dy;
        }
    }
    return undefined;
}
