import { useEffect } from 'react';

import { useWorkspaceScaleStore } from '@/stores/scale';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes } from '@/utils/tower-traversal';

/**
 * Applies the workspace's scale level to every brick on the canvas.
 *
 * Writing `scaleLevel` re-renders the views on its own, but `useTowerLayout` only re-runs on a root
 * change, so the bricks would keep their old positions — the write and the re-layout have to land
 * together. The models are mutated outside the store update because `scaleLevel` notifies
 * synchronously, and doing that inside a `set` would update React from within a store update.
 */
export function useWorkspaceScale() {
    useEffect(() => {
        return useWorkspaceScaleStore.subscribe(
            (state) => state.level,
            (level) => {
                const { towers, refreshTowerLayouts } = useWorkspaceStore.getState();

                for (const tower of Object.values(towers)) {
                    for (const node of listNodes(tower.root)) {
                        node.model.scaleLevel = level;
                    }
                }

                refreshTowerLayouts();
            },
        );
    }, []);
}
