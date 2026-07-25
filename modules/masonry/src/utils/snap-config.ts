import type { Point } from '@/@types/common.types';

import type { CollisionSpace } from './collision';

/**
 * How close (in canvas px) a dragged tower's open connector must come to a target connector to snap.
 * Connector points are only a few px across, so probing with their own footprint would demand
 * pixel-perfect alignment; the drop probes a tolerance box this size instead. Tunable: raise for a
 * more forgiving snap, lower for a stricter one.
 */
export const SNAP_DISTANCE = 50;

// Centred on the dragged connector, so the box reaches SNAP_DISTANCE in every direction.
const SNAP_PROBE_SIZE = SNAP_DISTANCE * 2;

// The dragged connector is not tracked in the space, so any absent id works as a probe.
const PROBE_OBJECT_ID = -1;

/**
 * Queries a connector collision space for every tracked connector within snap distance of `center`,
 * widening the near-point connectors into a snap zone (square, any-overlap) so that getting close is
 * enough.
 *
 * @returns The ids of the connectors in range, for the caller to validate and rank.
 */
export function querySnap(space: CollisionSpace, center: Point): number[] {
    space.setOptions({ shape: 'square', threshold: 0 });

    return space.checkCollision({
        id: PROBE_OBJECT_ID,
        x: center.x,
        y: center.y,
        w: SNAP_PROBE_SIZE,
        h: SNAP_PROBE_SIZE,
    });
}
