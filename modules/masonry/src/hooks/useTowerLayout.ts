import { useEffect, useRef } from 'react';

import { TowerNode } from '@/@types/tower.types';
import { useBrickLayoutStore } from '@/stores';
import { listNodes, traverseBottomUp, traverseTopDown } from '@/utils/tower-traversal';

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

    useEffect(() => {
        let isCancelled = false;

        async function processLayout() {
            const bottomUpGen = traverseBottomUp(root);

            for (const batch of bottomUpGen) {
                if (isCancelled) return;

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

                // Mark this batch's bricks ready so BrickWrappers render (and measure their widgetDims)
                useBrickLayoutStore.setState((state) => ({
                    ready: {
                        ...state.ready,
                        ...Object.fromEntries(batch.map((node) => [node.model.id, true])),
                    },
                }));

                // Yield to the browser. React will flush updates, render the BrickWrappers,
                // and useLayoutEffect in BrickFixed will measure the DOM and set model.widgetDims.
                await new Promise((resolve) => setTimeout(resolve, 0));

                if (isCancelled) return;

                // Now compute the full brick dimensions based on the freshly measured widgetDims,
                // and propagate those full dimensions into the layout store's bounds.
                useBrickLayoutStore.setState((state) => ({
                    bounds: {
                        ...state.bounds,
                        ...Object.fromEntries(
                            batch.map((node) => {
                                node.model.computeDims(); // compute full size based on widgetDims + argDims + nestingDims
                                const existing = state.bounds[node.model.id] ?? {
                                    x: 0,
                                    y: 0,
                                    w: 0,
                                    h: 0,
                                };
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
            }

            // All dims are measured by now, so compute every brick's position in one
            // synchronous top-down pass and propagate to the store in a single update.

            // computeDims() only computes outer dims; bricks with a nesting cavity or argument
            // slots also need their outline bounds for the child offsets.
            nodes.forEach((node) => {
                if (node.kind === 'value') return;
                if (
                    node.args.some((arg) => arg !== null) ||
                    (node.kind === 'statement' && node.nestedNext)
                ) {
                    node.model.computeOutline();
                }
            });

            const positioned = traverseTopDown(root);

            if (positioned.length > 0) {
                useBrickLayoutStore.setState((state) => ({
                    bounds: {
                        ...state.bounds,
                        ...Object.fromEntries(
                            positioned.map((node) => {
                                const existing = state.bounds[node.model.id] ?? {
                                    x: 0,
                                    y: 0,
                                    w: 0,
                                    h: 0,
                                };
                                return [
                                    node.model.id,
                                    {
                                        ...existing,
                                        x: node.model.position.x,
                                        y: node.model.position.y,
                                    },
                                ];
                            }),
                        ),
                    },
                }));
            }
        }

        // We run the async process once per root/layoutVersion change
        processLayout();

        return () => {
            isCancelled = true;
        };
    }, [root]);

    return nodes;
}
