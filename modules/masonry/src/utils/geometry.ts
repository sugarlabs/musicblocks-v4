import type { Bounds, Point } from '@/@types/common.types';

import { AUTO_PAN_BAND, AUTO_PAN_MAX_STEP } from './constants';

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

/** How far one axis pans this frame. Only the nearer of its two edges counts. */
function axisStep(fromStart: number, fromEnd: number): number {
    const towardsStart = fromStart <= fromEnd;
    const distance = towardsStart ? fromStart : fromEnd;

    const depth = AUTO_PAN_BAND - distance;
    if (depth <= 0) return 0;

    const eased = Math.min(depth / AUTO_PAN_BAND, 1) * AUTO_PAN_MAX_STEP;

    return towardsStart ? eased : -eased;
}

/**
 * How far the viewport should pan this frame for a drag at `pointer` over `canvas`.
 *
 * The step is positive near the left and top edges, negative near the right and bottom, and grows
 * as the pointer gets closer. A canvas that is unmeasured or has no width or height never pans.
 */
export function edgePanStep(pointer: Point, canvas: Bounds | null): Point {
    if (!canvas || canvas.w === 0 || canvas.h === 0) return { x: 0, y: 0 };

    return {
        x: axisStep(pointer.x - canvas.x, canvas.x + canvas.w - pointer.x),
        y: axisStep(pointer.y - canvas.y, canvas.y + canvas.h - pointer.y),
    };
}
