import type { BrickMinimums, BrickOutlineInput } from '@masonry/@types/brick';

import {
    HEAD_PAD_X1,
    HEAD_PAD_X2,
    LABEL_PARAM_GUTTER_X,
    H_NOTCH_RADIUS,
    V_NOTCH_RADIUS,
    NOTCH_OFFSET_Y,
    TAIL_INDENT_W,
    TAIL_STEP_H,
    TAIL_STEP_W,
    createBrickOutlineGenerator,
    computeDimensions,
} from '../path2';

const MINIMUMS: BrickMinimums = {
    minWidth: 120,
    minLabelHeight: 20,
    minNestHeight: 40,
    minParamHeight: 20,
    minArgHeight: 40,
};

const generateBrickOutline = createBrickOutlineGenerator(MINIMUMS);

// ────────────────────────── computeDimensions ────────────────────────────────────────────────────

describe('path V2: computeDimensions', () => {
    describe('width', () => {
        it('main label dominates (no stroke)', () => {
            const dims = computeDimensions(
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
            const dims = computeDimensions(
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
            const dims = computeDimensions(
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
            const dims = computeDimensions(
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
            const dims = computeDimensions(
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
            const dims = computeDimensions(
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
            const dims = computeDimensions(
                {
                    strokeWidth: 0,
                    labelDims: { w: 60, h: 10 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            // headHeight = HEAD_PAD_Y1 + max(10,20) + HEAD_PAD_Y2 = 5 + 20 + 3 = 28
            expect(dims.headHeight).toBe(28);
            expect(dims.height).toBe(28);
            expect(dims.nestHeight).toBe(0);
        });

        it('stacked null-arg rows drive head height via MIN_ARG_H', () => {
            const dims = computeDimensions(
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
            // argsTotalHeight = minArgHeight + minArgHeight + 0(gutter, s=0) = 80
            expect(dims.headHeight).toBe(2 * MINIMUMS.minArgHeight);
        });

        it('adds strokeWidth once to the total height (top + bottom margin)', () => {
            const s = 6;
            const dims = computeDimensions(
                {
                    strokeWidth: s,
                    labelDims: { w: 60, h: 30 },
                    paramArgDims: [],
                },
                MINIMUMS,
            );
            expect(dims.headHeight).toBe(44);
            expect(dims.height).toBe(44); // headHeight + 0 (no nesting)
        });

        it('compound brick height = headHeight + nestHeight + foot + s', () => {
            const s = 4;
            const dims = computeDimensions(
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
            // height = headHeight + (nestHeight + s/2 + TAIL_STEP_H + s/2) = 32 + (50 + 2 + TAIL_STEP_H + 2) = 92
            expect(dims.height).toBe(32 + 50 + 4 + TAIL_STEP_H);
        });

        it('enforces the minimum nesting height', () => {
            const dims = computeDimensions(
                {
                    strokeWidth: 0,
                    labelDims: { w: 80, h: 20 },
                    paramArgDims: [],
                    nestingDims: { w: 50, h: 5 },
                },
                MINIMUMS,
            );
            expect(dims.nestHeight).toBe(MINIMUMS.minNestHeight);
        });

        it('no gutter between stacked arg bricks (args supply their own spacing)', () => {
            const s = 4;
            const dims = computeDimensions(
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
            // argsTotalHeight = 60, but headHeightByParams now dominates: 2(s/2) + 5(pad) + 40(minParams) + 8(gutter) + 3(pad) + 2(s/2) = 60
            expect(dims.headHeight).toBe(60);
        });
    });
});

// ────────────────────────── generateBrickOutline ────────────────────────────────────────────────

describe('path V2: generateBrickOutline', () => {
    it('simple brick path with no stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        // width = 120 (minWidth), headHeight = 28, height = 28
        expect(result.path).toBe('M 0 0 h 120 v 28 h -120 v -28 Z');
        expect(result.width).toBe(120);
        expect(result.height).toBe(28);
    });

    it('simple brick path inset by s/2 with stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 4,
            labelDims: { w: 200, h: 30 },
            paramArgDims: [],
        });
        // width = 218, headHeight = 42, height = 42
        // M s/2 s/2 ; h (218-4)=214 ; v headHeight-4=38 ; h -214 ; v -38
        expect(result.path).toBe('M 2 2 h 214 v 38 h -214 v -38 Z');
        expect(result.width).toBe(218);
        expect(result.height).toBe(42);
    });

    it('compound brick path with no stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        // width=120, headHeight=28, nestHeight=50, height=84
        // cavity roof and foot now always include V-notch arcs (tab + groove)
        expect(result.path).toBe(
            'M 0 0 h 120 v 28 h -99 a 0 0 0 0 0 0 0 a 3 3 0 0 1 -6 0 a 0 0 0 0 0 0 0 h -9 v 50 h 9 a 0 0 0 0 1 0 0 a 3 3 0 0 0 6 0 a 0 0 0 0 1 0 0 h 9 v 6 h -30 v -84 Z',
        );
    });

    it('compound brick path with stroke (cavity −s, foot +s)', () => {
        const result = generateBrickOutline({
            strokeWidth: 4,
            labelDims: { w: 80, h: 20 },
            paramArgDims: [],
            nestingDims: { w: 50, h: 50 },
        });
        // width=120, headHeight=32, nestHeight=50, height=92
        // cavity roof and foot now always include V-notch arcs (tab + groove)
        expect(result.path).toBe(
            'M 2 2 h 116 v 28 h -93 a 2 2 0 0 0 -2 2 a 1 1 0 0 1 -2 0 a 2 2 0 0 0 -2 -2 h -11 v 54 h 7 a 2 2 0 0 1 2 2 a 5 5 0 0 0 10 0 a 2 2 0 0 1 2 -2 h 3 v 6 h -30 v -88 Z',
        );
    });

    describe('well-formedness: the outline is a closed loop (net displacement = 0)', () => {
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
                const { dx, dy } = netDisplacementFull(generateBrickOutline(input).path);
                expect(dx).toBe(0);
                expect(dy).toBe(0);
            });
        });
    });

    describe('s = 0 reduces to the original (stroke terms vanish)', () => {
        it('width has no stroke contribution at s=0', () => {
            const input: BrickOutlineInput = {
                strokeWidth: 0,
                labelDims: { w: 120, h: 30 },
                paramArgDims: [{ param: { w: 40, h: 18 }, arg: null }],
            };
            const dims = computeDimensions(input, MINIMUMS);
            const headWidth = HEAD_PAD_X1 + 120 + LABEL_PARAM_GUTTER_X + 40 + HEAD_PAD_X2;
            expect(dims.width).toBe(Math.max(headWidth, TAIL_STEP_W, MINIMUMS.minWidth));
        });

        it('path starts at the origin (no inset) when s=0', () => {
            const { path } = generateBrickOutline({
                strokeWidth: 0,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [],
            });
            expect(path.startsWith('M 0 0')).toBe(true);
        });
    });

    describe('bounds', () => {
        it('always emits bounds with labelMain; omits params, args, nesting when absent', () => {
            const result = generateBrickOutline({
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
            const result = generateBrickOutline({
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

// ────────────────────────── Validity Boundaries ──────────────────────────────────────────────────

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
        const dims = computeDimensions(
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

// ────────────────────────── Notches ──────────────────────────────────────────────────────────────

interface ArcSeg {
    rx: number;
    sweep: number;
    dx: number;
    dy: number;
}

/** Extract every elliptical-arc (`a rx ry rot large sweep dx dy`) segment from a path. */
function parseArcs(path: string): ArcSeg[] {
    const tokens = path.trim().split(/\s+/);
    const arcs: ArcSeg[] = [];
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i] === 'a') {
            arcs.push({
                rx: parseFloat(tokens[i + 1]),
                sweep: parseFloat(tokens[i + 5]),
                dx: parseFloat(tokens[i + 6]),
                dy: parseFloat(tokens[i + 7]),
            });
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

/**
 * Absolute y of each semicircle centre for notches of the given radius, by walking the
 * path. A semicircle's dy spans its full diameter, so its centre is at y + dy/2.
 */
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
            const dy = parseFloat(tokens[i + 7]);
            if (Math.abs(rx - radius) < 1e-9) centres.push(y + dy / 2);
            y += dy;
        }
    }
    return centres;
}

/**
 * Walks the path and returns the absolute y-coordinate of the left-edge tab semicircle centre.
 * The tab semicircle is the only arc where dx=0 and dy<0 (it travels upward on the left edge).
 */
function leftTabCentreY(path: string): number | undefined {
    const tokens = path.trim().split(/\s+/);
    let y = 0;
    for (let i = 0; i < tokens.length; i++) {
        const cmd = tokens[i];
        if (cmd === 'M' || cmd === 'm') y = parseFloat(tokens[i + 2]);
        else if (cmd === 'v') y += parseFloat(tokens[i + 1]);
        else if (cmd === 'a') {
            const dx = parseFloat(tokens[i + 6]);
            const dy = parseFloat(tokens[i + 7]);
            if (dx === 0 && dy < 0) return y + dy / 2;
            y += dy;
        }
    }
    return undefined;
}

const oneArg = { param: null, arg: { w: 50, h: 40 } };

describe('path V2: notches', () => {
    it('draws no arcs when there are no args and no left tab', () => {
        const r = generateBrickOutline({
            strokeWidth: 2,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        expect(parseArcs(r.path)).toHaveLength(0);
    });

    it('right grooves follow the args: one groove per argument slot, no flag needed', () => {
        const s = 2;
        const r = generateBrickOutline({
            strokeWidth: s,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg, oneArg],
        });
        const grooves = parseArcs(r.path).filter((a) => a.rx === H_NOTCH_RADIUS + s);
        expect(grooves).toHaveLength(3);
    });

    it('left notch: exactly one tab, radius = H_NOTCH_RADIUS', () => {
        const s = 2;
        const r = generateBrickOutline({
            strokeWidth: s,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg, oneArg],
            hasLeftNotch: true,
        });
        // The tab semicircle is the only arc travelling upward (dx=0, dy<0) on the path.
        const tabs = parseArcs(r.path).filter((a) => a.dx === 0 && a.dy < 0);
        expect(tabs).toHaveLength(1);
        expect(tabs[0].rx).toBe(H_NOTCH_RADIUS);
        // The groove is wider than the tab so it receives it cleanly.
        expect(H_NOTCH_RADIUS).toBeLessThan(H_NOTCH_RADIUS + s);
    });

    it('right grooves do not change width/height (concave, cut inward)', () => {
        const input: BrickOutlineInput = {
            strokeWidth: 2,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg],
        };
        const r = generateBrickOutline(input);
        const dims = computeDimensions(input, MINIMUMS);
        // Grooves are concave, so the outline's size still matches the raw dimensions.
        expect(r.width).toBe(dims.width);
        expect(r.height).toBe(dims.height);
    });

    it('left tab centre aligns with the top right groove (both at NOTCH_OFFSET_Y)', () => {
        const s = 2;
        const r = generateBrickOutline({
            strokeWidth: s,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg, oneArg],
            hasLeftNotch: true,
        });
        const grooveCentres = semicircleCentresY(r.path, H_NOTCH_RADIUS + s);
        const tabCentre = leftTabCentreY(r.path);

        expect(tabCentre).toBeDefined();
        expect(grooveCentres[0]).toBeCloseTo(NOTCH_OFFSET_Y);
        expect(tabCentre).toBeCloseTo(grooveCentres[0]);
    });

    it('groove centres anchor to each arg slot top + offset (handles uneven heights)', () => {
        // Slot tops: 0, 40, 100 -> centres: 9, 49, 109 (with NOTCH_OFFSET_Y = 9).
        const s = 2;
        const r = generateBrickOutline({
            strokeWidth: s,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [
                { param: null, arg: { w: 50, h: 40 } },
                { param: null, arg: { w: 50, h: 60 } },
                { param: null, arg: { w: 50, h: 40 } },
            ],
        });
        const centres = semicircleCentresY(r.path, H_NOTCH_RADIUS + s);
        expect(centres[0]).toBeCloseTo(0 + NOTCH_OFFSET_Y);
        expect(centres[1]).toBeCloseTo(40 + NOTCH_OFFSET_Y);
        expect(centres[2]).toBeCloseTo(40 + 60 + NOTCH_OFFSET_Y);
    });

    it('the outline still closes (net displacement = 0) with notches on', () => {
        const simple = generateBrickOutline({
            strokeWidth: 2,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg, oneArg],
            hasLeftNotch: true,
        });
        const compound = generateBrickOutline({
            strokeWidth: 2,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg, oneArg],
            nestingDims: { w: 80, h: 80 },
            hasLeftNotch: true,
        });
        for (const r of [simple, compound]) {
            const { dx, dy } = netDisplacementFull(r.path);
            expect(dx).toBeCloseTo(0);
            expect(dy).toBeCloseTo(0);
        }
    });

    it('draws no tab when the stroke is too large for the notch to fit', () => {
        // At strokeWidth = 2 * V_NOTCH_RADIUS the V-notch tab degenerates; the H-notch
        // geometry also can't fit within the brick's drawable area at this stroke size.
        const noTab = generateBrickOutline({
            strokeWidth: 2 * V_NOTCH_RADIUS,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [oneArg],
            hasLeftNotch: true,
        });
        expect(parseArcs(noTab.path)).toHaveLength(0);
    });
});
