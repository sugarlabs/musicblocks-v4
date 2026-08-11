// Unit tests for the point-in-rectangle hit test. Pure arithmetic — no DOM — so this runs in the
// node environment. Coordinates are treated as client-space here, but the function is unitless.

import { describe, expect, it } from 'vitest';

import type { Bounds } from '@/@types/common.types';

import { isPointInsideBounds } from './geometry';

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
