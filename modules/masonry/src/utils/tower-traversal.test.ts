import { describe, expect, it } from 'vitest';

import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { traverseBottomUp } from './tower-traversal';

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

function makeStatement(id: string, numArgs: number, hasNesting: boolean): TowerStatementNode {
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
            hasNesting,
        }),
        prev: null,
        next: null,
        args: Array(numArgs).fill(null),
        nestedNext: hasNesting ? null : undefined,
    };
}

describe('traverseBottomUp', () => {
    it('yields a single value node', () => {
        const root = makeValue('v1');
        const gen = traverseBottomUp(root);

        const firstBatch = gen.next().value;
        expect(firstBatch).toHaveLength(1);
        expect(firstBatch[0]).toBe(root);

        expect(gen.next().done).toBe(true);
    });

    it('yields expressions bottom-up (arguments first)', () => {
        // add(1, 2)
        const v1 = makeValue('v1');
        const v2 = makeValue('v2');
        const add = makeExpression('add', 2);
        add.args = [v1, v2];
        v1.parent = add;
        v2.parent = add;

        const gen = traverseBottomUp(add);

        // Leaves (v1, v2) should be yielded first
        const batch1 = gen.next().value;
        expect(batch1).toHaveLength(2);
        expect(batch1).toContain(v1);
        expect(batch1).toContain(v2);

        // Root expression should be yielded next
        const batch2 = gen.next().value;
        expect(batch2).toHaveLength(1);
        expect(batch2[0]).toBe(add);

        expect(gen.next().done).toBe(true);
    });

    it('yields statements bottom-up (innermost cavities first)', () => {
        // outer ( depth 0 )
        //   -> inner ( depth 1 )
        const outer = makeStatement('outer', 0, true);
        const inner = makeStatement('inner', 0, false);
        outer.nestedNext = inner;
        inner.prev = outer;

        const gen = traverseBottomUp(outer);

        const batch1 = gen.next().value;
        expect(batch1).toHaveLength(1);
        expect(batch1[0]).toBe(inner);

        const batch2 = gen.next().value;
        expect(batch2).toHaveLength(1);
        expect(batch2[0]).toBe(outer);

        expect(gen.next().done).toBe(true);
    });

    it('handles a complex tree correctly (arguments before statements, bottom-up)', () => {
        // stmt1 (arg: add(1, sub(2, 3)))
        //   -> nested: stmt2 (arg: 4)
        //   -> next: stmt3
        const stmt1 = makeStatement('stmt1', 1, true);
        const stmt2 = makeStatement('stmt2', 1, false);
        const stmt3 = makeStatement('stmt3', 0, false);

        const add = makeExpression('add', 2);
        const sub = makeExpression('sub', 2);
        const v1 = makeValue('v1');
        const v2 = makeValue('v2');
        const v3 = makeValue('v3');
        const v4 = makeValue('v4');

        sub.args = [v2, v3];
        add.args = [v1, sub];
        stmt1.args = [add];
        stmt1.nestedNext = stmt2;
        stmt1.next = stmt3;
        stmt2.args = [v4];

        const gen = traverseBottomUp(stmt1);

        // Arg Heights (bottom-up):
        // v1, v2, v3, v4 have no children -> height 0
        // sub depends on v2, v3 -> height 1
        // add depends on v1, sub -> height 2

        // 1st yield: all value leaves (v1, v2, v3, v4)
        const batch1 = gen.next().value;
        expect(batch1).toHaveLength(4);
        expect(batch1).toContain(v1);
        expect(batch1).toContain(v2);
        expect(batch1).toContain(v3);
        expect(batch1).toContain(v4);

        // 2nd yield: sub
        const batch2 = gen.next().value;
        expect(batch2).toHaveLength(1);
        expect(batch2).toContain(sub);

        // 3rd yield: add
        const batch3 = gen.next().value;
        expect(batch3).toHaveLength(1);
        expect(batch3).toContain(add);

        // Stmt Heights (bottom-up based on cavities):
        // stmt2, stmt3 have no cavities -> height 0
        // stmt1 has stmt2 in its cavity -> height 1

        // 4th yield: stmt leaves (stmt2, stmt3)
        const batch4 = gen.next().value;
        expect(batch4).toHaveLength(2);
        expect(batch4).toContain(stmt2);
        expect(batch4).toContain(stmt3);

        // 5th yield: stmt1
        const batch5 = gen.next().value;
        expect(batch5).toHaveLength(1);
        expect(batch5).toContain(stmt1);

        expect(gen.next().done).toBe(true);
    });
});
