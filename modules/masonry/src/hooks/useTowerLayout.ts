import { useLayoutEffect, useRef, useState } from 'react';

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
    const generatorRef = useRef<Generator<TowerNode[]> | null>(null);
    const isDoneRef = useRef(false);

    const generatorTDRef = useRef<Generator<TowerNode[]> | null>(null);
    const isDoneTDRef = useRef(false);
    const parentMapRef = useRef<Map<TowerNode, TowerNode> | null>(null);

    // Incrementing this forces a re-render so the layout effect fires again for the next batch.
    const [tick, setTick] = useState(0);

    const nodes = listNodes(root);

    const layoutVersion = useBrickLayoutStore((state) => state.layoutVersion);

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

        // Build parent lookup map for top-down positioning
        const pMap = new Map<TowerNode, TowerNode>();
        nodes.forEach((node) => {
            if (node.kind === 'statement') {
                if (node.next) pMap.set(node.next, node);
                if (node.nestedNext) pMap.set(node.nestedNext, node);
                node.args.forEach((arg) => {
                    if (arg) pMap.set(arg, node);
                });
            } else if (node.kind === 'expression') {
                node.args.forEach((arg) => {
                    if (arg) pMap.set(arg, node);
                });
            }
        });
        parentMapRef.current = pMap;

        isInitialized.current = true;
    }

    // When layoutVersion changes externally (e.g. child resizing), restart layout engine
    // without resetting isReady=false so children don't unmount!
    useLayoutEffect(() => {
        isDoneRef.current = false;
        isDoneTDRef.current = false;
        generatorRef.current = traverseBottomUp(root);
        generatorTDRef.current = null;
        setTick((t) => t + 1);
    }, [layoutVersion, root]);

    useLayoutEffect(() => {
        if (isDoneRef.current || generatorRef.current === null) {
            if (isDoneTDRef.current) return;

            if (generatorTDRef.current === null) {
                generatorTDRef.current = traverseTopDown(root);
            }

            const { value: batch, done } = generatorTDRef.current!.next();

            if (done || !batch || batch.length === 0) {
                isDoneTDRef.current = true;
                return;
            }

            const parentMap = parentMapRef.current!;
            const layoutState = useBrickLayoutStore.getState();

            // Accumulate bounds sequentially so nodes in the same batch can read newly computed bounds
            // of their predecessors (e.g. statement chain positioning).
            const nextBounds = { ...layoutState.bounds };

            // We must process parents before children to correctly position them top-down.
            // Since traverseTopDown yields statements in bottom-up order within the same nesting depth batch,
            // we reverse the batch before processing so that parents are processed first.
            const processingBatch = [...batch].reverse();

            processingBatch.forEach((node) => {
                const parent = parentMap.get(node);
                let x = 0;
                let y = 0;

                if (parent) {
                    const pBounds = nextBounds[parent.model.id];
                    if (parent.kind === 'statement' && parent.next === node) {
                        x = pBounds.x;
                        y = pBounds.y + parent.model.dims.h;
                    } else if (parent.kind === 'statement' && parent.nestedNext === node) {
                        const nestBounds = parent.model.bounds.nesting;
                        x = pBounds.x + (nestBounds?.x ?? 0);
                        y = pBounds.y + (nestBounds?.y ?? 0);
                    } else if (parent.kind === 'expression' || parent.kind === 'statement') {
                        const argIndex = parent.args.indexOf(node);
                        if (argIndex !== -1) {
                            const argBounds = parent.model.bounds.args?.[argIndex];
                            x = pBounds.x + (argBounds?.x ?? 0);
                            y = pBounds.y + (argBounds?.y ?? 0);
                        }
                    }
                }

                const existing = nextBounds[node.model.id] ?? { w: 0, h: 0 };
                nextBounds[node.model.id] = {
                    ...existing,
                    x,
                    y,
                };
            });

            useBrickLayoutStore.setState(() => ({
                bounds: nextBounds,
            }));

            // Schedule the next batch by triggering a re-render.
            setTick((t) => t + 1);
            return;
        }

        const { value: batch, done } = generatorRef.current.next();

        if (done || !batch || batch.length === 0) {
            isDoneRef.current = true;
            setTick((t) => t + 1); // Trigger top-down phase
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
