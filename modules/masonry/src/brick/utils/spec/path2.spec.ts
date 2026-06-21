import type { BrickMinimums, BrickOutlineInput } from '@masonry/@types/brick';

import {
    HEAD_PAD_X1,
    HEAD_PAD_X2,
    HEAD_PAD_Y1,
    LABEL_PARAM_GUTTER_X,
    PARAM_GUTTER_Y,
    H_NOTCH_RADIUS,
    V_NOTCH_RADIUS,
    NOTCH_OFFSET_X,
    NOTCH_OFFSET_Y,
    CORNER_RADIUS,
    TAIL_INDENT_W,
    TAIL_STEP_H,
    TAIL_STEP_W,
    arc,
    buildVGroove,
    buildVTab,
    segTopEdge,
    segHeadRight,
    segHeadBottom,
    segLeftEdge,
    segTailCavityRoof,
    segTailCavityLeft,
    segTailFoot,
    segTailStepRight,
    segTailStepBottom,
    computeArgNotchCentreYs,
    computeDimensions,
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

// ────────────────────────── 1. arc() — the relative-arc primitive ──────────────────────────────────

describe('path V2: arc() primitive', () => {
    it('emits "a rx ry 0 0 sweep dx dy" with the radius taken from the centre offset', () => {
        // radius = |start→centre| = hypot(3, 0) = 3; displacement = end (1,1).
        expect(arc({ x: 1, y: 1 }, { x: 3, y: 0 })).toBe('a 3 3 0 0 1 1 1');
    });

    it('a clockwise (y-down) turn sets sweep flag 1', () => {
        // Convex top-right corner: end (CR, CR), centre (CR, 0).
        expect(arc({ x: 3, y: 3 }, { x: 3, y: 0 })).toBe('a 3 3 0 0 1 3 3');
    });

    it('a counter-clockwise turn sets sweep flag 0', () => {
        // Same radius, opposite turn: end (CR, -CR), centre (CR, 0).
        expect(arc({ x: 3, y: -3 }, { x: 3, y: 0 })).toBe('a 3 3 0 0 0 3 -3');
    });

    it('a degenerate (zero-offset) centre produces a zero-radius arc (sweep 0)', () => {
        // The cross product is exactly 0, so the "< 0" test is false → sweep flag 0.
        expect(arc({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe('a 0 0 0 0 0 0 0');
    });
});

// ────────────────────────── 2. buildVGroove() / buildVTab() — V-notch shapes ───────────────────────

describe('path V2: buildVGroove() (inward U groove, left → right)', () => {
    it('builds two lip arcs around a semicircle of radius V_NOTCH_RADIUS + strokeWidth', () => {
        // s = 2 → grooveR = 3 + 2 = 5, lip = s/2 = 1, R = grooveR - lip = 4.
        expect(buildVGroove(2)).toEqual([
            'a 1 1 0 0 1 1 1',
            'a 4 4 0 0 0 4 4',
            'a 4 4 0 0 0 4 -4',
            'a 1 1 0 0 1 1 -1',
        ]);
    });

    it('net displacement spans 2*(V_NOTCH_RADIUS + strokeWidth) in x and returns to the same y', () => {
        // The groove must come back to the edge line (dy net 0) and advance by its full width.
        const { dx, dy } = netDisplacementFull('M 0 0 ' + buildVGroove(2).join(' '));
        expect(dx).toBe(2 * (V_NOTCH_RADIUS + 2));
        expect(dy).toBe(0);
    });

    it('at s = 0 the lip arcs collapse to zero radius (just the bare semicircle)', () => {
        // The zero-radius lip arcs degenerate to sweep 0 (cross product is exactly 0).
        expect(buildVGroove(0)).toEqual([
            'a 0 0 0 0 0 0 0',
            'a 3 3 0 0 0 3 3',
            'a 3 3 0 0 0 3 -3',
            'a 0 0 0 0 0 0 0',
        ]);
    });
});

describe('path V2: buildVTab() (outward U tab, right → left)', () => {
    it('builds two lip arcs around a semicircle of radius V_NOTCH_RADIUS - strokeWidth/2', () => {
        // s = 2 → lip = 3s/2 = 3, R = V_NOTCH_RADIUS - s/2 = 2. Travels leftwards (−x).
        expect(buildVTab(2)).toEqual([
            'a 3 3 0 0 0 -3 3',
            'a 2 2 0 0 1 -2 2',
            'a 2 2 0 0 1 -2 -2',
            'a 3 3 0 0 0 -3 -3',
        ]);
    });

    it('travels leftward by 2*strokeWidth + 2*V_NOTCH_RADIUS and returns to the same y', () => {
        const { dx, dy } = netDisplacementFull('M 0 0 ' + buildVTab(2).join(' '));
        expect(dx).toBe(-(2 * 2 + 2 * V_NOTCH_RADIUS));
        expect(dy).toBe(0);
    });

    it('the tab semicircle (R) is smaller than the matching groove semicircle (grooveR)', () => {
        // This is what lets a tab seat inside the parent groove with stroke clearance.
        const tabR = V_NOTCH_RADIUS - 2 / 2;
        const grooveR = V_NOTCH_RADIUS + 2;
        expect(tabR).toBeLessThan(grooveR);
    });
});

// ────────────────────────── 3. segTopEdge() — top edge, left → right ───────────────────────────────

describe('path V2: segTopEdge()', () => {
    it('flat top: M start, one h run, convex top-right corner', () => {
        // start x = s/2 + CR = 3; flat = width - s - 2*CR = 120 - 0 - 6 = 114.
        expect(segTopEdge(0, 120, false)).toEqual(['M 3 0', 'h 114', 'a 3 3 0 0 1 3 3']);
    });

    it('insets the start point by s/2 in both axes when stroked', () => {
        // start = "M (s/2+CR) (s/2)" = "M 4 1"; flat = 120 - 2 - 6 = 112.
        expect(segTopEdge(2, 120, false)).toEqual(['M 4 1', 'h 112', 'a 3 3 0 0 1 3 3']);
    });

    it('splices a V-groove between two flat runs when hasTopNotch', () => {
        // flatBefore 3 + V-groove + flatAfter 99; groove centred on NOTCH_OFFSET_X.
        expect(segTopEdge(2, 120, true)).toEqual([
            'M 4 1',
            'h 3',
            ...buildVGroove(2),
            'h 99',
            'a 3 3 0 0 1 3 3',
        ]);
    });

    it('the groove centre lands exactly at NOTCH_OFFSET_X', () => {
        // flatBefore + grooveR (= half the groove) measured from the start x must equal NOTCH_OFFSET_X.
        const startX = 2 / 2 + CORNER_RADIUS;
        const grooveR = V_NOTCH_RADIUS + 2;
        const flatBefore = NOTCH_OFFSET_X - grooveR - 2 / 2 - CORNER_RADIUS;
        expect(startX + flatBefore + grooveR).toBe(NOTCH_OFFSET_X);
    });
});

// ────────────────────────── 4. segHeadRight() — head right edge, top → bottom ──────────────────────

describe('path V2: segHeadRight()', () => {
    it('no notches: single v run to the convex bottom-right corner', () => {
        // edgeStart = s/2 + CR = 4; edgeEnd = headHeight - s/2 - CR = 28 - 1 - 3 = 24; span = 20.
        expect(segHeadRight(2, 28, [])).toEqual(['v 20', 'a 3 3 0 0 1 -3 3']);
    });

    it('draws one concave H-groove per notch centre, radius H_NOTCH_RADIUS + strokeWidth/2', () => {
        // s=2: grooveR 4, lip 1, centre 9; flatBefore 0, trailing run 22.
        expect(segHeadRight(2, 40, [9])).toEqual([
            'v 0',
            'a 1 1 0 0 1 -1 1', // lip in (−x)
            'a 4 4 0 0 0 -4 4', // groove halves
            'a 4 4 0 0 0 4 4',
            'a 1 1 0 0 1 1 1', // lip back out
            'v 22',
            'a 3 3 0 0 1 -3 3',
        ]);
    });

    it('skips a groove that would overlap the previous one or overrun the bottom corner', () => {
        // Centres 2 apart can't both fit in a tiny headHeight, so the edge stays straight.
        expect(segHeadRight(2, 10, [5, 7])).toEqual(['v 2', 'a 3 3 0 0 1 -3 3']);
    });
});

// ────────────────────────── 5. segHeadBottom() — head bottom, right → left ─────────────────────────

describe('path V2: segHeadBottom()', () => {
    it('flat bottom: one h run leftwards, convex bottom-left corner', () => {
        // span = width - s - 2*CR = 120 - 2 - 6 = 112.
        expect(segHeadBottom(2, 120, false)).toEqual(['h -112', 'a 3 3 0 0 1 -3 -3']);
    });

    it('splices an outward V-tab between two flat runs when hasBottomNotch', () => {
        // flatBefore 99 + V-tab + flatAfter 3.
        expect(segHeadBottom(2, 120, true)).toEqual([
            'h -99',
            ...buildVTab(2),
            'h -3',
            'a 3 3 0 0 1 -3 -3',
        ]);
    });

    it('falls back to a flat edge once the stroke is too wide for the tab (s >= 2*V_NOTCH_RADIUS)', () => {
        expect(segHeadBottom(2 * V_NOTCH_RADIUS, 120, true)).toEqual([
            `h ${-(120 - 2 * V_NOTCH_RADIUS - 2 * CORNER_RADIUS)}`,
            'a 3 3 0 0 1 -3 -3',
        ]);
    });
});

// ────────────────────────── 6. segLeftEdge() — left edge, bottom → top ─────────────────────────────

describe('path V2: segLeftEdge()', () => {
    it('no notch: single upward v run to the convex top-left corner', () => {
        // edgeStart = height - s/2 - CR = 28 - 1 - 3 = 24; edgeEnd = s/2 + CR = 4; span = 20.
        expect(segLeftEdge(2, 28, false)).toEqual(['v -20', 'a 3 3 0 0 1 3 -3']);
    });

    it('splices an outward H-tab (radius H_NOTCH_RADIUS - strokeWidth/2) when hasLeftNotch', () => {
        // s=2: tabR 2, lip 3, centre 9; first run 10 up, trailing run 0.
        expect(segLeftEdge(2, 28, true)).toEqual([
            'v -10',
            'a 3 3 0 0 0 -3 -3', // lip out (−x)
            'a 2 2 0 0 1 -2 -2', // tab halves
            'a 2 2 0 0 1 2 -2',
            'a 3 3 0 0 0 3 -3', // lip back in
            'v 0',
            'a 3 3 0 0 1 3 -3',
        ]);
    });

    it('falls back to a flat edge when the tab would not fit between the corners', () => {
        // height = 10 → edgeStart = 6, notchBottom = 14 > 6, so the tab is dropped.
        expect(segLeftEdge(2, 10, true)).toEqual(['v -2', 'a 3 3 0 0 1 3 -3']);
    });
});

// ────────────────────────── 7. segTailCavityRoof() — cavity roof, right → left ─────────────────────

describe('path V2: segTailCavityRoof()', () => {
    it('always carries a nested-top V-tab, ending at the larger concave cavity corner', () => {
        // s=2: cavityCornerRadius 5; flatBefore 91 + V-tab + flatAfter 3.
        expect(segTailCavityRoof(2, 120)).toEqual([
            'h -91',
            ...buildVTab(2),
            'h -3',
            'a 5 5 0 0 0 -5 5',
        ]);
    });

    it('degenerates to a flat roof once s >= 2*V_NOTCH_RADIUS', () => {
        const s = 2 * V_NOTCH_RADIUS;
        const crc = CORNER_RADIUS + s;
        const span = 120 - TAIL_INDENT_W - s - CORNER_RADIUS - crc;
        expect(segTailCavityRoof(s, 120)).toEqual([
            `h ${-span}`,
            `a ${crc} ${crc} 0 0 0 ${-crc} ${crc}`,
        ]);
    });
});

// ────────────────────────── 8. segTailCavityLeft() — cavity spine, top → bottom ────────────────────

describe('path V2: segTailCavityLeft()', () => {
    it('drops straight down the spine to the concave foot corner', () => {
        // cavityCornerRadius = 5; span = nestHeight + s - 2*crc = 50 + 2 - 10 = 42.
        expect(segTailCavityLeft(2, 50)).toEqual(['v 42', 'a 5 5 0 0 0 5 5']);
    });
});

// ────────────────────────── 9. segTailFoot() — cavity foot, left → right ───────────────────────────

describe('path V2: segTailFoot()', () => {
    it('carries a full-size V-groove (receives the nested bottom tab), then the convex step corner', () => {
        // flatBefore 3 + full-size V-groove + flatAfter 3.
        expect(segTailFoot(2)).toEqual(['h 3', ...buildVGroove(2), 'h 3', 'a 3 3 0 0 1 3 3']);
    });
});

// ────────────────────────── 10. segTailStepRight() — step right edge, top → bottom ─────────────────

describe('path V2: segTailStepRight()', () => {
    it('drops by TAIL_STEP_H minus the two corner radii, then the convex corner', () => {
        // v (TAIL_STEP_H - 2*CR) = v (6 - 6) = v 0.
        expect(segTailStepRight()).toEqual(['v 0', 'a 3 3 0 0 1 -3 3']);
    });
});

// ────────────────────────── 11. segTailStepBottom() — step bottom, right → left ────────────────────

describe('path V2: segTailStepBottom()', () => {
    it('flat step bottom: one h run leftwards, convex corner', () => {
        // span = TAIL_STEP_W - 2*CR = 24.
        expect(segTailStepBottom(2, false)).toEqual(['h -24', 'a 3 3 0 0 1 -3 -3']);
    });

    it('splices an outward V-tab between two flat runs when hasBottomNotch', () => {
        // flatBefore 11 + V-tab + flatAfter 3.
        expect(segTailStepBottom(2, true)).toEqual([
            'h -11',
            ...buildVTab(2),
            'h -3',
            'a 3 3 0 0 1 -3 -3',
        ]);
    });

    it('falls back to a flat edge once s >= 2*V_NOTCH_RADIUS', () => {
        expect(segTailStepBottom(2 * V_NOTCH_RADIUS, true)).toEqual([
            `h ${-(TAIL_STEP_W - 2 * CORNER_RADIUS)}`,
            'a 3 3 0 0 1 -3 -3',
        ]);
    });
});

// ────────────────────────── 12. computeArgNotchCentreYs() ──────────────────────────────────────────

describe('path V2: computeArgNotchCentreYs()', () => {
    it('places each centre at the row top + NOTCH_OFFSET_Y, honouring uneven row heights', () => {
        // Row heights 40, 60, 40 → tops 0, 40, 100 → centres 9, 49, 109.
        const centres = computeArgNotchCentreYs(
            [
                { param: null, arg: { w: 50, h: 40 } },
                { param: null, arg: { w: 50, h: 60 } },
                { param: null, arg: { w: 50, h: 40 } },
            ],
            MINIMUMS.minArgHeight,
        );
        expect(centres).toEqual([NOTCH_OFFSET_Y, 40 + NOTCH_OFFSET_Y, 100 + NOTCH_OFFSET_Y]);
    });

    it('skips null-arg rows but still advances past their (min-clamped) height', () => {
        // Row 0 (null arg) occupies minArgHeight = 40 but emits no centre; row 1 sits below it.
        const centres = computeArgNotchCentreYs(
            [
                { param: { w: 40, h: 15 }, arg: null },
                { param: null, arg: { w: 50, h: 40 } },
            ],
            MINIMUMS.minArgHeight,
        );
        expect(centres).toEqual([40 + NOTCH_OFFSET_Y]);
    });

    it('returns an empty list when there are no arg slots', () => {
        expect(computeArgNotchCentreYs([], MINIMUMS.minArgHeight)).toEqual([]);
    });
});

// ────────────────────────── 13. computeDimensions() ────────────────────────────────────────────────

describe('path V2: computeDimensions — width', () => {
    it('main label dominates (no stroke)', () => {
        const dims = computeDimensions(
            { strokeWidth: 0, labelDims: { w: 200, h: 30 }, paramArgDims: [] },
            MINIMUMS,
        );
        // headWidth = HEAD_PAD_X1 + 200 + HEAD_PAD_X2 = 214.
        expect(dims.width).toBe(HEAD_PAD_X1 + 200 + HEAD_PAD_X2);
    });

    it('minWidth floors a small brick', () => {
        const dims = computeDimensions(
            { strokeWidth: 0, labelDims: { w: 30, h: 10 }, paramArgDims: [] },
            MINIMUMS,
        );
        expect(dims.width).toBe(MINIMUMS.minWidth);
    });

    it('adds s/2 + s/2 of stroke clearance when the head dominates', () => {
        const dims = computeDimensions(
            { strokeWidth: 4, labelDims: { w: 200, h: 30 }, paramArgDims: [] },
            MINIMUMS,
        );
        expect(dims.width).toBe(4 + HEAD_PAD_X1 + 200 + HEAD_PAD_X2);
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
        // headWidth = HEAD_PAD_X1 + 60 + LABEL_PARAM_GUTTER_X + 40(maxParam) + HEAD_PAD_X2.
        expect(dims.width).toBe(HEAD_PAD_X1 + 60 + LABEL_PARAM_GUTTER_X + 40 + HEAD_PAD_X2);
    });

    it('a wide nesting region can drive the width', () => {
        const dims = computeDimensions(
            {
                strokeWidth: 0,
                labelDims: { w: 20, h: 10 },
                paramArgDims: [],
                nestingDims: { w: 200, h: 50 },
            },
            MINIMUMS,
        );
        // tailIndentWidth = TAIL_INDENT_W + 200 = 206.
        expect(dims.width).toBe(TAIL_INDENT_W + 200);
    });
});

describe('path V2: computeDimensions — height', () => {
    it('falls back to the main-label minimum height', () => {
        const dims = computeDimensions(
            { strokeWidth: 0, labelDims: { w: 60, h: 10 }, paramArgDims: [] },
            MINIMUMS,
        );
        // headHeight = HEAD_PAD_Y1 + max(10, minLabelHeight) + HEAD_PAD_Y2 = 4 + 20 + 4 = 28.
        expect(dims.headHeight).toBe(28);
        expect(dims.height).toBe(28);
        expect(dims.nestHeight).toBe(0);
    });

    it('stacked null-arg rows drive head height via minArgHeight', () => {
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
        expect(dims.headHeight).toBe(2 * MINIMUMS.minArgHeight);
    });

    it('adds strokeWidth once to the head height (top + bottom margin)', () => {
        const dims = computeDimensions(
            { strokeWidth: 6, labelDims: { w: 60, h: 30 }, paramArgDims: [] },
            MINIMUMS,
        );
        // s/2 + HEAD_PAD_Y1 + max(30, 20) + HEAD_PAD_Y2 + s/2 = 3 + 4 + 30 + 4 + 3 = 44.
        expect(dims.headHeight).toBe(44);
        expect(dims.height).toBe(44);
    });

    it('compound brick height = headHeight + nestHeight + foot step + stroke', () => {
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
        expect(dims.headHeight).toBe(32); // s/2 + HEAD_PAD_Y1 + 20 + HEAD_PAD_Y2 + s/2
        expect(dims.nestHeight).toBe(50); // max(50, minNestHeight)
        expect(dims.height).toBe(32 + 50 + s + TAIL_STEP_H);
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
        // headHeightByParams dominates: s + HEAD_PAD_Y1 + 2*minParamHeight + PARAM_GUTTER_Y + HEAD_PAD_Y2.
        expect(dims.headHeight).toBe(
            s + HEAD_PAD_Y1 + 2 * MINIMUMS.minParamHeight + PARAM_GUTTER_Y + 4,
        );
    });
});

// ────────────────────────── 14. generateBounds() (via the public generator) ────────────────────────

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

    it('anchors the arg box to the right edge and centres the param box vertically in its row', () => {
        const { bounds, width } = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [{ param: { w: 40, h: 20 }, arg: { w: 50, h: 60 } }],
        });
        // Arg sits flush against the outer right edge.
        expect(bounds.args?.[0].x).toBe(width);
        // Param is right-aligned inside the head and vertically centred in the 60-tall row.
        expect(bounds.params?.[0].x).toBe(width - HEAD_PAD_X2 - 40);
        expect(bounds.params?.[0].y).toBe((60 - 20) / 2);
    });
});

// ────────────────────────── 15. createBrickOutlineGenerator() — full-path integration ──────────────

describe('path V2: generateBrickOutline (integration)', () => {
    it('simple brick path with no stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 0,
            labelDims: { w: 60, h: 20 },
            paramArgDims: [],
        });
        expect(result.path).toBe(
            'M 3 0 h 114 a 3 3 0 0 1 3 3 v 22 a 3 3 0 0 1 -3 3 h -114 a 3 3 0 0 1 -3 -3 v -22 a 3 3 0 0 1 3 -3 Z',
        );
        expect(result.width).toBe(120);
        expect(result.height).toBe(28);
    });

    it('simple brick path inset by s/2 with stroke', () => {
        const result = generateBrickOutline({
            strokeWidth: 4,
            labelDims: { w: 200, h: 30 },
            paramArgDims: [],
        });
        expect(result.path).toBe(
            'M 5 2 h 208 a 3 3 0 0 1 3 3 v 32 a 3 3 0 0 1 -3 3 h -208 a 3 3 0 0 1 -3 -3 v -32 a 3 3 0 0 1 3 -3 Z',
        );
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
        expect(result.path).toBe(
            'M 3 0 h 114 a 3 3 0 0 1 3 3 v 22 a 3 3 0 0 1 -3 3 h -96 a 0 0 0 0 0 0 0 a 3 3 0 0 1 -3 3 a 3 3 0 0 1 -3 -3 a 0 0 0 0 0 0 0 h -6 a 3 3 0 0 0 -3 3 v 44 a 3 3 0 0 0 3 3 h 6 a 0 0 0 0 0 0 0 a 3 3 0 0 0 3 3 a 3 3 0 0 0 3 -3 a 0 0 0 0 0 0 0 h 6 a 3 3 0 0 1 3 3 v 0 a 3 3 0 0 1 -3 3 h -24 a 3 3 0 0 1 -3 -3 v -78 a 3 3 0 0 1 3 -3 Z',
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
            'M 5 2 h 110 a 3 3 0 0 1 3 3 v 22 a 3 3 0 0 1 -3 3 h -86 a 6 6 0 0 0 -6 6 a 1 1 0 0 1 -1 1 a 1 1 0 0 1 -1 -1 a 6 6 0 0 0 -6 -6 h 0 a 7 7 0 0 0 -7 7 v 40 a 7 7 0 0 0 7 7 h 0 a 2 2 0 0 1 2 2 a 5 5 0 0 0 5 5 a 5 5 0 0 0 5 -5 a 2 2 0 0 1 2 -2 h 0 a 3 3 0 0 1 3 3 v 0 a 3 3 0 0 1 -3 3 h -24 a 3 3 0 0 1 -3 -3 v -82 a 3 3 0 0 1 3 -3 Z',
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
            const s = 2;
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
            const input: BrickOutlineInput = {
                strokeWidth: 2,
                labelDims: { w: 60, h: 20 },
                paramArgDims: [oneArg, oneArg],
            };
            const r = generateBrickOutline(input);
            const dims = computeDimensions(input, MINIMUMS);
            expect(r.width).toBe(dims.width);
            expect(r.height).toBe(dims.height);
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
            expect(footStepLen(23)).toBeGreaterThan(0);
            expect(footStepLen(24)).toBe(0);
            expect(footStepLen(25)).toBeLessThan(0);
        });

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
            expect(dims.nestHeight - s).toBe(50 - s);
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
