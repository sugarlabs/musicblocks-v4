import { describe, it, expect } from 'vitest';

import { listNodes, traverseBottomUp } from './tower-traversal';
import {
    valueTree,
    expressionTree,
    statementTreeNoNesting,
    statementTreeWithNesting,
} from '@/mocks/tower';
import type { TowerNode } from '@/@types/tower.types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Drain the generator into a flat array of batches. */
function collectBatches(root: TowerNode): TowerNode[][] {
    const batches: TowerNode[][] = [];
    for (const batch of traverseBottomUp(root)) {
        batches.push(batch);
    }
    return batches;
}

/** Flat list of all nodes in yield order. */
function collectNodes(root: TowerNode): TowerNode[] {
    return collectBatches(root).flat();
}

/**
 * Returns true when, for every node in `nodes`, all of that node's direct arg-children
 * appear at an earlier index in `nodes` than the node itself.
 */
function argsAlwaysBeforeParent(root: TowerNode, nodes: TowerNode[]): boolean {
    const pos = new Map<TowerNode, number>(nodes.map((node, i) => [node, i]));
    const visited = new Set<TowerNode>();
    const stack: TowerNode[] = [root];

    while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);

        if (node.kind === 'expression' || node.kind === 'statement') {
            const parentPos = pos.get(node);
            for (const arg of node.args) {
                if (arg === null) continue;
                const argPos = pos.get(arg);
                if (argPos === undefined || parentPos === undefined) return false;
                if (argPos >= parentPos) return false;
                stack.push(arg);
            }
        }

        if (node.kind === 'statement') {
            if (node.nestedNext) stack.push(node.nestedNext);
            if (node.next) stack.push(node.next);
        }
    }

    return true;
}

/**
 * Returns true when, for every statement in `nodes`, its `nestedNext` cavity chain
 * appears at an earlier index in `nodes` than the statement itself.
 */
function nestedAlwaysBeforeParent(root: TowerNode, nodes: TowerNode[]): boolean {
    const pos = new Map<TowerNode, number>(nodes.map((node, i) => [node, i]));
    const visited = new Set<TowerNode>();
    const stack: TowerNode[] = [root];

    while (stack.length > 0) {
        const node = stack.pop()!;
        if (visited.has(node)) continue;
        visited.add(node);

        if (node.kind === 'statement') {
            const parentPos = pos.get(node);
            if (node.nestedNext) {
                const childPos = pos.get(node.nestedNext);
                if (childPos === undefined || parentPos === undefined) return false;
                if (childPos >= parentPos) return false;
                stack.push(node.nestedNext);
            }
            if (node.next) stack.push(node.next);

            for (const arg of node.args) {
                if (arg) stack.push(arg);
            }
        } else if (node.kind === 'expression') {
            for (const arg of node.args) {
                if (arg) stack.push(arg);
            }
        }
    }

    return true;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('tower-traversal', () => {
    describe('listNodes', () => {
        it('collects all nodes in a flat list', () => {
            const nodes = listNodes(expressionTree);
            expect(nodes.length).toBeGreaterThan(0);

            const ids = nodes.map((n) => n.model.id);
            expect(ids).toContain('Add 1');
            expect(ids).toContain('Add 1.Add 2');
        });
    });

    describe('traverseBottomUp', () => {
        // ── 1. Single value node ─────────────────────────────────────────────
        it('yields exactly one batch containing the value node when given a single value root', () => {
            const batches = collectBatches(valueTree);

            expect(batches).toHaveLength(1);
            expect(batches[0]).toHaveLength(1);
            expect(batches[0][0].model.id).toBe(valueTree.model.id);
        });

        // ── 2. Expression tree — leaf-first ordering ─────────────────────────
        it('yields leaf value nodes before their parent expression nodes', () => {
            const nodes = collectNodes(expressionTree);
            const ids = nodes.map((n) => n.model.id);

            // The root expression (Add 1) must be last.
            expect(ids[ids.length - 1]).toBe('Add 1');

            // Every arg child must appear before its parent.
            expect(argsAlwaysBeforeParent(expressionTree, nodes)).toBe(true);
        });

        it('covers every node in the expression tree exactly once', () => {
            const nodes = collectNodes(expressionTree);
            const unique = new Set(nodes.map((n) => n.model.id));

            expect(unique.size).toBe(nodes.length);
            expect(unique.has('Add 1')).toBe(true);
            expect(unique.has('Add 1.Add 2')).toBe(true);
        });

        // ── 3. Statement with no args ────────────────────────────────────────
        it('yields a single batch with just the statement when it has no args', () => {
            const singleStatement = { ...statementTreeNoNesting, next: null };
            const generator = traverseBottomUp(singleStatement);
            const firstBatch = generator.next().value;

            expect(firstBatch).toBeDefined();
            expect(firstBatch).toHaveLength(1);
            expect(firstBatch![0].model.id).toBe('Statement 1');
        });

        // ── 4. Statement chain (no nesting) — order constraint ──────────────
        it('ensures all arg subtree nodes appear before each statement node', () => {
            const nodes = collectNodes(statementTreeNoNesting);
            expect(argsAlwaysBeforeParent(statementTreeNoNesting, nodes)).toBe(true);
        });

        it('covers every node in the no-nesting statement tree exactly once', () => {
            const nodes = collectNodes(statementTreeNoNesting);
            const unique = new Set(nodes.map((n) => n.model.id));

            expect(unique.size).toBe(nodes.length);
            expect(unique.has('Statement 1')).toBe(true);
            expect(unique.has('Statement 2')).toBe(true);
        });

        // ── 5. Statement chain (with nesting) — full traversal constraint ────
        it('includes nestedNext cavity nodes and yields them before their parent statements', () => {
            const nodes = collectNodes(statementTreeWithNesting);
            const unique = new Set(nodes.map((n) => n.model.id));

            // Must contain outer statements
            expect(unique.has('Nesting Statement 1')).toBe(true);
            expect(unique.has('Nesting Statement 3')).toBe(true);

            // Must contain nested statements inside cavities
            expect(unique.has('Nesting Statement 1.Nesting Statement 2')).toBe(true);
            expect(unique.has('Nesting Statement 1.Statement 6')).toBe(true);
            expect(unique.has('Nesting Statement 3.Statement 8')).toBe(true);

            // Nested statement chains must appear BEFORE the parent statement containing the cavity
            expect(nestedAlwaysBeforeParent(statementTreeWithNesting, nodes)).toBe(true);
        });

        // ── 6. Batch non-emptiness ───────────────────────────────────────────
        it('never yields an empty batch', () => {
            for (const tree of [
                valueTree,
                expressionTree,
                statementTreeNoNesting,
                statementTreeWithNesting,
            ]) {
                for (const batch of traverseBottomUp(tree)) {
                    expect(batch.length).toBeGreaterThan(0);
                }
            }
        });
    });
});
