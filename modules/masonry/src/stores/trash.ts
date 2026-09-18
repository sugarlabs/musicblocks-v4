import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Bounds } from '@/@types/common.types';

export interface TrashStore {
    bounds: Bounds | null;
    isHovered: boolean;
    isAcknowledging: boolean;
    setBounds: (bounds: Bounds | null) => void;
    setHovered: (isHovered: boolean) => void;
    acknowledgeTrash: () => void;
}

let ackTimeout: ReturnType<typeof setTimeout> | null = null;
export const ACKNOWLEDGE_TRASH_DURATION_MS = 410;
export const useTrashStore = create<TrashStore>()(
    subscribeWithSelector((set, get) => ({
        bounds: null,
        isHovered: false,
        isAcknowledging: false,

        setBounds: (bounds) => {
            set({ bounds });
        },

        setHovered: (isHovered) => {
            if (get().isHovered === isHovered) return;

            set({ isHovered });
        },

        acknowledgeTrash: () => {
            acknowledgeTrash();
        },
    })),
);

/**
 * Pulses the Trash icon with its active highlight for a short duration to acknowledge a deletion
 * triggered away from the Trash drop zone (e.g. via the action menu or keyboard shortcut).
 */
export function acknowledgeTrash(): void {
    if (ackTimeout !== null) {
        clearTimeout(ackTimeout);
    }

    useTrashStore.setState({ isAcknowledging: true });

    ackTimeout = setTimeout(() => {
        useTrashStore.setState({ isAcknowledging: false });
        ackTimeout = null;
    }, ACKNOWLEDGE_TRASH_DURATION_MS);
}
