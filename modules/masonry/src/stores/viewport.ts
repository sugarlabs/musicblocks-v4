import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';

export interface WorkspaceViewportStore {
    /** How far the canvas has been panned, in pixels; every tower is drawn shifted by this much. */
    offset: Point;

    /** Moves the viewport to `offset`; writing the offset it already has notifies no subscriber. */
    setOffset: (offset: Point) => void;
    /** Shifts the viewport by `delta`; a zero delta notifies no subscriber. */
    panBy: (delta: Point) => void;
    /** Returns the viewport to the unpanned origin. */
    resetOffset: () => void;
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
 */
export const useWorkspaceViewportStore = create<WorkspaceViewportStore>()(
    subscribeWithSelector((set, get) => ({
        offset: { x: 0, y: 0 },

        setOffset: (offset) => {
            const current = get().offset;
            // Every notification rewrites the canvas transform, so a write that changes nothing
            // must not notify.
            if (current.x === offset.x && current.y === offset.y) return;

            // Copied, so a caller holding on to its point cannot move the canvas by mutating it.
            set({ offset: { x: offset.x, y: offset.y } });
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
