// Unit tests for the point-in-rectangle hit test. Pure arithmetic — no DOM — so this runs in the
// node environment. Coordinates are treated as client-space here, but the function is unitless.

import { describe, expect, it } from 'vitest';

import type { Bounds } from '@/@types/common.types';

import { AUTO_PAN_BAND, AUTO_PAN_MAX_STEP } from './constants';

import { edgePanStep, isPointInsideBounds } from './geometry';

// -------------------------------------------------------------------------------------------------

/** A 40×20 rectangle spanning x 100..140 and y 200..220. */
const bounds: Bounds = { x: 100, y: 200, w: 40, h: 20 };

// -------------------------------------------------------------------------------------------------

describe('isPointInsideBounds', () => {
    it('accepts a point well inside the rectangle', () => {
        expect(isPointInsideBounds({ x: 120, y: 210 }, bounds)).toBe(true);
    });

    it('rejects a point far outside the rectangle', () => {
        expect(isPointInsideBounds({ x: 0, y: 0 }, bounds)).toBe(false);
    });

    it('treats every edge as inside', () => {
        expect(isPointInsideBounds({ x: 100, y: 210 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 140, y: 210 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 120, y: 200 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 120, y: 220 }, bounds)).toBe(true);
    });

    it('treats every corner as inside', () => {
        expect(isPointInsideBounds({ x: 100, y: 200 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 140, y: 200 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 100, y: 220 }, bounds)).toBe(true);
        expect(isPointInsideBounds({ x: 140, y: 220 }, bounds)).toBe(true);
    });

    it('rejects a point one unit beyond each edge', () => {
        expect(isPointInsideBounds({ x: 99, y: 210 }, bounds)).toBe(false);
        expect(isPointInsideBounds({ x: 141, y: 210 }, bounds)).toBe(false);
        expect(isPointInsideBounds({ x: 120, y: 199 }, bounds)).toBe(false);
        expect(isPointInsideBounds({ x: 120, y: 221 }, bounds)).toBe(false);
    });

    it('rejects a point that matches on one axis only', () => {
        // Inside the horizontal span but above the rectangle, and vice versa.
        expect(isPointInsideBounds({ x: 120, y: 0 }, bounds)).toBe(false);
        expect(isPointInsideBounds({ x: 0, y: 210 }, bounds)).toBe(false);
    });

    it('reports no hit against unmeasured bounds instead of throwing', () => {
        expect(isPointInsideBounds({ x: 120, y: 210 }, null)).toBe(false);
    });

    it('matches only the single point a zero-sized rectangle occupies', () => {
        const degenerate: Bounds = { x: 10, y: 10, w: 0, h: 0 };

        expect(isPointInsideBounds({ x: 10, y: 10 }, degenerate)).toBe(true);
        expect(isPointInsideBounds({ x: 11, y: 10 }, degenerate)).toBe(false);
    });
});

// -------------------------------------------------------------------------------------------------

/** A canvas wide enough that the bands on opposite edges don't overlap. */
const CANVAS: Bounds = { x: 100, y: 50, w: 800, h: 600 };

/** A point `distance` px inside the given edge, centred on the other axis. */
function inside(edge: 'left' | 'right' | 'top' | 'bottom', distance: number) {
    const midX = CANVAS.x + CANVAS.w / 2;
    const midY = CANVAS.y + CANVAS.h / 2;

    switch (edge) {
        case 'left':
            return { x: CANVAS.x + distance, y: midY };
        case 'right':
            return { x: CANVAS.x + CANVAS.w - distance, y: midY };
        case 'top':
            return { x: midX, y: CANVAS.y + distance };
        case 'bottom':
            return { x: midX, y: CANVAS.y + CANVAS.h - distance };
    }
}

// -------------------------------------------------------------------------------------------------

describe('edgePanStep', () => {
    it('does not pan from the middle of the canvas', () => {
        expect(edgePanStep(inside('left', CANVAS.w / 2), CANVAS)).toEqual({ x: 0, y: 0 });
    });

    it('does not pan from just outside the band', () => {
        expect(edgePanStep(inside('left', AUTO_PAN_BAND), CANVAS).x).toBe(0);
        expect(edgePanStep(inside('top', AUTO_PAN_BAND), CANVAS).y).toBe(0);
    });

    it('pans towards the canvas left of the towers at the left edge', () => {
        // A positive step grows the offset, which slides the towers right and down.
        expect(edgePanStep(inside('left', 0), CANVAS).x).toBe(AUTO_PAN_MAX_STEP);
        expect(edgePanStep(inside('top', 0), CANVAS).y).toBe(AUTO_PAN_MAX_STEP);
    });

    it('pans the other way at the right and bottom edges', () => {
        expect(edgePanStep(inside('right', 0), CANVAS).x).toBe(-AUTO_PAN_MAX_STEP);
        expect(edgePanStep(inside('bottom', 0), CANVAS).y).toBe(-AUTO_PAN_MAX_STEP);
    });

    it('eases the step in across the band', () => {
        const halfway = edgePanStep(inside('left', AUTO_PAN_BAND / 2), CANVAS).x;

        expect(halfway).toBeCloseTo(AUTO_PAN_MAX_STEP / 2);
        expect(halfway).toBeLessThan(edgePanStep(inside('left', 1), CANVAS).x);
    });

    it('holds at the maximum once the pointer has left the canvas', () => {
        // interact.js keeps tracking the pointer after it leaves the canvas.
        expect(edgePanStep({ x: CANVAS.x - 500, y: CANVAS.y - 500 }, CANVAS)).toEqual({
            x: AUTO_PAN_MAX_STEP,
            y: AUTO_PAN_MAX_STEP,
        });
    });

    it('pans both axes at once in a corner', () => {
        expect(edgePanStep({ x: CANVAS.x, y: CANVAS.y }, CANVAS)).toEqual({
            x: AUTO_PAN_MAX_STEP,
            y: AUTO_PAN_MAX_STEP,
        });
    });

    it('follows the nearer edge on a canvas narrower than two bands', () => {
        const narrow: Bounds = { x: 0, y: 0, w: AUTO_PAN_BAND, h: AUTO_PAN_BAND };

        // Both edges are in range here, so the nearer one has to win.
        expect(edgePanStep({ x: 1, y: 1 }, narrow).x).toBeGreaterThan(0);
        expect(edgePanStep({ x: AUTO_PAN_BAND - 1, y: 1 }, narrow).x).toBeLessThan(0);
    });

    it('does not pan over a canvas that has not been measured', () => {
        expect(edgePanStep({ x: 0, y: 0 }, null)).toEqual({ x: 0, y: 0 });
    });

    it('does not pan over a canvas measuring zero', () => {
        // A hidden canvas measures zero, which would put every pointer past both edges.
        expect(edgePanStep({ x: 500, y: 500 }, { x: 0, y: 0, w: 0, h: 0 })).toEqual({ x: 0, y: 0 });
    });
});
