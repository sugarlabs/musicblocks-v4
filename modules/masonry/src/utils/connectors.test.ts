import { describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { statementTreeNoNesting, statementTreeWithNesting, valueTree } from '@/mocks/tower';

import {
    collectArgConnectors,
    collectConnectors,
    collectOpenConnectors,
    collectProbeConnectors,
    type Connector,
    type OpenConnector,
} from './connectors';
import { listNodes } from './tower-traversal';

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

/** Builds a coords map assigning every statement node in the tower a distinct top-left px point. */
function buildCoords(root: TowerNode): Record<string, Point> {
    const coords: Record<string, Point> = {};
    let step = 0;
    for (const node of listNodes(root)) {
        if (node.kind === 'statement') {
            coords[node.model.id] = { x: step * 10, y: step * 100 };
            step += 1;
        }
    }
    return coords;
}

/** Convenience: find a single connector by node id + kind. */
function find(connectors: OpenConnector[], nodeId: string, kind: OpenConnector['kind']) {
    return connectors.filter((c) => c.nodeId === nodeId && c.kind === kind);
}

/** Convenience: find one occupancy-tagged connector by node id + kind. */
function findC(connectors: Connector[], nodeId: string, kind: Connector['kind']) {
    return connectors.filter((c) => c.nodeId === nodeId && c.kind === kind);
}

describe('collectOpenConnectors', () => {
    it('emits prev and next for a standalone statement, at the correct world points', () => {
        const node = makeStatement('S');
        const origin: Point = { x: 5, y: 7 };
        const topLeft: Point = { x: 40, y: 400 };
        const coords: Record<string, Point> = { S: topLeft };

        const result = collectOpenConnectors(node, origin, coords, 'tower-1');
        const offsets = node.model.getConnectorCoords();

        expect(result).toHaveLength(2);

        const prev = find(result, 'S', 'prev')[0];
        expect(prev).toBeDefined();
        expect(prev.towerId).toBe('tower-1');
        expect(prev.point).toEqual({
            x: origin.x + topLeft.x + offsets.prev!.x,
            y: origin.y + topLeft.y + offsets.prev!.y,
        });

        const next = find(result, 'S', 'next')[0];
        expect(next.point).toEqual({
            x: origin.x + topLeft.x + offsets.next!.x,
            y: origin.y + topLeft.y + offsets.next!.y,
        });
    });

    it('does not emit prev/next when the model lacks those connectors', () => {
        const node = makeStatement('S', { hasConnectionPrev: false, hasConnectionNext: false });
        const result = collectOpenConnectors(node, { x: 0, y: 0 }, { S: { x: 0, y: 0 } }, 't');
        expect(result).toHaveLength(0);
    });

    it('treats occupied prev/next pointers as closed (only chain ends are open)', () => {
        const head = makeStatement('head');
        const tail = makeStatement('tail');
        head.next = tail;
        tail.prev = head;

        const coords: Record<string, Point> = { head: { x: 0, y: 0 }, tail: { x: 0, y: 50 } };
        const result = collectOpenConnectors(head, { x: 0, y: 0 }, coords, 't');

        // Open: head.prev and tail.next. Closed: head.next (=tail) and tail.prev (=head).
        expect(result).toHaveLength(2);
        expect(find(result, 'head', 'prev')).toHaveLength(1);
        expect(find(result, 'tail', 'next')).toHaveLength(1);
        expect(find(result, 'head', 'next')).toHaveLength(0);
        expect(find(result, 'tail', 'prev')).toHaveLength(0);
    });

    it('emits nestedNext only for an empty cavity, not a filled one', () => {
        const empty = makeStatement('empty', { hasNesting: true }); // nestedNext === null
        const emptyResult = collectOpenConnectors(
            empty,
            { x: 0, y: 0 },
            { empty: { x: 0, y: 0 } },
            't',
        );
        expect(find(emptyResult, 'empty', 'nestedNext')).toHaveLength(1);

        const filled = makeStatement('filled', { hasNesting: true });
        const child = makeStatement('child');
        filled.nestedNext = child;
        child.prev = filled;
        const filledCoords: Record<string, Point> = {
            filled: { x: 0, y: 0 },
            child: { x: 10, y: 30 },
        };
        const filledResult = collectOpenConnectors(filled, { x: 0, y: 0 }, filledCoords, 't');
        expect(find(filledResult, 'filled', 'nestedNext')).toHaveLength(0);
    });

    it('does not emit nestedNext for a statement without a cavity', () => {
        const node = makeStatement('S'); // nestedNext === undefined
        const result = collectOpenConnectors(node, { x: 0, y: 0 }, { S: { x: 0, y: 0 } }, 't');
        expect(find(result, 'S', 'nestedNext')).toHaveLength(0);
    });

    it('skips nodes whose top-left coordinate is missing from the coords map', () => {
        const node = makeStatement('S');
        const result = collectOpenConnectors(node, { x: 0, y: 0 }, {}, 't');
        expect(result).toHaveLength(0);
    });

    describe('collectConnectors (open + occupied targets)', () => {
        it('tags a standalone statement prev/next as unoccupied', () => {
            const node = makeStatement('S');
            const result = collectConnectors(node, { x: 0, y: 0 }, { S: { x: 0, y: 0 } }, 't');

            expect(result).toHaveLength(2);
            expect(findC(result, 'S', 'prev')[0].occupied).toBe(false);
            expect(findC(result, 'S', 'next')[0].occupied).toBe(false);
        });

        it('emits occupied AND open connectors along a two-brick chain', () => {
            const head = makeStatement('head');
            const tail = makeStatement('tail');
            head.next = tail;
            tail.prev = head;

            const coords: Record<string, Point> = { head: { x: 0, y: 0 }, tail: { x: 0, y: 50 } };
            const result = collectConnectors(head, { x: 0, y: 0 }, coords, 't');

            // Every sequence connector is emitted (4 total), unlike collectOpenConnectors (2).
            expect(result).toHaveLength(4);
            // Interior seam is occupied; the two chain ends are open.
            expect(findC(result, 'head', 'next')[0].occupied).toBe(true);
            expect(findC(result, 'tail', 'prev')[0].occupied).toBe(true);
            expect(findC(result, 'head', 'prev')[0].occupied).toBe(false);
            expect(findC(result, 'tail', 'next')[0].occupied).toBe(false);
        });

        it('tags a filled nesting cavity nestedNext as occupied and an empty one as open', () => {
            const filled = makeStatement('filled', { hasNesting: true });
            const child = makeStatement('child');
            filled.nestedNext = child;
            child.prev = filled;
            const filledCoords: Record<string, Point> = {
                filled: { x: 0, y: 0 },
                child: { x: 10, y: 30 },
            };
            const filledResult = collectConnectors(filled, { x: 0, y: 0 }, filledCoords, 't');
            expect(findC(filledResult, 'filled', 'nestedNext')[0].occupied).toBe(true);

            const empty = makeStatement('empty', { hasNesting: true });
            const emptyResult = collectConnectors(
                empty,
                { x: 0, y: 0 },
                { empty: { x: 0, y: 0 } },
                't',
            );
            expect(findC(emptyResult, 'empty', 'nestedNext')[0].occupied).toBe(false);
        });

        it('collectOpenConnectors is exactly the unoccupied subset of collectConnectors', () => {
            const coords = buildCoords(statementTreeWithNesting);
            const all = collectConnectors(statementTreeWithNesting, { x: 0, y: 0 }, coords, 'nest');
            const open = collectOpenConnectors(
                statementTreeWithNesting,
                { x: 0, y: 0 },
                coords,
                'nest',
            );

            const openFromAll = all.filter((c) => !c.occupied);
            expect(open).toHaveLength(openFromAll.length);
            // The occupied tag is stripped from the open-only result.
            expect(open.every((c) => !('occupied' in c))).toBe(true);
        });
    });

    describe('mocks/tower.ts', () => {
        it('statementTreeNoNesting has no open connectors (both chain ends are capped)', () => {
            const coords = buildCoords(statementTreeNoNesting);
            const result = collectOpenConnectors(
                statementTreeNoNesting,
                { x: 0, y: 0 },
                coords,
                'no-nest',
            );
            expect(result).toEqual([]);
        });

        it('statementTreeWithNesting exposes the open ends of each cavity chain', () => {
            const coords = buildCoords(statementTreeWithNesting);
            const result = collectOpenConnectors(
                statementTreeWithNesting,
                { x: 0, y: 0 },
                coords,
                'nest',
            );

            // Cavity heads have prev === null (open prev); cavity tails have next === null (open next).
            const prevIds = result
                .filter((c) => c.kind === 'prev')
                .map((c) => c.nodeId)
                .sort();
            const nextIds = result
                .filter((c) => c.kind === 'next')
                .map((c) => c.nodeId)
                .sort();
            const nestedIds = result.filter((c) => c.kind === 'nestedNext').map((c) => c.nodeId);

            expect(prevIds).toEqual(
                [
                    'Nesting Statement 1.Statement 6',
                    'Nesting Statement 1.Nesting Statement 2.Statement 7',
                    'Nesting Statement 3.Statement 8',
                ].sort(),
            );
            expect(nextIds).toEqual(
                [
                    'Nesting Statement 1.Nesting Statement 2',
                    'Nesting Statement 1.Nesting Statement 2.Statement 7',
                    'Nesting Statement 3.Statement 9',
                ].sort(),
            );
            // Every cavity in this tree is occupied, so no nestedNext is open.
            expect(nestedIds).toEqual([]);
            expect(result.every((c) => c.towerId === 'nest')).toBe(true);
        });
    });
});

describe('collectProbeConnectors', () => {
    it("returns a standalone statement's prev and next (root is also the tail)", () => {
        const node = makeStatement('S');
        const result = collectProbeConnectors(node, { x: 0, y: 0 }, { S: { x: 0, y: 0 } }, 't');

        expect(result).toHaveLength(2);
        expect(find(result, 'S', 'prev')).toHaveLength(1);
        expect(find(result, 'S', 'next')).toHaveLength(1);
        expect(result.every((c) => c.towerId === 't')).toBe(true);
    });

    it('probes the ROOT prev and the outer TAIL next of a chain, and nothing in between', () => {
        const head = makeStatement('head');
        const mid = makeStatement('mid');
        const tail = makeStatement('tail');
        head.next = mid;
        mid.prev = head;
        mid.next = tail;
        tail.prev = mid;

        const coords: Record<string, Point> = {
            head: { x: 0, y: 0 },
            mid: { x: 0, y: 50 },
            tail: { x: 0, y: 100 },
        };
        const result = collectProbeConnectors(head, { x: 0, y: 0 }, coords, 't');

        // Only the two outer ends: head.prev and tail.next.
        expect(result).toHaveLength(2);
        expect(find(result, 'head', 'prev')).toHaveLength(1);
        expect(find(result, 'tail', 'next')).toHaveLength(1);
        // The interior seam and the head's/tail's occupied ends are never probed.
        expect(find(result, 'mid', 'prev')).toHaveLength(0);
        expect(find(result, 'mid', 'next')).toHaveLength(0);
        expect(find(result, 'head', 'next')).toHaveLength(0);
        expect(find(result, 'tail', 'prev')).toHaveLength(0);
    });

    it('excludes an open nested cavity — a tower snaps by an end, not by an inner tab', () => {
        const clamp = makeStatement('clamp', { hasNesting: true }); // open nestedNext
        const below = makeStatement('below');
        clamp.next = below;
        below.prev = clamp;

        const coords: Record<string, Point> = { clamp: { x: 0, y: 0 }, below: { x: 0, y: 80 } };
        const result = collectProbeConnectors(clamp, { x: 0, y: 0 }, coords, 't');

        // clamp.prev (root) and below.next (tail) are probed; the empty cavity's nestedNext is not.
        expect(result).toHaveLength(2);
        expect(find(result, 'clamp', 'prev')).toHaveLength(1);
        expect(find(result, 'below', 'next')).toHaveLength(1);
        expect(find(result, 'clamp', 'nestedNext')).toHaveLength(0);
    });

    it('omits a capped end (no prev/next connector on the model)', () => {
        const node = makeStatement('S', { hasConnectionPrev: false });
        const result = collectProbeConnectors(node, { x: 0, y: 0 }, { S: { x: 0, y: 0 } }, 't');

        // Only the (present) next end is probed; the missing prev is simply absent.
        expect(result).toHaveLength(1);
        expect(find(result, 'S', 'next')).toHaveLength(1);
        expect(find(result, 'S', 'prev')).toHaveLength(0);
    });

    it('probes a free value root by its single output tab, at the correct world point', () => {
        const origin: Point = { x: 5, y: 7 };
        const topLeft: Point = { x: 40, y: 400 };
        const coords: Record<string, Point> = { [valueTree.model.id]: topLeft };

        const result = collectProbeConnectors(valueTree, origin, coords, 't');
        const output = valueTree.model.getConnectorCoords().output!;

        expect(result).toHaveLength(1);
        expect(result[0].kind).toBe('output');
        expect(result[0].nodeId).toBe(valueTree.model.id);
        expect(result[0].towerId).toBe('t');
        expect(result[0].point).toEqual({
            x: origin.x + topLeft.x + output.x,
            y: origin.y + topLeft.y + output.y,
        });
    });

    it('probes a free expression root by its output tab (not its input slots)', () => {
        const expr = makeExpression('E', ['A', 'B']);
        const result = collectProbeConnectors(expr, { x: 0, y: 0 }, { E: { x: 0, y: 0 } }, 't');

        // A dragged tower snaps by its own output only; its input slots are targets, never probes.
        expect(result).toHaveLength(1);
        expect(result[0].kind).toBe('output');
        expect(find(result, 'E', 'input')).toHaveLength(0);
    });

    it('probes nothing when the value/expression root is already plugged into a parent', () => {
        const parent = makeExpression('P', ['A']);
        const plugged = makeValue('P.child', parent);
        parent.args = [plugged];

        const result = collectProbeConnectors(
            plugged,
            { x: 0, y: 0 },
            { 'P.child': { x: 0, y: 0 } },
            't',
        );
        expect(result).toEqual([]);
    });

    it('probes nothing for a value/expression root missing from the coords map', () => {
        expect(collectProbeConnectors(valueTree, { x: 0, y: 0 }, {}, 't')).toEqual([]);
    });
});

/** A free-floating value node; pass a parent to mark it plugged in. */
function makeValue(id: string, parent: TowerNode | null = null): TowerValueNode {
    return {
        kind: 'value',
        model: new ValueBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'numberbox', value: 0 },
        }),
        parent,
    };
}

/** An expression node with `params.length` argument slots, all empty unless `args` is supplied. */
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

describe('collectArgConnectors', () => {
    it('emits one input per slot with correct slotIndex, occupancy, and world point', () => {
        // Two slots: slot 0 holds a child (occupied), slot 1 is empty (open).
        const expr = makeExpression('E', ['A', 'B']);
        const child = makeValue('E.child', expr);
        expr.args = [child, null];

        const origin: Point = { x: 5, y: 7 };
        const topLeft: Point = { x: 40, y: 400 };
        const coords: Record<string, Point> = { 'E': topLeft, 'E.child': { x: 60, y: 400 } };

        const result = collectArgConnectors(expr, origin, coords, 'tower-1');
        const inputs = result.filter((c) => c.kind === 'input');
        const offsets = expr.model.getConnectorCoords();

        expect(inputs).toHaveLength(2);
        expect(offsets.inputs).toHaveLength(2);

        const slot0 = inputs.find((c) => c.slotIndex === 0)!;
        expect(slot0).toBeDefined();
        expect(slot0.towerId).toBe('tower-1');
        expect(slot0.nodeId).toBe('E');
        expect(slot0.occupied).toBe(true); // node.args[0] is the child
        expect(slot0.point).toEqual({
            x: origin.x + topLeft.x + offsets.inputs[0].point.x,
            y: origin.y + topLeft.y + offsets.inputs[0].point.y,
        });

        const slot1 = inputs.find((c) => c.slotIndex === 1)!;
        expect(slot1.occupied).toBe(false); // node.args[1] is null
        expect(slot1.point).toEqual({
            x: origin.x + topLeft.x + offsets.inputs[1].point.x,
            y: origin.y + topLeft.y + offsets.inputs[1].point.y,
        });
    });

    it('derives input occupancy from the node graph, not the model filled flag', () => {
        // args say occupied, but argDims (model filled flag) are left empty — the graph wins.
        const expr = makeExpression('E', ['A']);
        expr.args = [makeValue('E.child', expr)];
        const result = collectArgConnectors(expr, { x: 0, y: 0 }, { E: { x: 0, y: 0 } }, 't');

        const input = result.filter((c) => c.kind === 'input');
        expect(input).toHaveLength(1);
        expect(input[0].occupied).toBe(true);
        expect(expr.model.getConnectorCoords().inputs[0].filled).toBe(false);
    });

    it('emits an output for a value brick, occupancy reflecting its parent', () => {
        const free = makeValue('V');
        const freeResult = collectArgConnectors(free, { x: 3, y: 9 }, { V: { x: 10, y: 20 } }, 't');
        expect(freeResult).toHaveLength(1);

        const output = freeResult[0];
        const offsets = free.model.getConnectorCoords();
        expect(output.kind).toBe('output');
        expect(output.occupied).toBe(false); // parent === null
        expect(output.slotIndex).toBeUndefined();
        expect(output.point).toEqual({
            x: 3 + 10 + offsets.output!.x,
            y: 9 + 20 + offsets.output!.y,
        });

        // A value plugged into a parent reports its output as occupied.
        const parent = makeExpression('P', ['A']);
        const plugged = makeValue('P.child', parent);
        parent.args = [plugged];
        const pluggedResult = collectArgConnectors(
            plugged,
            { x: 0, y: 0 },
            { 'P.child': { x: 0, y: 0 } },
            't',
        );
        expect(pluggedResult).toHaveLength(1);
        expect(pluggedResult[0].occupied).toBe(true);
    });

    it('emits BOTH the output and the input slots of an expression brick', () => {
        const expr = makeExpression('E', ['A', 'B']);
        const result = collectArgConnectors(expr, { x: 0, y: 0 }, { E: { x: 0, y: 0 } }, 't');

        const inputs = result.filter((c) => c.kind === 'input');
        const outputs = result.filter((c) => c.kind === 'output');
        expect(inputs).toHaveLength(2);
        expect(outputs).toHaveLength(1);
        // Its own output is open (no parent), both slots open (no args).
        expect(outputs[0].occupied).toBe(false);
        expect(inputs.every((c) => !c.occupied)).toBe(true);
    });

    it('skips nodes whose top-left coordinate is missing from the coords map', () => {
        const expr = makeExpression('E', ['A']);
        expect(collectArgConnectors(expr, { x: 0, y: 0 }, {}, 't')).toEqual([]);
    });
});
