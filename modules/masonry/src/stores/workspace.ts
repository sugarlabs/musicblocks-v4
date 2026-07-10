import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';
import type { TowerState } from '@/@types/workspace.types';

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;

    /** Creates a new tower in the workspace. */
    createTower: (tower: TowerState) => void;
    /** Removes a tower from the workspace by its ID. */
    removeTower: (id: string) => void;
    /** Updates the position of an existing tower. */
    updateTowerPosition: (id: string, position: Point) => void;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set) => ({
        towers: {},

        createTower: (tower) => {
            set((state) => ({
                towers: { ...state.towers, [tower.id]: tower },
            }));
        },

        removeTower: (id) => {
            set((state) => {
                const newTowers = { ...state.towers };
                delete newTowers[id];
                return {
                    towers: newTowers,
                };
            });
        },

        updateTowerPosition: (id, position) => {
            set((state) => {
                if (!state.towers[id]) return state;
                return {
                    towers: {
                        ...state.towers,
                        [id]: { ...state.towers[id], position },
                    },
                };
            });
        },
    })),
);
