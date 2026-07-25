import { describe, expect, it } from 'vitest';

import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';
import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { findNode, traverseBottomUp, traverseTopDown } from './tower-traversal';

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

describe('traverseTopDown', () => {
    /** Simulates the measurement pass: sets a widget size and computes dims like the layout hook. */
    function makeMeasuredStatement(
        id: string,
        widgetH: number,
        hasNesting = false,
    ): TowerStatementNode {
        const node = makeStatement(id, 0, hasNesting);
        node.model.widgetDims = { w: 60, h: widgetH };
        node.model.computeDims();
        return node;
    }

    /** Links statements via `prev`/`next` and returns the head. */
    function link(statements: TowerStatementNode[]): TowerStatementNode {
        statements.forEach((statement, index) => {
            statement.prev = statements[index - 1] ?? null;
            statement.next = statements[index + 1] ?? null;
        });
        return statements[0];
    }

    /** Fills the parent's cavity with a chain and computes its outline so `bounds.nesting` exists. */
    function nest(parent: TowerStatementNode, chain: TowerStatementNode[]): void {
        parent.nestedNext = link(chain);
        let totalH = 0;
        let maxW = 0;
        chain.forEach((statement) => {
            totalH += statement.model.dims.h;
            maxW = Math.max(maxW, statement.model.dims.w);
        });
        parent.model.nestingDims = { w: maxW, h: totalH };
        parent.model.computeOutline();
    }

    /** Simulates the measurement pass for a value node. */
    function makeMeasuredValue(id: string, widgetH = 20): TowerValueNode {
        const node = makeValue(id);
        node.model.widgetDims = { w: 40, h: widgetH };
        node.model.computeDims();
        return node;
    }

    /** Attaches measured args to a parent and computes its outline so `bounds.args` exists. */
    function attachArgs(
        parent: TowerExpressionNode | TowerStatementNode,
        args: (TowerNode | null)[],
    ): void {
        parent.args = args;
        parent.model.argDims = args.map((arg) =>
            arg ? { w: arg.model.dims.w, h: arg.model.dims.h } : null,
        );
        parent.model.computeOutline();
    }

    it('positions a lone non-statement root at the origin', () => {
        const v1 = makeMeasuredValue('v1');

        const positioned = traverseTopDown(v1);

        expect(positioned).toEqual([v1]);
        expect(v1.model.position).toEqual({ x: 0, y: 0 });
    });

    it('positions the root statement at the origin', () => {
        const st1 = makeMeasuredStatement('st1', 20);

        const positioned = traverseTopDown(st1);

        expect(positioned).toEqual([st1]);
        expect(st1.model.position).toEqual({ x: 0, y: 0 });
    });

    it('positions the root at the passed origin', () => {
        const st1 = makeMeasuredStatement('st1', 20);

        traverseTopDown(st1, { x: 300, y: 150 });

        expect(st1.model.position).toEqual({ x: 300, y: 150 });
    });

    it('positions every brick relative to the passed origin', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const st2 = makeStatement('st2', 1, false);
        st2.model.widgetDims = { w: 60, h: 20 };
        const v1 = makeMeasuredValue('v1');
        attachArgs(st2, [v1]);
        link([st1, st2]);

        traverseTopDown(st1, { x: 300, y: 150 });

        const slot = st2.model.bounds.args![0]!;
        expect(st1.model.position).toEqual({ x: 300, y: 150 });
        expect(st2.model.position).toEqual({ x: 300, y: 150 + st1.model.dims.h });
        expect(v1.model.position).toEqual({
            x: 300 + slot.x,
            y: 150 + st1.model.dims.h + slot.y,
        });
    });

    it('stacks a next chain vertically, each statement flush below its predecessor', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const st2 = makeMeasuredStatement('st2', 40);
        const st3 = makeMeasuredStatement('st3', 60);

        traverseTopDown(link([st1, st2, st3]));

        expect(st1.model.position).toEqual({ x: 0, y: 0 });
        expect(st2.model.position).toEqual({ x: 0, y: st1.model.dims.h });
        expect(st3.model.position).toEqual({ x: 0, y: st1.model.dims.h + st2.model.dims.h });
    });

    it('offsets a nested chain by the parent nesting cavity bounds', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const ns1 = makeMeasuredStatement('ns1', 20, true);
        const st4 = makeMeasuredStatement('st4', 20);
        const inner1 = makeMeasuredStatement('ns1.inner1', 20);
        const inner2 = makeMeasuredStatement('ns1.inner2', 40);
        nest(ns1, [inner1, inner2]);

        traverseTopDown(link([st1, ns1, st4]));

        const cavity = ns1.model.bounds.nesting;
        expect(cavity).toBeDefined();

        // Cavity chain: offset from ns1's position, then stacking as usual.
        expect(ns1.model.position).toEqual({ x: 0, y: st1.model.dims.h });
        expect(inner1.model.position).toEqual({
            x: cavity!.x,
            y: st1.model.dims.h + cavity!.y,
        });
        expect(inner2.model.position).toEqual({
            x: cavity!.x,
            y: st1.model.dims.h + cavity!.y + inner1.model.dims.h,
        });
        // The statement after ns1 sits below ns1's full height (cavity included in dims).
        expect(st4.model.position).toEqual({
            x: 0,
            y: st1.model.dims.h + ns1.model.dims.h,
        });
    });

    it('accumulates offsets across multiple nesting levels', () => {
        const inner = makeMeasuredStatement('ns1.ns2.inner', 20);
        const ns2 = makeMeasuredStatement('ns1.ns2', 20, true);
        nest(ns2, [inner]);
        const ns1 = makeMeasuredStatement('ns1', 20, true);
        nest(ns1, [ns2]);

        traverseTopDown(ns1);

        const outerCavity = ns1.model.bounds.nesting!;
        const innerCavity = ns2.model.bounds.nesting!;

        expect(ns1.model.position).toEqual({ x: 0, y: 0 });
        expect(ns2.model.position).toEqual({ x: outerCavity.x, y: outerCavity.y });
        expect(inner.model.position).toEqual({
            x: outerCavity.x + innerCavity.x,
            y: outerCavity.y + innerCavity.y,
        });
    });

    it('falls back to a zero cavity offset when nesting bounds are absent', () => {
        const ns1 = makeMeasuredStatement('ns1', 20, true);
        const inner = makeMeasuredStatement('ns1.inner', 20);
        // Nested chain present, but the outline (and its nesting bounds) was never computed.
        ns1.nestedNext = inner;
        inner.prev = ns1;

        traverseTopDown(ns1);

        expect(inner.model.position).toEqual({ x: 0, y: 0 });
    });

    it('offsets expression arguments by their argument slot bounds', () => {
        const v1 = makeMeasuredValue('v1');
        const v2 = makeMeasuredValue('v2', 40);
        const add = makeExpression('add', 2);
        add.model.widgetDims = { w: 60, h: 20 };
        attachArgs(add, [v1, v2]);

        const positioned = traverseTopDown(add);

        const slots = add.model.bounds.args;
        expect(slots).toBeDefined();
        expect(positioned).toHaveLength(3);
        expect(add.model.position).toEqual({ x: 0, y: 0 });
        expect(v1.model.position).toEqual({ x: slots![0]!.x, y: slots![0]!.y });
        expect(v2.model.position).toEqual({ x: slots![1]!.x, y: slots![1]!.y });
    });

    it('accumulates argument offsets through nested expressions', () => {
        const v1 = makeMeasuredValue('v1');
        const sub = makeExpression('sub', 1);
        sub.model.widgetDims = { w: 60, h: 20 };
        attachArgs(sub, [v1]);
        const add = makeExpression('add', 1);
        add.model.widgetDims = { w: 60, h: 20 };
        attachArgs(add, [sub]);

        traverseTopDown(add);

        const outerSlot = add.model.bounds.args![0]!;
        const innerSlot = sub.model.bounds.args![0]!;
        expect(sub.model.position).toEqual({ x: outerSlot.x, y: outerSlot.y });
        expect(v1.model.position).toEqual({
            x: outerSlot.x + innerSlot.x,
            y: outerSlot.y + innerSlot.y,
        });
    });

    it('offsets statement arguments by slot bounds relative to the statement position', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const st2 = makeStatement('st2', 1, false);
        st2.model.widgetDims = { w: 60, h: 20 };
        const v1 = makeMeasuredValue('v1');
        attachArgs(st2, [v1]);
        link([st1, st2]);

        traverseTopDown(st1);

        const slot = st2.model.bounds.args![0]!;
        expect(v1.model.position).toEqual({
            x: slot.x,
            y: st1.model.dims.h + slot.y,
        });
    });

    it('skips empty argument slots and falls back to a zero offset when slot bounds are absent', () => {
        const v1 = makeMeasuredValue('v1');
        const add = makeExpression('add', 2);
        // Argument attached, but the outline (and its arg slot bounds) was never computed.
        add.args = [null, v1];

        const positioned = traverseTopDown(add);

        expect(positioned).toHaveLength(2);
        expect(v1.model.position).toEqual({ x: 0, y: 0 });
    });

    it('visits every statement exactly once, parent before next and nested children', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const ns1 = makeMeasuredStatement('ns1', 20, true);
        const st2 = makeMeasuredStatement('st2', 20);
        const inner1 = makeMeasuredStatement('ns1.inner1', 20);
        const inner2 = makeMeasuredStatement('ns1.inner2', 20, true);
        const deep = makeMeasuredStatement('ns1.inner2.deep', 20);
        nest(inner2, [deep]);
        nest(ns1, [inner1, inner2]);
        const root = link([st1, ns1, st2]);

        const positioned = traverseTopDown(root);

        expect(positioned).toHaveLength(6);
        expect(new Set(positioned).size).toBe(6);
        for (const node of positioned) {
            if (node.kind !== 'statement') continue;
            const index = positioned.indexOf(node);
            if (node.next?.kind === 'statement') {
                expect(positioned.indexOf(node.next)).toBeGreaterThan(index);
            }
            if (node.nestedNext?.kind === 'statement') {
                expect(positioned.indexOf(node.nestedNext)).toBeGreaterThan(index);
            }
        }
    });

    it('recomputes positions when dims change and it runs again', () => {
        const st1 = makeMeasuredStatement('st1', 20);
        const st2 = makeMeasuredStatement('st2', 20);
        const root = link([st1, st2]);

        traverseTopDown(root);
        expect(st2.model.position).toEqual({ x: 0, y: st1.model.dims.h });

        st1.model.widgetDims = { w: 60, h: 80 };
        st1.model.computeDims();
        traverseTopDown(root);
        expect(st2.model.position).toEqual({ x: 0, y: st1.model.dims.h });
        expect(st2.model.position.y).toBeGreaterThan(20);
    });
});

describe('findNode', () => {
    it('finds the root itself', () => {
        const root = makeExpression('root', 1);

        expect(findNode(root, 'root')).toBe(root);
    });

    it('finds a node nested in an argument slot', () => {
        const root = makeExpression('root', 2);
        const inner = makeExpression('inner', 1);
        const leaf = makeValue('leaf');

        inner.args[0] = leaf;
        root.args[1] = inner;

        expect(findNode(root, 'inner')).toBe(inner);
        expect(findNode(root, 'leaf')).toBe(leaf);
    });

    it('finds a node further down a statement chain and inside a cavity', () => {
        const head = makeStatement('head', 0, true);
        const tail = makeStatement('tail', 0, false);
        const nested = makeStatement('nested', 0, false);

        head.next = tail;
        tail.prev = head;
        head.nestedNext = nested;

        expect(findNode(head, 'tail')).toBe(tail);
        expect(findNode(head, 'nested')).toBe(nested);
    });

    it('returns null for an id that is not in the tower', () => {
        const root = makeExpression('root', 1);
        root.args[0] = makeValue('leaf');

        expect(findNode(root, 'absent')).toBeNull();
    });
});
