import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { PaletteBrickConfig } from '@/@types/palette.types';

export interface PaletteDragStore {
    /** The palette entry currently being dragged, or null when no palette drag is active. */
    dragged: PaletteBrickConfig | null;
    /** Timestamp (ms) when the last active drag gesture ended; used to suppress trailing click events. */
    lastDragEndTime: number;

    /** Marks a palette drag as active, carrying the dragged entry's config as its payload. */
    startDrag: (config: PaletteBrickConfig) => void;
    /** Clears the active palette drag, recording whether pointer movement occurred. */
    endDrag: (wasMoved?: boolean) => void;
}

/**
 * Tracks the palette drag in progress — only the dragged entry's config, which mounts/unmounts
 * the drag ghost's brick preview. Per-frame positions deliberately bypass the store; the drag
 * hook writes them straight to the ghost's DOM node so pointer moves never re-render React.
 */
export const usePaletteDragStore = create<PaletteDragStore>()(
    subscribeWithSelector((set) => ({
        dragged: null,
        lastDragEndTime: 0,

        startDrag: (config) => {
            set({
                dragged: config,
            });
        },

        endDrag: (wasMoved = false) => {
            set({
                dragged: null,
                lastDragEndTime: wasMoved ? Date.now() : 0,
            });
        },
    })),
);
