import type { Bounds, Point } from '@/@types/common.types';

/**
 * Whether a client-space point falls inside a client-space rectangle, edges included.
 *
 * `bounds` is nullable so callers can hit-test against a region that may not be on screen — an
 * unmeasured or unmounted target is never under the point.
 */
export function isPointInsideBounds(point: Point, bounds: Bounds | null): boolean {
    if (!bounds) return false;

    return (
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.w &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.h
    );
}
