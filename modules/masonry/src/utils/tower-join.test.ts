import { describe, expect, it } from 'vitest';

import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { joinArg, joinTowers } from './tower-join';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

function makeStatement(
    id: string,
    options: {
        hasNesting?: boolean;
        hasConnectionPrev?: boolean;
        hasConnectionNext?: boolean;
    } = {},
): TowerStatementNode {
    return {
        kind: 'statement',
        model: new StatementBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params: [],
            hasConnectionPrev: options.hasConnectionPrev ?? true,
            hasConnectionNext: options.hasConnectionNext ?? true,
            hasNesting: options.hasNesting ?? false,
        }),
        prev: null,
        next: null,
        args: [],
        nestedNext: options.hasNesting ? null : undefined,
    };
}

/** Links a run of statement nodes head→tail via prev/next; returns the head. */
function chain(...nodes: TowerStatementNode[]): TowerStatementNode {
    nodes.forEach((node, i) => {
        node.prev = nodes[i - 1] ?? null;
        node.next = nodes[i + 1] ?? null;
    });
    return nodes[0];
}

describe('joinTowers', () => {
    describe('S1 — dragged root prev ← target next (stack below)', () => {
        it('links the dragged root beneath a free target', () => {
            const target = makeStatement('T', { hasConnectionNext: false });
            const draggedRoot = makeStatement('D', { hasConnectionPrev: false });

            joinTowers({ draggedRoot, target, draggedKind: 'prev', targetKind: 'next' });

            expect(target.next).toBe(draggedRoot);
            expect(draggedRoot.prev).toBe(target);
            expect(target.model.hasConnectionNext).toBe(true);
            expect(draggedRoot.model.hasConnectionPrev).toBe(true);
        });

        it('inserts mid-chain, reconnecting the displaced successor to the dragged tail', () => {
            const oldNext = makeStatement('oldNext');
            const target = chain(makeStatement('T'), oldNext);

            const draggedRoot = chain(makeStatement('D1'), makeStatement('D2'));
            const draggedTail = draggedRoot.next as TowerStatementNode;

            joinTowers({ draggedRoot, target, draggedKind: 'prev', targetKind: 'next' });

            // T → D1 → D2 → oldNext
            expect(target.next).toBe(draggedRoot);
            expect(draggedRoot.prev).toBe(target);
            expect(draggedTail.next).toBe(oldNext);
            expect(oldNext.prev).toBe(draggedTail);
            expect(draggedTail.model.hasConnectionNext).toBe(true);
            expect(oldNext.model.hasConnectionPrev).toBe(true);
        });
    });

    describe('S2 — dragged root prev ← target nestedNext (nest in clamp)', () => {
        it('links the dragged root as the clamp cavity head, prev pointing at the clamp', () => {
            const clamp = makeStatement('clamp', { hasNesting: true }); // empty cavity
            const draggedRoot = makeStatement('D', { hasConnectionPrev: false });

            joinTowers({
                draggedRoot,
                target: clamp,
                draggedKind: 'prev',
                targetKind: 'nestedNext',
            });

            expect(clamp.nestedNext).toBe(draggedRoot);
            expect(draggedRoot.prev).toBe(clamp);
            expect(draggedRoot.model.hasConnectionPrev).toBe(true);
        });

        it('inserts at the cavity head, splicing the displaced head onto the dragged tail', () => {
            const clamp = makeStatement('clamp', { hasNesting: true });
            const oldHead = makeStatement('oldHead');
            clamp.nestedNext = oldHead;
            oldHead.prev = clamp;

            const draggedRoot = chain(makeStatement('D1'), makeStatement('D2'));
            const draggedTail = draggedRoot.next as TowerStatementNode;

            joinTowers({
                draggedRoot,
                target: clamp,
                draggedKind: 'prev',
                targetKind: 'nestedNext',
            });

            // clamp ╠═▶ D1 → D2 → oldHead
            expect(clamp.nestedNext).toBe(draggedRoot);
            expect(draggedRoot.prev).toBe(clamp);
            expect(draggedTail.next).toBe(oldHead);
            expect(oldHead.prev).toBe(draggedTail);
            expect(draggedTail.model.hasConnectionNext).toBe(true);
            expect(oldHead.model.hasConnectionPrev).toBe(true);
        });
    });

    describe('S3 — dragged tail next → target prev (attach above)', () => {
        it('links the dragged tail above a free target', () => {
            const target = makeStatement('T', { hasConnectionPrev: false });
            const draggedRoot = chain(makeStatement('D1'), makeStatement('D2'));
            const draggedTail = draggedRoot.next as TowerStatementNode;

            joinTowers({ draggedRoot, target, draggedKind: 'next', targetKind: 'prev' });

            // D1 → D2 → T
            expect(draggedTail.next).toBe(target);
            expect(target.prev).toBe(draggedTail);
            expect(draggedTail.model.hasConnectionNext).toBe(true);
            expect(target.model.hasConnectionPrev).toBe(true);
            // The dragged root stays the head of the merged chain.
            expect(draggedRoot.prev).toBeNull();
        });

        it('inserts above, threading the displaced predecessor before the dragged root', () => {
            const oldPrev = makeStatement('oldPrev');
            const target = chain(oldPrev, makeStatement('T')).next as TowerStatementNode;

            const draggedRoot = chain(makeStatement('D1'), makeStatement('D2'));
            const draggedTail = draggedRoot.next as TowerStatementNode;

            joinTowers({ draggedRoot, target, draggedKind: 'next', targetKind: 'prev' });

            // oldPrev → D1 → D2 → T
            expect(oldPrev.next).toBe(draggedRoot);
            expect(draggedRoot.prev).toBe(oldPrev);
            expect(draggedTail.next).toBe(target);
            expect(target.prev).toBe(draggedTail);
            expect(oldPrev.model.hasConnectionNext).toBe(true);
            expect(draggedRoot.model.hasConnectionPrev).toBe(true);
        });
    });

    it('throws on an unsupported mating (should be rejected upstream)', () => {
        const target = makeStatement('T');
        const draggedRoot = makeStatement('D');
        expect(() =>
            joinTowers({ draggedRoot, target, draggedKind: 'next', targetKind: 'next' }),
        ).toThrow(/unsupported mating/);
    });
});

/** A free-floating value node. */
function makeValue(id: string): TowerValueNode {
    return {
        kind: 'value',
        model: new ValueBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'numberbox', value: 0 },
        }),
        parent: null,
    };
}

/** An expression node with one arg slot per `params` entry, all empty unless `args` is supplied. */
function makeExpression(
    id: string,
    params: [string | null, ...(string | null)[]],
    args?: (TowerNode | null)[],
): TowerExpressionNode {
    return {
        kind: 'expression',
        model: new ExpressionBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params,
        }),
        parent: null,
        args: args ?? params.map(() => null),
    };
}

describe('joinArg', () => {
    it('plugs a value into an empty expression slot, leaving other slots untouched', () => {
        const target = makeExpression('E', ['A', 'B']); // two empty slots
        const draggedRoot = makeValue('V');

        joinArg({ draggedRoot, target, slotIndex: 1 });

        // Slot 1 now references the value; its parent back-pointer targets the expression.
        expect(target.args[1]).toBe(draggedRoot);
        expect(draggedRoot.parent).toBe(target);
        // The other slot is left alone.
        expect(target.args[0]).toBeNull();
    });

    it('plugs an expression into another expression slot (output child)', () => {
        const target = makeExpression('outer', ['A']);
        const draggedRoot = makeExpression('inner', ['X']);

        joinArg({ draggedRoot, target, slotIndex: 0 });

        expect(target.args[0]).toBe(draggedRoot);
        expect(draggedRoot.parent).toBe(target);
    });

    it('plugs a value into a statement target argument slot', () => {
        const target = makeStatement('S');
        target.args = [null, null];
        const draggedRoot = makeValue('V');

        joinArg({ draggedRoot, target, slotIndex: 0 });

        expect(target.args[0]).toBe(draggedRoot);
        expect(draggedRoot.parent).toBe(target);
        expect(target.args[1]).toBeNull();
    });
});
