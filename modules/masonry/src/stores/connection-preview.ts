import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Point } from '@/@types/common.types';

export type CandidateConnectionType = 'statement' | 'argument';

export interface DisconnectShadowMeta {
    hostTowerId: string;
    hostBrickId: string;
    socket: 'next' | 'nestedNext' | 'output' | number;
}

export interface ActiveTargetMeta {
    draggedTowerId: string;
    targetTowerId: string;
    targetBrickId: string;
    type: CandidateConnectionType;
    distance: number;
    // The centroid of the target socket/slot in canvas coordinates
    centroid: Point;
}

export interface ConnectionPreviewState {
    activeTarget: ActiveTargetMeta | null;
    isValid: boolean;
    snapPosition: Point | null;
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
