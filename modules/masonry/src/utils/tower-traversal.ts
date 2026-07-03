import { TowerNode, TowerStatementNode } from '@/@types/tower.types';

/**
 * Pushes `start` onto `stack`, along with the rest of its statement chain if it has one.
 *
 * Statement nodes form a linear sequence via `next` pointers, so a single call here queues the
 * whole run of statements for traversal rather than just the first one.
 */
function pushChain(start: TowerNode, stack: TowerNode[]) {
    if (start.kind !== 'statement') {
        stack.push(start);
        return;
    }

    let current: TowerStatementNode | null = start;

    while (current) {
        stack.push(current);
        current = current.next as TowerStatementNode | null;
    }
}

/**
 * Collects every node reachable from `root` in a tower's connected graph.
 *
 * Walks the tree with an explicit stack, following `args` and `nestedNext` connections and
 * pulling in each statement's full `next` chain via `pushChain`. The result is unordered — it's
 * meant to be reduced per node (e.g. into layout state), not walked in tree order.
 */
export function listNodes(root: TowerNode): TowerNode[] {
    const nodes: TowerNode[] = [];
    const stack: TowerNode[] = [];

    pushChain(root, stack);

    while (stack.length > 0) {
        const node = stack.pop()!;
        nodes.push(node);

        switch (node.kind) {
            case 'expression':
                for (const arg of node.args) {
                    if (arg) pushChain(arg, stack);
                }
                break;
            case 'statement':
                for (const arg of node.args) {
                    if (arg) pushChain(arg, stack);
                }

                if (node.nestedNext) {
                    pushChain(node.nestedNext, stack);
                }
                break;
        }
    }

    return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Assigns a depth value to every node in an argument sub-tree using an iterative DFS.
 *
 * `depth` here means "distance from the subtree root". Leaf nodes end up with the highest
 * depth numbers so that, when we sort descending, they appear first (bottom-up order).
 *
 * @param argRoot   The root of a single argument sub-tree (value or expression).
 * @param depthMap  Accumulator: maps node → depth (updated in place).
 */
function collectArgDepths(argRoot: TowerNode, depthMap: Map<TowerNode, number>): void {
    // Stack entries carry the node and the depth at which it sits.
    const stack: { node: TowerNode; depth: number }[] = [{ node: argRoot, depth: 0 }];

    while (stack.length > 0) {
        const { node, depth } = stack.pop()!;

        // Only deepen if we haven't visited this node yet, or if a deeper path is found.
        const existing = depthMap.get(node);
        if (existing === undefined || depth > existing) {
            depthMap.set(node, depth);
        }

        // Push argument children (value/expression only — no statement chains here).
        if (node.kind === 'expression') {
            for (const arg of node.args) {
                if (arg !== null) {
                    stack.push({ node: arg, depth: depth + 1 });
                }
            }
        }
        // value nodes are leaves — nothing to push.
    }
}

/**
 * Traverses all Argument sub-trees of a Brick Tower tree, **bottom-up**, yielding one batch of
 * `TowerNode`s per iteration.
 *
 * @param root - The root node of the tower tree.
 */
export function* traverseBottomUp(root: TowerNode): Generator<TowerNode[]> {
    // Collect the top-level statement chain (or a single non-statement root).
    const statementChain: TowerNode[] = [];

    if (root.kind === 'statement') {
        let current: TowerStatementNode | null = root;
        while (current !== null) {
            statementChain.push(current);
            current = current.next as TowerStatementNode | null;
        }
    } else {
        // Expression or value at the root — treat as one argument sub-tree.
        statementChain.push(root);
    }

    for (const stmtNode of statementChain) {
        // Determine which nodes have argument children (expressions/statements with args).
        const argsToProcess: TowerNode[] =
            stmtNode.kind === 'statement' || stmtNode.kind === 'expression'
                ? stmtNode.args.filter((a): a is TowerNode => a !== null)
                : [];

        if (argsToProcess.length > 0) {
            // Build a depth map for every node in every arg sub-tree of this statement.
            const depthMap = new Map<TowerNode, number>();
            for (const argRoot of argsToProcess) {
                collectArgDepths(argRoot, depthMap);
            }

            // Group nodes by depth (ascending = shallow, highest number = deepest leaf).
            const byDepth = new Map<number, TowerNode[]>();
            for (const [node, depth] of depthMap.entries()) {
                const bucket = byDepth.get(depth);
                if (bucket) {
                    bucket.push(node);
                } else {
                    byDepth.set(depth, [node]);
                }
            }

            // Yield batches deepest-first (leaves before parents).
            const depths = [...byDepth.keys()].sort((a, b) => b - a);
            for (const depth of depths) {
                yield byDepth.get(depth)!;
            }
        }

        // Yield the statement/root node itself after all its arg children have been yielded.
        yield [stmtNode];
    }
}
