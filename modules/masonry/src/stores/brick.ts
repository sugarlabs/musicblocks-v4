import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';

export interface BrickLayoutStore {
    /** Position per brick, keyed by brick (node model) id. */
    coords: Record<string, Point>;
    /** Per-brick, whether mounted for measurement, keyed by brick (node model) id. */
    mounted: Record<string, boolean>;
    /** Per-brick, whether positioned, keyed by brick (node model) id. */
    positioned: Record<string, boolean>;

    /** Sets a single brick's coordinates. */
    setCoords(id: string, point: Point): void;
    /** Merges a batch of per-brick coordinates into `coords`. */
    setCoords(batch: Record<string, Point>): void;
    /** Merges a batch of per-brick flags into `mounted`. */
    setMounted: (batch: Record<string, boolean>) => void;
    /** Merges a batch of per-brick flags into `positioned`. */
    setPositioned: (batch: Record<string, boolean>) => void;
    /** Drops the `coords`, `mounted` and `positioned` entries of the given bricks. */
    clearBricks: (ids: string[]) => void;
}

/**
 * Tracks the on-canvas layout of every brick, keyed by id.
 *
 * `subscribeWithSelector` is used so consumers outside React (e.g. imperative layout code) can
 * subscribe to a single brick's coords in isolation, not just whole-store changes.
 *
 * Entries are added per brick by the layout and only leave through `clearBricks`, which callers must
 * run *after* the bricks are gone from the workspace graph: `TowerBrick` reads `coords[id]` without
 * a guard, so clearing a brick that is still rendered would fault on its next render.
 */
export const useBrickLayoutStore = create<BrickLayoutStore>()(
    subscribeWithSelector((set) => ({
        coords: {},
        mounted: {},
        positioned: {},

        setCoords: ((idOrBatch: string | Record<string, Point>, point?: Point) => {
            const batch = typeof idOrBatch === 'string' ? { [idOrBatch]: point! } : idOrBatch;
            set((state) => ({
                coords: {
                    ...state.coords,
                    ...batch,
                },
            }));
        }) as BrickLayoutStore['setCoords'],

        setMounted: (batch) => {
            set((state) => ({
                mounted: {
                    ...state.mounted,
                    ...batch,
                },
            }));
        },

        setPositioned: (batch) => {
            set((state) => ({
                positioned: {
                    ...state.positioned,
                    ...batch,
                },
            }));
        },

        clearBricks: (ids) => {
            set((state) => {
                // Ids the store never held (or already dropped) must not produce a new state
                // object: `Workspace` treats a `positioned` change as the signal that a layout
                // settled and re-syncs every tower's connectors from it.
                const tracked = ids.filter(
                    (id) => id in state.coords || id in state.mounted || id in state.positioned,
                );

                if (tracked.length === 0) return state;

                const coords = { ...state.coords };
                const mounted = { ...state.mounted };
                const positioned = { ...state.positioned };

                for (const id of tracked) {
                    delete coords[id];
                    delete mounted[id];
                    delete positioned[id];
                }

                return { coords, mounted, positioned };
            });
        },
    })),
);
