import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Point } from '@/@types/common.types';

export type CandidateConnectionType = 'statement' | 'argument';

/**
 * Stores data about the footprint left behind when a brick is disconnected from a tower.
 * This is used to render the grey shadow footprint (DisconnectShadowView).
 */
export interface DisconnectShadowMeta {
    hostTowerId: string;
    hostBrickId: string;
    socket: 'next' | 'nestedNext' | 'output' | number;
}

/**
 * Holds metadata about the closest valid or invalid snap point when a user drags a brick.
 * It tracks which brick they are dragging, what they are hovering over, and where the snap point is.
 */
export interface ActiveTargetMeta {
    draggedTowerId: string;
    targetTowerId: string;
    targetBrickId: string;
    type: CandidateConnectionType;
    distance: number;
    // The centroid of the target socket/slot in canvas coordinates
    centroid: Point;
}

/**
 * Zustand store responsible for global Drag & Drop preview feedback.
 * This decoupled store allows the workspace to render dynamic hover previews, shadows,
 * and snap hints without causing expensive React re-renders on the main drag loop.
 */
export interface ConnectionPreviewState {
    // The closest candidate connection the user is currently hovering near
    activeTarget: ActiveTargetMeta | null;
    // True if the connection is geometrically and logically allowed
    isValid: boolean;
    // The absolute X/Y workspace coordinates where the ghost preview should render
    snapPosition: Point | null;
    // The footprint shadow data for a brick that was just disconnected
    disconnectShadow: DisconnectShadowMeta | null;
}

interface ConnectionPreviewStore extends ConnectionPreviewState {
    setPreviewTarget: (
        target: ActiveTargetMeta | null,
        isValid: boolean,
        snapPosition: Point | null,
    ) => void;
    clearPreviewTarget: () => void;
    setDisconnectShadow: (shadow: DisconnectShadowMeta) => void;
    clearDisconnectShadow: () => void;
}

export const useConnectionPreviewStore = create<ConnectionPreviewStore>()(
    subscribeWithSelector((set, get) => ({
        activeTarget: null,
        isValid: false,
        snapPosition: null,
        disconnectShadow: null,

        // High-frequency update called on every drag frame.
        // It strictly checks for deep equality before calling `set()` to prevent unnecessary React renders.
        setPreviewTarget: (target, isValid, snapPosition) => {
            if (
                get().activeTarget?.targetTowerId === target?.targetTowerId &&
                get().activeTarget?.targetBrickId === target?.targetBrickId &&
                get().isValid === isValid &&
                get().snapPosition?.x === snapPosition?.x &&
                get().snapPosition?.y === snapPosition?.y
            ) {
                return;
            }
            set({ activeTarget: target, isValid, snapPosition });
        },

        clearPreviewTarget: () => {
            if (get().activeTarget !== null) {
                set({ activeTarget: null, isValid: false, snapPosition: null });
            }
        },

        setDisconnectShadow: (shadow) => {
            set({ disconnectShadow: shadow });
        },

        clearDisconnectShadow: () => {
            if (get().disconnectShadow !== null) {
                set({ disconnectShadow: null });
            }
        },
    })),
);
