import type { Point } from '@/@types/common.types';

import { ACTION_MENU_RING, SCALE_LEVEL_CONFIG, type ScaleLevel } from './constants';

/** The two radii of a pie menu's ring, in pixels. */
export interface PieRing {
    /** Radius of the hole in the middle, which the brick shows through. */
    innerRadius: number;
    /** Radius of the ring's outer edge. */
    outerRadius: number;
}

/** The angular span of one wedge, in degrees, measured clockwise from twelve o'clock. */
export interface WedgeAngles {
    start: number;
    end: number;
}

/**
 * The first wedge is centred at twelve o'clock, so the ring reads the same however many wedges it
 * carries and a wedge does not move when one beside it is added.
 */
const FIRST_WEDGE_CENTRE = -90;

/** Two decimals is finer than a pixel at every scale level, and keeps the paths readable. */
function round(value: number): number {
    return Math.round(value * 100) / 100;
}

/** A point on a circle of the given radius, at an angle measured from twelve o'clock. */
function polar(radius: number, degrees: number): Point {
    const radians = (degrees * Math.PI) / 180;

    return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) };
}

/**
 * The ring's radii at a scale level.
 *
 * Sized off `SCALE_LEVEL_CONFIG` rather than the brick it covers: a menu that took its size from
 * the brick would be a different size over every brick, and the wedges are the same three whatever
 * they are opened on.
 */
export function ringAtScale(level: ScaleLevel): PieRing {
    const { brickScale } = SCALE_LEVEL_CONFIG[level];

    return {
        innerRadius: round(ACTION_MENU_RING.innerRadius * brickScale),
        outerRadius: round(ACTION_MENU_RING.outerRadius * brickScale),
    };
}

/**
 * The span one wedge of `count` owns, with the gap between neighbours already taken off both ends.
 *
 * The gap is clamped away rather than allowed to invert the wedge: enough wedges and it would
 * otherwise eat the whole slice, leaving a path that doubles back on itself.
 */
export function wedgeAngles(index: number, count: number, gapDegrees: number): WedgeAngles {
    const slice = 360 / count;
    const gap = Math.min(gapDegrees, slice / 2);
    const centre = FIRST_WEDGE_CENTRE + index * slice;

    return { start: centre - slice / 2 + gap / 2, end: centre + slice / 2 - gap / 2 };
}

/**
 * A path for one wedge, drawn as an annular sector: out along the leading edge, round the outer
 * arc, back in, and round the inner arc the other way. The hole is left by the inner arc rather
 * than by a second element over the top, so nothing the menu draws covers the brick in the middle.
 *
 * `centre` moves the ring's middle off the origin, which is what a CSS `clip-path` wants: its
 * coordinates are measured from the box's top-left corner, and the ring sits in the middle of it.
 */
export function wedgePath(angles: WedgeAngles, ring: PieRing, centre?: Point): string {
    const { innerRadius, outerRadius } = ring;
    const largeArc = angles.end - angles.start > 180 ? 1 : 0;
    const origin = centre ?? { x: 0, y: 0 };

    const innerStart = polar(innerRadius, angles.start);
    const outerStart = polar(outerRadius, angles.start);
    const outerEnd = polar(outerRadius, angles.end);
    const innerEnd = polar(innerRadius, angles.end);

    const at = (point: Point) => `${round(origin.x + point.x)} ${round(origin.y + point.y)}`;

    return [
        `M ${at(innerStart)}`,
        `L ${at(outerStart)}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${at(outerEnd)}`,
        `L ${at(innerEnd)}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${at(innerStart)}`,
        'Z',
    ].join(' ');
}

/** Where a wedge's icon sits, relative to the ring's centre: mid-span, midway out of the ring. */
export function wedgeCentre(angles: WedgeAngles, ring: PieRing): Point {
    const radius = (ring.innerRadius + ring.outerRadius) / 2;
    const point = polar(radius, (angles.start + angles.end) / 2);

    return { x: round(point.x), y: round(point.y) };
}
