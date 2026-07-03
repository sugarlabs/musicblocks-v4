import { useLayoutEffect, useRef, useState } from 'react';

import { TowerNode } from '@/@types/tower.types';
import { useBrickLayoutStore } from '@/stores';
import { listNodes, traverseBottomUp } from '@/utils/tower-traversal';

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
    const generatorRef = useRef<Generator<TowerNode[]> | null>(null);
    const isDoneRef = useRef(false);

    // Incrementing this forces a re-render so the layout effect fires again for the next batch.
    const [tick, setTick] = useState(0);

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

        // Create the generator once so each call to next() resumes from where it left off.
        generatorRef.current = traverseBottomUp(root);
        isInitialized.current = true;
    }

    useLayoutEffect(() => {
        if (isDoneRef.current || generatorRef.current === null) return;

        const { value: batch, done } = generatorRef.current.next();

        if (done || !batch || batch.length === 0) {
            isDoneRef.current = true;
            return;
        }

        // Propagate dimensions from already-rendered children into this batch's models
        batch.forEach((node) => {
            if (node.kind === 'expression' || node.kind === 'statement') {
                node.model.argDims = node.args.map((arg) =>
                    arg ? { w: arg.model.dims.w, h: arg.model.dims.h } : null,
                );
            }
            if (node.kind === 'statement' && node.nestedNext) {
                // Sum heights and find max width of the inner statement chain
                let current: TowerNode | null = node.nestedNext;
                let totalH = 0;
                let maxW = 0;
                while (current !== null) {
                    totalH += current.model.dims.h;
                    if (current.model.dims.w > maxW) maxW = current.model.dims.w;
                    current = current.kind === 'statement' ? current.next : null;
                }
                node.model.nestingDims = { w: maxW, h: totalH };
            }
        });

        // Mark this batch's bricks ready so BrickWrappers render (and measure) them.
        useBrickLayoutStore.setState((state) => ({
            ready: {
                ...state.ready,
                ...Object.fromEntries(batch.map((node) => [node.model.id, true])),
            },
        }));

        // After the BrickWrappers have rendered and updated model.dims, propagate those
        // dimensions into the layout store's bounds.
        useBrickLayoutStore.setState((state) => ({
            bounds: {
                ...state.bounds,
                ...Object.fromEntries(
                    batch.map((node) => {
                        const existing = state.bounds[node.model.id] ?? { x: 0, y: 0, w: 0, h: 0 };
                        return [
                            node.model.id,
                            {
                                ...existing,
                                w: node.model.dims.w,
                                h: node.model.dims.h,
                            },
                        ];
                    }),
                ),
            },
        }));

        // Schedule the next batch by triggering a re-render.
        setTick((t) => t + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick]);

    return nodes;
}
