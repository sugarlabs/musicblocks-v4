import { useRef } from 'react';

import { TowerNode } from '@/@types/tower.types';
import { useBrickLayoutStore } from '@/stores';
import { listNodes } from '@/utils/tower-traversal';

/**
 * Resolves the layout of a tower rooted at `root`.
 *
 * Lists every node in the tree and ensures each has an entry in the brick layout store,
 * initializing it once per node so consumers can read and update its sizing and position state.
 *
 * Returns the tower's node list.
 */
export function useTowerLayout(root: TowerNode) {
    const isInitialized = useRef(false);

    const nodes = listNodes(root);

    if (!isInitialized.current) {
        useBrickLayoutStore.setState((state) => ({
            bounds: {
                ...state.bounds,
                ...Object.fromEntries(
                    nodes.map((node) => [
                        node.model.id,
                        {
                            w: 0,
                            h: 0,
                            x: 0,
                            y: 0,
                            isReady: false,
                        },
                    ]),
                ),
            },
        }));

        isInitialized.current = true;
    }

    return nodes;
}
