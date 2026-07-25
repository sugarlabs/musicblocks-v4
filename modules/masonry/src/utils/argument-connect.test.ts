import { describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';
import type { ArgumentConnectorMeta, TowerState } from '@/@types/workspace.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { extractArgumentConnectors } from './argument-collision';
import { joinArg, resolveArgumentDrop } from './argument-connect';
import { QuadtreeCollisionSpace } from './collision';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

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

function makeExpression(id: string, numArgs: number): TowerExpressionNode {
    return {
        kind: 'expression',
        model: new ExpressionBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            params: Array(numArgs).fill('param') as any,
        }),
        parent: null,
        args: Array(numArgs).fill(null),
    };
}

function makeStatement(id: string, numArgs: number): TowerStatementNode {
    return {
        kind: 'statement',
        model: new StatementBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params: Array(numArgs).fill('param'),
            hasConnectionPrev: true,
            hasConnectionNext: true,
        }),
        prev: null,
        next: null,
        args: Array(numArgs).fill(null),
    };
}

/** Populates a fresh collision space + connectors record from a positioned tower root. */
function seed(towerId: string, root: TowerNode) {
    const space = new QuadtreeCollisionSpace(4000, 4000);
    const connectors: Record<number, ArgumentConnectorMeta> = {};

    const results = extractArgumentConnectors(towerId, root);
    space.createObjects(results.map((r) => r.object));
    for (const r of results) connectors[r.meta.id] = r.meta;

    return { space, connectors, results };
}

/** The world centre of a given brick's input-slot groove, as tracked in the collision space. */
function inputCenter(towerId: string, node: TowerNode, slotIndex: number): Point {
    const object = seed(towerId, node).results.find(
        (r) => r.meta.type === 'input' && r.meta.slotIndex === slotIndex,
    )!.object;
    return { x: object.x, y: object.y };
}

describe('resolveArgumentDrop', () => {
    it('resolves the empty slot a probe collides with', () => {
        const target = makeExpression('expr', 1);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);
        const towers: Record<string, TowerState> = {
            target: { id: 'target', root: target, position: { x: 0, y: 0 } },
        };

        const result = resolveArgumentDrop({
            probeCenter: inputCenter('target', target, 0),
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers,
        });

        expect(result).not.toBeNull();
        expect(result!.towerId).toBe('target');
        expect(result!.node).toBe(target);
        expect(result!.slotIndex).toBe(0);
    });

    it('snaps even when the probe is offset within snap distance', () => {
        const target = makeExpression('expr', 1);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);
        const centre = inputCenter('target', target, 0);

        // A near miss (a few px off the groove centre) still snaps.
        const result = resolveArgumentDrop({
            probeCenter: { x: centre.x + 12, y: centre.y - 8 },
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(result!.slotIndex).toBe(0);
    });

    it('resolves an empty slot on a statement target too', () => {
        const target = makeStatement('stmt', 1);
        target.model.setPosition(600, 400);
        const { space, connectors } = seed('target', target);
        const towers: Record<string, TowerState> = {
            target: { id: 'target', root: target, position: { x: 0, y: 0 } },
        };

        const result = resolveArgumentDrop({
            probeCenter: inputCenter('target', target, 0),
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers,
        });

        expect(result!.node).toBe(target);
        expect(result!.slotIndex).toBe(0);
    });

    it('skips an occupied slot', () => {
        const target = makeExpression('expr', 1);
        target.args[0] = makeValue('child');
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);

        const result = resolveArgumentDrop({
            probeCenter: inputCenter('target', target, 0),
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(result).toBeNull();
    });

    it("never snaps into the dragged tower's own slots", () => {
        const target = makeExpression('expr', 1);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('self', target);

        const result = resolveArgumentDrop({
            probeCenter: inputCenter('self', target, 0),
            draggedTowerId: 'self',
            space,
            connectors,
            towers: { self: { id: 'self', root: target, position: { x: 0, y: 0 } } },
        });

        expect(result).toBeNull();
    });

    it('picks the nearest of several empty slots', () => {
        const target = makeExpression('expr', 3);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);

        // Probe exactly over slot 2's groove — it must win over slots 0 and 1.
        const result = resolveArgumentDrop({
            probeCenter: inputCenter('target', target, 2),
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(result!.slotIndex).toBe(2);
    });

    it('returns null when nothing is within snap distance', () => {
        const target = makeExpression('expr', 1);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);

        const result = resolveArgumentDrop({
            probeCenter: { x: 20, y: 20 },
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(result).toBeNull();
    });

    it('ignores a hit whose tower is no longer in the workspace', () => {
        const target = makeExpression('expr', 1);
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('gone', target);

        const result = resolveArgumentDrop({
            probeCenter: inputCenter('gone', target, 0),
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: {}, // 'gone' was removed
        });

        expect(result).toBeNull();
    });
});

describe('joinArg', () => {
    it('plugs the dragged root into the slot and back-links its parent', () => {
        const target = makeExpression('expr', 2);
        const dragged = makeValue('val');

        joinArg({ draggedRoot: dragged, target, slotIndex: 1 });

        expect(target.args[1]).toBe(dragged);
        expect(target.args[0]).toBeNull();
        expect(dragged.parent).toBe(target);
    });

    it('accepts an expression root as the dragged tower', () => {
        const target = makeStatement('stmt', 1);
        const dragged = makeExpression('inner', 1);

        joinArg({ draggedRoot: dragged, target, slotIndex: 0 });

        expect(target.args[0]).toBe(dragged);
        expect(dragged.parent).toBe(target);
    });
});
