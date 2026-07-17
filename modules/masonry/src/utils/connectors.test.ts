import { describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import { StatementBrickModel } from '@/models/brick';
import { statementTreeNoNesting, statementTreeWithNesting, valueTree } from '@/mocks/tower';

import {
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

    it('returns nothing for a non-statement root', () => {
        const coords: Record<string, Point> = { [valueTree.model.id]: { x: 0, y: 0 } };
        expect(collectProbeConnectors(valueTree, { x: 0, y: 0 }, coords, 't')).toEqual([]);
    });
});
