import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';

export interface WorkspaceViewportStore {
    /** How far the canvas has been panned, in pixels; every tower is drawn shifted by this much. */
    offset: Point;

    /** Moves the viewport to `offset`, clamped at the origin; a no-op write notifies nobody. */
    setOffset: (offset: Point) => void;
    /** Shifts the viewport by `delta`, clamped at the origin; a no-op delta notifies nobody. */
    panBy: (delta: Point) => void;
    /** Returns the viewport to the unpanned origin. */
    resetOffset: () => void;
}

function clampOffset(offset: Point): Point {
    return { x: Math.max(offset.x, 0), y: Math.max(offset.y, 0) };
}

/**
 * Tracks how far the workspace canvas is panned — one offset for the whole workspace, never per
 * tower, since it is the canvas that moves under the towers rather than the towers themselves.
 *
 * Brick coordinates stay canvas-local: the offset is applied once, as a transform on the element
 * that holds the towers, so a pan never re-lays anything out. Anything that turns a client point
 * into a canvas point (a palette drop, say) subtracts it. `panBy` and `resetOffset` are exposed so
 * that wheel scrolling, auto-scroll, keyboard navigation and a home button can drive the same
 * offset the background drag does.
 *
 * The store clamps rather than trusting its callers, the way `scale.ts` does: the offset stops at
 * the origin, each axis on its own, so no caller can pull the canvas back past where it started
 * and leave the top-left of the program out of reach.
 */
export const useWorkspaceViewportStore = create<WorkspaceViewportStore>()(
    subscribeWithSelector((set, get) => ({
        offset: { x: 0, y: 0 },

        setOffset: (offset) => {
            // A fresh point, so a caller holding on to its own cannot move the canvas by
            // mutating it afterwards.
            const next = clampOffset(offset);

            const current = get().offset;
            // Every notification rewrites the canvas transform, so a write that changes nothing
            // must not notify — a pan clamped away at the origin included.
            if (current.x === next.x && current.y === next.y) return;

            set({ offset: next });
        },

        panBy: (delta) => {
            const { offset, setOffset } = get();

            setOffset({ x: offset.x + delta.x, y: offset.y + delta.y });
        },

        resetOffset: () => {
            get().setOffset({ x: 0, y: 0 });
        },
    })),
);
