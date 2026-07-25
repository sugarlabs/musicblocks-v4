import type { Point } from '@/@types/common.types';

import type { QuadtreeCollisionSpace } from './collision';

/**
 * How close (in canvas px) a dragged tower's open connector must come to a target connector for a
 * snap. The stored connector points are only a few px across, so probing with their own footprint
 * would demand near-pixel-perfect alignment; instead the drop probes a tolerance box this size
 * around the dragged connector. Tunable: raise for a more forgiving snap, lower for a stricter one.
 */
export const SNAP_DISTANCE = 50;

// The tolerance box is centred on the dragged connector; with the space set to any-overlap
// (threshold 0) a hit fires whenever a target point falls inside roughly `SNAP_DISTANCE` px of it.
const SNAP_PROBE_SIZE = SNAP_DISTANCE * 2;

// A collision-space probe needs an id, but the dragged connector is not itself tracked in the
// space, so any id absent from the space works; a negative sentinel makes that obvious.
const PROBE_OBJECT_ID = -1;

/**
 * Queries a connector collision space for the ids of every tracked connector within snap distance
 * of `center`. Widens the near-point connectors to a snap zone (square, any-overlap) so getting
 * close is enough — the caller then validates and ranks the hits.
 */
export function querySnap(space: QuadtreeCollisionSpace, center: Point): number[] {
    space.setOptions({ shape: 'square', threshold: 0 });
    return space.checkCollision({
        id: PROBE_OBJECT_ID,
        x: center.x,
        y: center.y,
        w: SNAP_PROBE_SIZE,
        h: SNAP_PROBE_SIZE,
    });
}
