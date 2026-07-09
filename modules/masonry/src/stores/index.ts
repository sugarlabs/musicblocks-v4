import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Bounds, Point } from '@/@types/common.types';
import type { TowerState } from '@/@types/workspace.types';

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

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;
    /** Adds a new tower to the workspace */
    addTower: (tower: TowerState) => void;
    /** Removes a tower from the workspace by its ID */
    removeTower: (id: string) => void;
    /** Updates the position of an existing tower */
    updateTowerPosition: (id: string, position: Point) => void;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set) => ({
        towers: {},
        addTower: (tower) =>
            set((state) => ({
                towers: { ...state.towers, [tower.id]: tower },
            })),
        removeTower: (id) =>
            set((state) => {
                const newTowers = { ...state.towers };
                delete newTowers[id];
                return { towers: newTowers };
            }),
        updateTowerPosition: (id, position) =>
            set((state) => {
                if (!state.towers[id]) return state;
                return {
                    towers: {
                        ...state.towers,
                        [id]: { ...state.towers[id], position },
                    },
                };
            }),
    })),
);
