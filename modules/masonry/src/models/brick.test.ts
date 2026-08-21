// Unit tests for the brick model's scale handling and its nesting fold state. The outline generator
// works in SVG units and the canvas in pixels, related by `brickScale`; these cover the conversion
// the model does on the way out. Pure model logic — no DOM — so this runs in the node environment,
// with `widgetDims` set directly rather than measured.

import { describe, expect, it } from 'vitest';

import { makeEmptyExpression, makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { StatementBrickModel } from '@/models/brick';
import { SCALE_LEVEL_CONFIG, SCALE_LEVELS, type ScaleLevel } from '@/utils/constants';

// -------------------------------------------------------------------------------------------------

/** A bare statement — no widget, no params, no cavity — so its size is the level's minimum. */
function bareStatement(level: ScaleLevel) {
    const node = makeEmptyStatement('bare', 0);
    node.model.scaleLevel = level;
    node.model.widgetDims = { w: 0, h: 0 };
    node.model.computeOutline();
    return node.model;
}

/** An expression holding one value in its single slot, both measured and sized at `level`. */
function filledSlot(level: ScaleLevel) {
    const parent = makeEmptyExpression('parent', 1);
    const child = makeEmptyValue('child');

    parent.model.scaleLevel = level;
    child.model.scaleLevel = level;
    parent.model.widgetDims = { w: 60, h: 14 };
    child.model.widgetDims = { w: 40, h: 14 };

    // The order the layout uses: measure the child, hand its size to the parent, then lay the
    // parent out around it.
    child.model.computeDims();
    parent.model.argDims = [{ w: child.model.dims.w, h: child.model.dims.h }];
    parent.model.computeOutline();

    return { parent: parent.model, child: child.model };
}

/** The cavity height, in pixels, a folded brick collapses to at `level`. */
function minCavity(level: ScaleLevel) {
    return SCALE_LEVEL_CONFIG[level].minArgNestHeight;
}

/**
 * A statement whose cavity has been measured at `cavityDims`, laid out folded or unfolded.
 *
 * Mirrors the order the layout works in: the nested chain is measured into `nestingDims`, then the
 * brick is laid out around it. `cavityDims` is in pixels, as the layout reports it.
 */
function nestingStatement(
    cavityDims: { w: number; h: number },
    isFolded: boolean,
    level: ScaleLevel = 2,
) {
    const node = makeEmptyStatement('nesting', 0, true);
    node.model.scaleLevel = level;
    node.model.widgetDims = { w: 60, h: 14 };
    node.model.nestingDims = cavityDims;
    node.model.isNestingFolded = isFolded;
    node.model.computeOutline();
    return node.model;
}

/** A statement with no cavity at all, sized like `nestingStatement`'s head. */
function plainStatement() {
    const node = makeEmptyStatement('plain', 0);
    node.model.widgetDims = { w: 60, h: 14 };
    node.model.computeOutline();
    return node.model;
}

// -------------------------------------------------------------------------------------------------

describe('BrickModel scale level', () => {
    describe('dimensions', () => {
        it.each(SCALE_LEVELS)('reports level %i in pixels, not generator units', (level) => {
            // `minWidth` is configured in pixels, so a brick with nothing in it should come out at
            // exactly that. Skipping the conversion would divide it by `brickScale` instead —
            // 106.67 at level 1, 96 at level 3 — which is invisible only at level 2, where the
            // factor happens to be 1.
            expect(bareStatement(level).dims.w).toBe(SCALE_LEVEL_CONFIG[level].minWidth);
        });

        it('grows as the level goes up', () => {
            const widths = SCALE_LEVELS.map((level) => bareStatement(level).dims.w);
            const heights = SCALE_LEVELS.map((level) => bareStatement(level).dims.h);

            expect(widths).toEqual([...widths].sort((a, b) => a - b));
            expect(heights).toEqual([...heights].sort((a, b) => a - b));
            expect(new Set(widths).size).toBe(SCALE_LEVELS.length);
        });

        it('resizes a brick that changes level after it was already laid out', () => {
            const node = makeEmptyStatement('resized', 0);
            node.model.widgetDims = { w: 0, h: 0 };
            node.model.computeDims();
            const before = node.model.dims.w;

            node.model.scaleLevel = 3;
            node.model.computeDims();

            expect(node.model.dims.w).toBeGreaterThan(before);
            expect(node.model.dims.w).toBe(SCALE_LEVEL_CONFIG[3].minWidth);
        });
    });

    describe('argument slots', () => {
        it.each(SCALE_LEVELS)('sizes a slot at level %i to hold its child', (level) => {
            const { parent, child } = filledSlot(level);
            const slot = parent.bounds.args![0]!;

            // Parent and child are in the same units, so the slot has to cover the child. A missed
            // conversion breaks this at level 3, where the slot comes out 0.8x too small.
            expect(slot.w).toBe(child.dims.w);
            expect(slot.h).toBeGreaterThanOrEqual(child.dims.h);
            // Never wider than it needs to be either — the level-1 failure is a 1.33x gap.
            expect(slot.h).toBe(Math.max(child.dims.h, SCALE_LEVEL_CONFIG[level].minArgNestHeight));
        });

        it('keeps the parent wide enough for its child at every level', () => {
            for (const level of SCALE_LEVELS) {
                const { parent, child } = filledSlot(level);
                expect(parent.dims.w).toBeGreaterThanOrEqual(child.dims.w);
            }
        });
    });

    describe('connector coordinates', () => {
        it('scales notch offsets by brickScale', () => {
            // The notch sits a fixed distance from the left edge in generator units, so in pixels
            // that distance is directly proportional to `brickScale` — the cleanest read on whether
            // the conversion happened at all.
            const offsets = SCALE_LEVELS.map((level) => bareStatement(level).getConnectorCoords());

            SCALE_LEVELS.forEach((level, index) => {
                const atLevel = offsets[index].prev!.x;
                const atDefault = offsets[SCALE_LEVELS.indexOf(2)].prev!.x;
                expect(atLevel).toBeCloseTo(atDefault * SCALE_LEVEL_CONFIG[level].brickScale, 6);
            });
        });

        it('puts the sequence notches on the brick edges in pixel space', () => {
            for (const level of SCALE_LEVELS) {
                const model = bareStatement(level);
                const { prev, next } = model.getConnectorCoords();

                // Both notch centres sit half a notch depth off their edge, so `prev` hugs the top
                // and `next` the bottom. That only holds if notches and `dims` share units: leave
                // the conversion out and `next` drifts a whole `brickScale` away from the edge.
                expect(prev!.y).toBeGreaterThan(0);
                expect(prev!.y).toBeLessThan(model.dims.h / 2);
                expect(next!.y).toBeGreaterThan(model.dims.h / 2);
                expect(next!.y - model.dims.h).toBeLessThan(SCALE_LEVEL_CONFIG[level].minWidth / 8);
            }
        });
    });
});

// -------------------------------------------------------------------------------------------------

describe('StatementBrickModel nesting fold', () => {
    describe('update notification', () => {
        it('notifies on a change, matching the other rendering state', () => {
            const model = makeEmptyStatement('folds', 0, true).model;
            const notifications: boolean[] = [];
            model.registerUpdateCallback(() => notifications.push(model.isNestingFolded));

            model.isNestingFolded = true;
            model.isNestingFolded = false;

            // Without the notification the view never learns the flag moved: `BrickViewFixed`
            // re-renders off these callbacks alone.
            expect(notifications).toEqual([true, false]);
        });

        it('stays quiet on a write that changes nothing', () => {
            const model = makeEmptyStatement('folds', 0, true).model;
            let notifications = 0;
            model.registerUpdateCallback(() => notifications++);

            model.isNestingFolded = false;
            model.isNestingFolded = true;
            model.isNestingFolded = true;

            // Each notification re-renders the brick and, in the workspace, re-runs its tower's
            // layout, so a redundant write must not reach the callbacks.
            expect(notifications).toBe(1);
        });

        it('does not notify while being constructed folded', () => {
            let notifications = 0;
            const model = new StatementBrickModel({
                colorsDefault: { background: '#000', foreground: '#fff', border: '#000' },
                tooltipText: '',
                widget: { type: 'label', text: 'folded' },
                hasNesting: true,
                isNestingFolded: true,
            });
            model.registerUpdateCallback(() => notifications++);

            expect(model.isNestingFolded).toBe(true);
            expect(notifications).toBe(0);
        });
    });

    describe('dimensions', () => {
        // Run at every level: the collapsed height crosses the pixel/generator boundary like any
        // other measurement, and at level 2 `brickScale` is 1, so a missing conversion would pass
        // there unnoticed.
        it.each(SCALE_LEVELS)(
            'collapses the cavity to the minimum at level %i, keeping the brick anchored at its top',
            (level) => {
                const expanded = nestingStatement({ w: 120, h: 200 }, false, level);
                const folded = nestingStatement({ w: 120, h: 200 }, true, level);

                // The height the fold reclaims is what #768 hands to the bricks below.
                expect(expanded.dims.h - folded.dims.h).toBeCloseTo(200 - minCavity(level), 6);
                expect(folded.bounds.nesting!.h).toBeCloseTo(minCavity(level), 6);
            },
        );

        it('keeps its width, so folding changes the height alone', () => {
            const expanded = nestingStatement({ w: 300, h: 200 }, false);
            const folded = nestingStatement({ w: 300, h: 200 }, true);

            // A cavity wider than the head stretches the brick. Reporting the cavity as fully
            // zero would let it snap back to the minimum width, redrawing a brick the user only
            // asked to fold.
            expect(folded.dims.w).toBeCloseTo(expanded.dims.w, 6);
            expect(folded.dims.w).toBeGreaterThan(plainStatement().dims.w);
        });

        it('reports the same height whatever the hidden chain measures', () => {
            const tall = nestingStatement({ w: 120, h: 400 }, true);
            const short = nestingStatement({ w: 120, h: 60 }, true);

            expect(tall.dims.h).toBeCloseTo(short.dims.h, 6);
        });
    });

    describe('outline', () => {
        it('keeps the cavity rather than flattening into a plain statement', () => {
            const folded = nestingStatement({ w: 120, h: 200 }, true);
            const plain = plainStatement();

            // `BrickOutlineGenerator` infers `hasNesting` from the cavity dims being present at
            // all, so a folded brick that dropped them would lose its C shape entirely.
            expect(folded.bounds.nesting).toBeDefined();
            expect(plain.bounds.nesting).toBeUndefined();
            expect(folded.path).not.toBe(plain.path);
            expect(folded.dims.h).toBeGreaterThan(plain.dims.h);
        });

        it('leaves the head untouched', () => {
            const expanded = nestingStatement({ w: 120, h: 200 }, false);
            const folded = nestingStatement({ w: 120, h: 200 }, true);

            // Everything above the cavity belongs to the brick itself, not to what it holds.
            expect(folded.bounds.widget).toEqual(expanded.bounds.widget);
            expect(folded.bounds.nesting!.x).toBeCloseTo(expanded.bounds.nesting!.x, 6);
            expect(folded.bounds.nesting!.y).toBeCloseTo(expanded.bounds.nesting!.y, 6);
        });
    });

    describe('connector coordinates', () => {
        it('keeps the cavity connector, at the same roof, while folded', () => {
            const expanded = nestingStatement({ w: 120, h: 200 }, false).getConnectorCoords();
            const folded = nestingStatement({ w: 120, h: 200 }, true).getConnectorCoords();

            // The hidden sub-tree still hangs off this notch, and the roof it sits on is the head's
            // bottom edge, which the fold does not move.
            expect(folded.nestedNext).toBeDefined();
            expect(folded.nestedNext!.x).toBeCloseTo(expanded.nestedNext!.x, 6);
            expect(folded.nestedNext!.y).toBeCloseTo(expanded.nestedNext!.y, 6);
        });

        it('brings the sequence notches in with the folded edges', () => {
            const expanded = nestingStatement({ w: 120, h: 200 }, false);
            const folded = nestingStatement({ w: 120, h: 200 }, true);

            const expandedCoords = expanded.getConnectorCoords();
            const foldedCoords = folded.getConnectorCoords();

            // `prev` rides the top edge, which never moves; `next` rides the bottom, which rises by
            // the collapsed height. Reporting the expanded `next` is what would leave the brick
            // below snapping to a notch that is no longer drawn there.
            expect(foldedCoords.prev!.y).toBeCloseTo(expandedCoords.prev!.y, 6);
            expect(expandedCoords.next!.y - foldedCoords.next!.y).toBeCloseTo(
                200 - minCavity(2),
                6,
            );
            expect(foldedCoords.next!.y).toBeGreaterThan(folded.dims.h / 2);
        });
    });
});
