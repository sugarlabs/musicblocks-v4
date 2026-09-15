// Unit tests for the pie menu's ring geometry. Pure arithmetic — no DOM — so this runs in the node
// environment. Angles are measured clockwise from twelve o'clock, in a space whose y grows down
// the screen, which is what puts a positive angle to the right of the top.

import { describe, expect, it } from 'vitest';

import { ACTION_MENU_RING, SCALE_LEVEL_CONFIG } from './constants';
import { ringAtScale, wedgeAngles, wedgeCentre, wedgePath } from './pie-menu';

// -------------------------------------------------------------------------------------------------

/** The ring at the default scale level, which is the one the wedge tests are written against. */
const ring = ringAtScale(2);

/**
 * Pulls the points a path visits out of it, so a test can ask where its corners landed. Every
 * command ends at a point, and `A` carries its radii and flags in front of that point, so the last
 * two numbers of each command are the only ones that are coordinates.
 */
function pointsOf(path: string): { x: number; y: number }[] {
    return path
        .split(/(?=[MLAZ])/)
        .map((command) => command.match(/-?\d+(?:\.\d+)?/g))
        .filter((numbers): numbers is RegExpMatchArray => numbers !== null)
        .map((numbers) => ({ x: Number(numbers.at(-2)), y: Number(numbers.at(-1)) }));
}

/** How far a point sits from the ring's centre. */
function radiusOf(point: { x: number; y: number }): number {
    return Math.hypot(point.x, point.y);
}

// -------------------------------------------------------------------------------------------------

describe('ringAtScale', () => {
    it('reports the configured radii at the default scale level', () => {
        // `brickScale` is 1 there, so the config is the ring as written.
        expect(SCALE_LEVEL_CONFIG[2].brickScale).toBe(1);
        expect(ring).toEqual({
            innerRadius: ACTION_MENU_RING.innerRadius,
            outerRadius: ACTION_MENU_RING.outerRadius,
        });
    });

    it('scales both radii with the level, so the menu sits on the brick at each one', () => {
        expect(ringAtScale(1).outerRadius).toBeLessThan(ring.outerRadius);
        expect(ringAtScale(3).outerRadius).toBeGreaterThan(ring.outerRadius);
    });

    it('keeps the hole in proportion, rather than only growing the outer edge', () => {
        for (const level of [1, 2, 3] as const) {
            const scaled = ringAtScale(level);
            const ratio = scaled.innerRadius / scaled.outerRadius;

            expect(ratio).toBeCloseTo(ACTION_MENU_RING.innerRadius / ACTION_MENU_RING.outerRadius);
        }
    });
});

describe('wedgeAngles', () => {
    it('centres the first wedge at twelve o’clock', () => {
        const { start, end } = wedgeAngles(0, 3, 0);

        expect((start + end) / 2).toBeCloseTo(-90);
    });

    it('gives every wedge an equal share of the circle', () => {
        const spans = [0, 1, 2].map((index) => {
            const { start, end } = wedgeAngles(index, 3, 4);
            return end - start;
        });

        expect(spans[1]).toBeCloseTo(spans[0]);
        expect(spans[2]).toBeCloseTo(spans[0]);
    });

    it('takes the gap off the slice, splitting it between the two neighbours', () => {
        const { start, end } = wedgeAngles(0, 4, 10);

        expect(end - start).toBeCloseTo(360 / 4 - 10);
    });

    it('leaves the wedges the gap between them and no more', () => {
        const first = wedgeAngles(0, 3, 6);
        const second = wedgeAngles(1, 3, 6);

        expect(second.start - first.end).toBeCloseTo(6);
    });

    it('clamps a gap wider than the slice, so the wedge never doubles back on itself', () => {
        const { start, end } = wedgeAngles(0, 8, 90);

        expect(end).toBeGreaterThan(start);
    });

    it('hands a lone wedge the whole circle, less its gap', () => {
        const { start, end } = wedgeAngles(0, 1, 4);

        expect(end - start).toBeCloseTo(356);
    });
});

describe('wedgePath', () => {
    const path = wedgePath(wedgeAngles(0, 3, 4), ring);

    it('closes back on the point it started from', () => {
        const points = pointsOf(path);

        expect(points.at(-1)).toEqual(points[0]);
        expect(path.endsWith('Z')).toBe(true);
    });

    it('rides the two radii and nothing between them', () => {
        for (const point of pointsOf(path)) {
            const radius = radiusOf(point);
            const onInner = Math.abs(radius - ring.innerRadius) < 0.05;
            const onOuter = Math.abs(radius - ring.outerRadius) < 0.05;

            expect(onInner || onOuter).toBe(true);
        }
    });

    it('sweeps the outer arc forwards and the inner one back, leaving the hole open', () => {
        // One arc each way is what makes the wedge an annulus rather than a filled pie slice.
        expect(path).toContain(`A ${ring.outerRadius} ${ring.outerRadius} 0 0 1`);
        expect(path).toContain(`A ${ring.innerRadius} ${ring.innerRadius} 0 0 0`);
    });

    it('flags the long way round once a wedge spans more than half the circle', () => {
        const lone = wedgePath(wedgeAngles(0, 1, 4), ring);

        expect(lone).toContain(`A ${ring.outerRadius} ${ring.outerRadius} 0 1 1`);
    });
});

describe('wedgeCentre', () => {
    it('sits midway through the ring, where an icon has the most room', () => {
        const centre = wedgeCentre(wedgeAngles(0, 3, 4), ring);

        expect(radiusOf(centre)).toBeCloseTo((ring.innerRadius + ring.outerRadius) / 2, 1);
    });

    it('puts the first wedge of three above the brick, and the others below it', () => {
        const [top, right, left] = [0, 1, 2].map((index) =>
            wedgeCentre(wedgeAngles(index, 3, 4), ring),
        );

        expect(top.y).toBeLessThan(0);
        expect(top.x).toBeCloseTo(0);
        expect(right.y).toBeGreaterThan(0);
        expect(right.x).toBeGreaterThan(0);
        expect(left.y).toBeGreaterThan(0);
        expect(left.x).toBeLessThan(0);
    });
});
