import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Bounds } from '@/@types/common.types';

export interface TrashStore {
    /** The Trash's client-space rectangle, or null while it is not on the canvas. */
    bounds: Bounds | null;
    /** Whether a brick drag is currently over the Trash. */
    isHovered: boolean;

    /** Publishes the Trash's measured rectangle; null when it unmounts. */
    setBounds: (bounds: Bounds | null) => void;
    /** Flags the Trash as hovered by the in-flight drag. */
    setHovered: (isHovered: boolean) => void;
}

/**
 * Tracks the Trash drop target: where it sits on screen and whether a drag is over it.
 *
 * `interact.js` owns the pointer for the duration of a brick drag, so the Trash cannot learn it is
 * hovered from CSS or its own pointer events — the drag hook hit-tests the pointer against
 * `bounds` and writes `isHovered` here instead. Both writes are idempotent because `setHovered`
 * runs on every drag frame.
 */
export const useTrashStore = create<TrashStore>()(
    subscribeWithSelector((set, get) => ({
        bounds: null,
        isHovered: false,

        setBounds: (bounds) => {
            set({ bounds });
        },

        setHovered: (isHovered) => {
            if (get().isHovered === isHovered) return;

            set({ isHovered });
        },
    })),
);
