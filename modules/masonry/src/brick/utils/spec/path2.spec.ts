import type { BrickMinimums, BrickOutlineInput } from '@masonry/@types/brick';

import {
    HEAD_PAD_X1,
    HEAD_PAD_X2,
    LABEL_PARAM_GUTTER_X,
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

const generateBrickOutline2 = createBrickOutlineGenerator(MINIMUMS);

// ────────────────────────── Helpers ──────────────────────────────────────────────────────────────

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
            // headHeight = HEAD_PAD_Y1 + max(10,20) + HEAD_PAD_Y2 = 28 ; no tail
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
            // headHeight = s/2 + HEAD_PAD_Y1 + max(30,20) + HEAD_PAD_Y2 + s/2 = 3+4+30+4+3 = 44
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
            // height = headHeight + (nestHeight + s/2 + TAIL_STEP_H + s/2)
            expect(dims.height).toBe(32 + 50 + TAIL_STEP_H + s);
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
            // argsTotalHeight = 30 + 30 = 60 ; no gutter added (args account for their own strokes)
            expect(dims.headHeight).toBe(30 + 30);
        });
    });
});

// ────────────────────────── generateBrickOutline2 ────────────────────────────────────────────────

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
                const { dx, dy } = netDisplacement(generateBrickOutline2(input).path);
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

// ────────────────────────── Notches ──────────────────────────────────────────────────────────────

describe('path V2: notches', () => {
    const baseInput: BrickOutlineInput = {
        strokeWidth: 2,
        labelDims: { w: 80, h: 20 },
        paramArgDims: [],
    };

    it('outputs zero depths when no notches are specified', () => {
        const result = generateBrickOutline2(baseInput);
        expect(result.topNotchDepth).toBe(0);
        expect(result.bottomNotchDepth).toBe(0);
        expect(result.nestedTopNotchDepth).toBe(0);
        expect(result.nestedBottomNotchDepth).toBe(0);
    });

    it('outputs correct depths for top and bottom notches', () => {
        const result = generateBrickOutline2({ ...baseInput, topNotch: true, bottomNotch: true });
        expect(result.topNotchDepth).toBe(0); // top notch is an inward groove
        expect(result.bottomNotchDepth).toBe(2); // NOTCH_DEPTH
    });

    it('outputs correct depths for nested notches on a nesting brick', () => {
        const result = generateBrickOutline2({
            ...baseInput,
            nestingDims: { w: 50, h: 50 },
            nestedTopNotch: true,
            nestedBottomNotch: true,
        });
        expect(result.nestedTopNotchDepth).toBe(0); // inward into cavity
        expect(result.nestedBottomNotchDepth).toBe(0); // inward into foot
    });

    it('ignores nested notches if there is no nesting', () => {
        const result = generateBrickOutline2({
            ...baseInput,
            nestedTopNotch: true,
            nestedBottomNotch: true,
        });
        expect(result.nestedTopNotchDepth).toBe(0);
        expect(result.nestedBottomNotchDepth).toBe(0);
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
