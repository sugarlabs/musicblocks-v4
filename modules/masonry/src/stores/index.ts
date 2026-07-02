import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Bounds } from '@/@types/common.types';

export interface BrickLayoutStore {
    /** Bounds per brick, keyed by brick (node model) id. */
    bounds: Record<string, Bounds>;
    /** Per-brick, whether ready for rendering, keyed by brick (node model) id. */
    ready: Record<string, boolean>;
}

/**
 * Tracks the on-canvas layout of every brick, keyed by id.
 *
 * `subscribeWithSelector` is used so consumers outside React (e.g. imperative layout code) can
 * subscribe to a single brick's bounds in isolation, not just whole-store changes.
 */
export const useBrickLayoutStore = create<BrickLayoutStore>()(
    subscribeWithSelector(() => ({
        bounds: {},
        ready: {},
    })),
);
