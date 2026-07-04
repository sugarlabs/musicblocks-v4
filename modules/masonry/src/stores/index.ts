import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Bounds } from '@/@types/common.types';

export interface BrickLayoutStore {
    /** Bounds per brick, keyed by brick (node model) id. */
    bounds: Record<string, Bounds>;
    /** Per-brick, whether ready for rendering, keyed by brick (node model) id. */
    ready: Record<string, boolean>;
    /**
     * Incremented to trigger a full re-layout of all towers.
     * Added so the layout engine can listen for dynamic block resizing.
     */
    layoutVersion: number;
    /**
     * Triggers a full re-layout across all active towers.
     * Call this whenever a block's intrinsic size changes.
     */
    markLayoutDirty: () => void;
}

/**
 * Tracks the on-canvas layout of every brick, keyed by id.
 *
 * `subscribeWithSelector` is used so consumers outside React (e.g. imperative layout code) can
 * subscribe to a single brick's bounds in isolation, not just whole-store changes.
 */
export const useBrickLayoutStore = create<BrickLayoutStore>()(
    subscribeWithSelector((set) => ({
        bounds: {},
        ready: {},
        layoutVersion: 0,
        markLayoutDirty: () => set((state) => ({ layoutVersion: state.layoutVersion + 1 })),
    })),
);
