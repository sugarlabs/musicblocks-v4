import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
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
    /**
     * Completes a snap-join whose node splicing was already done by `joinTowers`: drops the absorbed
     * dragged tower and bumps the target's `layoutVersion` to force a re-layout of the merged graph.
     *
     * It also re-roots the survivor at the merged graph's topmost node. This matters for S3
     * attach-above onto the target's root: `joinTowers` prepends the dragged chain via `prev`
     * back-pointers, so the dragged root becomes the new head. Layout traversal only follows FORWARD
     * pointers, so keeping the old root would leave the prepended bricks unreachable.
     */
    absorbTower: (draggedId: string, targetId: string) => void;
}

/**
 * Walks `prev` back-pointers up to the head of the merged graph. Only statement nodes carry a
 * `prev`, so the walk stops at a null `prev` (a free head) or a non-statement node.
 */
function findTopmost(node: TowerNode): TowerNode {
    let head = node;
    while (head.kind === 'statement' && head.prev !== null) {
        head = head.prev;
    }
    return head;
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

        absorbTower: (draggedId, targetId) => {
            set((state) => {
                const target = state.towers[targetId];
                if (!target) return state;

                const towers = { ...state.towers };
                delete towers[draggedId];
                towers[targetId] = {
                    ...target,
                    root: findTopmost(target.root),
                    layoutVersion: (target.layoutVersion ?? 0) + 1,
                };
                return { towers };
            });
        },
    })),
);
