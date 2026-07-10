import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';

export interface BrickLayoutStore {
    /** Position per brick, keyed by brick (node model) id. */
    coords: Record<string, Point>;
    /** Per-brick, whether ready for rendering, keyed by brick (node model) id. */
    ready: Record<string, boolean>;

    /** Sets a single brick's coordinates. */
    setCoords(id: string, point: Point): void;
    /** Merges a batch of per-brick coordinates into `coords`. */
    setCoords(batch: Record<string, Point>): void;
    /** Merges a batch of per-brick ready flags into `ready`. */
    setReady: (batch: Record<string, boolean>) => void;
}

/**
 * Tracks the on-canvas layout of every brick, keyed by id.
 *
 * `subscribeWithSelector` is used so consumers outside React (e.g. imperative layout code) can
 * subscribe to a single brick's coords in isolation, not just whole-store changes.
 */
export const useBrickLayoutStore = create<BrickLayoutStore>()(
    subscribeWithSelector((set) => ({
        coords: {},
        ready: {},

        setCoords: ((idOrBatch: string | Record<string, Point>, point?: Point) => {
            const batch = typeof idOrBatch === 'string' ? { [idOrBatch]: point! } : idOrBatch;
            set((state) => ({
                coords: {
                    ...state.coords,
                    ...batch,
                },
            }));
        }) as BrickLayoutStore['setCoords'],

        setReady: (batch) => {
            set((state) => ({
                ready: {
                    ...state.ready,
                    ...batch,
                },
            }));
        },
    })),
);
