import type {
    TowerExpressionNode,
    TowerNode,
    TowerStatementNode,
    TowerValueNode,
} from '@/@types/tower.types';

import { ExpressionBrickModel, StatementBrickModel, ValueBrickModel } from '@/models/brick';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

// Every node's `id` is its full ancestry path, e.g. `Statement 2.Add 5.101`, so the tree
// structure can be verified by tracing ids; each node's rendered label only shows the last
// path segment (its own name), not the full ancestry.

/** The final `.`-separated segment of a node's ancestry path, used as its rendered label. */
function lastPathSegment(path: string): string {
    return path.slice(path.lastIndexOf('.') + 1);
}

function makeValueArg(parent: TowerNode | null, path: string): TowerValueNode {
    return {
        kind: 'value',
        model: new ValueBrickModel({
            id: path,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'numberbox', value: Number(lastPathSegment(path)) },
        }),
        parent,
    };
}

function makeExpressionArg(
    parent: TowerNode | null,
    path: string,
    argFactories: ((self: TowerExpressionNode, path: string) => TowerNode)[],
): TowerExpressionNode {
    const node: TowerExpressionNode = {
        kind: 'expression',
        model: new ExpressionBrickModel({
            id: path,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: lastPathSegment(path) },
            params: argFactories.map((_, index) => String.fromCharCode(65 + index)) as [
                string,
                ...string[],
            ],
        }),
        parent,
        args: [],
    };
    node.args = argFactories.map((factory) => factory(node, path));
    return node;
}

function makeStatementArg(
    path: string,
    argFactories: ((self: TowerStatementNode, path: string) => TowerNode)[],
    options: { hasNesting?: boolean } = {},
): TowerStatementNode {
    const node: TowerStatementNode = {
        kind: 'statement',
        model: new StatementBrickModel({
            id: path,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: lastPathSegment(path) },
            params: argFactories.map((_, index) => String.fromCharCode(65 + index)),
            hasNesting: options.hasNesting ?? false,
        }),
        prev: null,
        next: null,
        args: [],
        nestedNext: options.hasNesting ? null : undefined,
    };
    node.args = argFactories.map((factory) => factory(node, path));
    return node;
}

/** Links a sequence of statement nodes via `prev`/`next` and returns the head. */
function linkStatementChain(statements: TowerStatementNode[]): TowerStatementNode {
    statements.forEach((statement, index) => {
        const prev = statements[index - 1] ?? null;
        const next = statements[index + 1] ?? null;
        statement.prev = prev;
        statement.next = next;
        statement.model.hasConnectionPrev = prev !== null;
        statement.model.hasConnectionNext = next !== null;
    });
    return statements[0];
}

// ─── Value ──────────────────────────────────────────────────────────────────

/** A single free-floating value node with no children. */
export const valueTree: TowerValueNode = makeValueArg(null, '100');

// ─── Expression ─────────────────────────────────────────────────────────────

/**
 * An expression tree encoding `(((101 + 102) - 103) + (104 - 105)) + (-106 - (107 + 108))`:
 * ```
 * ad1 ┬ ad2 ┬ sb1 ┬ ad3 ┬ 101
 *     │     │     │     └ 102
 *     │     │     └ 103
 *     │     └ sb2 ┬ 104
 *     │           └ 105
 *     └ sb3 ┬ ng1 ─ 106
 *           └ ad4 ┬ 107
 *                 └ 108
 * ```
 */
export const expressionTree: TowerExpressionNode = makeExpressionArg(null, 'Add 1', [
    (self, path) =>
        makeExpressionArg(self, `${path}.Add 2`, [
            (self, path) =>
                makeExpressionArg(self, `${path}.Sub 1`, [
                    (self, path) =>
                        makeExpressionArg(self, `${path}.Add 3`, [
                            (self, path) => makeValueArg(self, `${path}.101`),
                            (self, path) => makeValueArg(self, `${path}.102`),
                        ]),
                    (self, path) => makeValueArg(self, `${path}.103`),
                ]),
            (self, path) =>
                makeExpressionArg(self, `${path}.Sub 2`, [
                    (self, path) => makeValueArg(self, `${path}.104`),
                    (self, path) => makeValueArg(self, `${path}.105`),
                ]),
        ]),
    (self, path) =>
        makeExpressionArg(self, `${path}.Sub 3`, [
            (self, path) =>
                makeExpressionArg(self, `${path}.Neg 1`, [
                    (self, path) => makeValueArg(self, `${path}.106`),
                ]),
            (self, path) =>
                makeExpressionArg(self, `${path}.Add 4`, [
                    (self, path) => makeValueArg(self, `${path}.107`),
                    (self, path) => makeValueArg(self, `${path}.108`),
                ]),
        ]),
]);

// ─── Statement (no nesting) ─────────────────────────────────────────────────

function getStatements() {
    // St1 — no args.
    const statement1 = makeStatementArg('Statement 1', []);

    // St2 — 1 arg, a 1-level add chain.
    const statement2 = makeStatementArg('Statement 2', [
        (self, path) =>
            makeExpressionArg(self, `${path}.Add 5`, [
                (self, path) => makeValueArg(self, `${path}.101`),
                (self, path) => makeValueArg(self, `${path}.102`),
            ]),
    ]);

    // St3 — 2 args: a 2-level add/sub chain, plus a value.
    const statement3 = makeStatementArg('Statement 3', [
        (self, path) =>
            makeExpressionArg(self, `${path}.Add 6`, [
                (self, path) =>
                    makeExpressionArg(self, `${path}.Sub 4`, [
                        (self, path) => makeValueArg(self, `${path}.103`),
                        (self, path) => makeValueArg(self, `${path}.104`),
                    ]),
                (self, path) => makeValueArg(self, `${path}.105`),
            ]),
        (self, path) => makeValueArg(self, `${path}.106`),
    ]);

    // St4 — 3 args: a 3-level add/sub chain, plus two values.
    const statement4 = makeStatementArg('Statement 4', [
        (self, path) =>
            makeExpressionArg(self, `${path}.Add 7`, [
                (self, path) =>
                    makeExpressionArg(self, `${path}.Sub 5`, [
                        (self, path) =>
                            makeExpressionArg(self, `${path}.Add 8`, [
                                (self, path) => makeValueArg(self, `${path}.107`),
                                (self, path) => makeValueArg(self, `${path}.108`),
                            ]),
                        (self, path) => makeValueArg(self, `${path}.109`),
                    ]),
                (self, path) => makeValueArg(self, `${path}.110`),
            ]),
        (self, path) => makeValueArg(self, `${path}.111`),
        (self, path) => makeValueArg(self, `${path}.112`),
    ]);

    // St5 — 2 value-only args: 113, 114.
    const statement5 = makeStatementArg('Statement 5', [
        (self, path) => makeValueArg(self, `${path}.113`),
        (self, path) => makeValueArg(self, `${path}.114`),
    ]);

    return [statement1, statement2, statement3, statement4, statement5];
}

/**
 * A set of 5 non-nesting statements, each carrying a different arg shape:
 * ```
 * St1
 *
 * St2 ─ ad5 ┬ 101
 *           └ 102
 *
 * St3 ┬ ad6 ┬ sb4 ┬ 103
 *     │     │     └ 104
 *     │     └ 105
 *     └ 106
 *
 * St4 ┬ ad7 ┬ sb5 ┬ ad8 ┬ 107
 *     │     │     │     └ 108
 *     │     │     └ 109
 *     │     └ 110
 *     ├ 111
 *     └ 112
 *
 * St5 ┬ 113
 *     └ 114
 * ```
 */
export const statementTreeNoNesting: TowerStatementNode = linkStatementChain(getStatements());

// ─── Statement (with nesting) ────────────────────────────────────────────────

/**
 * NS1 — "Nesting Statement 1" with 2 nesting levels, inserted between St3 and St4:
 * ```
 * NS1 ─ 118
 *   ╠═▶ St6
 *   ╠═▶ NS2 ─ 117
 *         ╠═▶ St7 ┬ 115
 *                 └ 116
 * ```
 */
const nestingStatement1Path = 'Nesting Statement 1';
const nestingStatement2Path = `${nestingStatement1Path}.Nesting Statement 2`;

const statement7 = makeStatementArg(`${nestingStatement2Path}.Statement 7`, [
    (self, path) => makeValueArg(self, `${path}.115`),
    (self, path) => makeValueArg(self, `${path}.116`),
]);
const nestingStatement2Cavity = linkStatementChain([statement7]);

const nestingStatement2 = makeStatementArg(
    nestingStatement2Path,
    [(self, path) => makeValueArg(self, `${path}.117`)],
    { hasNesting: true },
);
nestingStatement2.nestedNext = nestingStatement2Cavity;

const statement6 = makeStatementArg(`${nestingStatement1Path}.Statement 6`, []);
const nestingStatement1Cavity = linkStatementChain([statement6, nestingStatement2]);

const nestingStatement1 = makeStatementArg(
    nestingStatement1Path,
    [(self, path) => makeValueArg(self, `${path}.118`)],
    { hasNesting: true },
);
nestingStatement1.nestedNext = nestingStatement1Cavity;

/**
 * NS3 — "Nesting Statement 3" with 1 nesting level, inserted between St4 and St5:
 * ```
 * NS3 ─ 119
 *   ╠═▶ St8
 *   ╠═▶ St9
 * ```
 */
const nestingStatement3Path = 'Nesting Statement 3';

const statement8 = makeStatementArg(`${nestingStatement3Path}.Statement 8`, []);
const statement9 = makeStatementArg(`${nestingStatement3Path}.Statement 9`, []);
const nestingStatement3Cavity = linkStatementChain([statement8, statement9]);

const nestingStatement3 = makeStatementArg(
    nestingStatement3Path,
    [(self, path) => makeValueArg(self, `${path}.119`)],
    { hasNesting: true },
);
nestingStatement3.nestedNext = nestingStatement3Cavity;

const statements = getStatements();

/**
 * A chain of 7 statements: the 5 non-nesting statements above (St1-St5), with `nestingStatement1`
 * (NS1) inserted between St3 and St4, and `nestingStatement3` (NS3) inserted between St4 and St5:
 * ```
 * St1
 *
 * St2 ─ ad5 ┬ 101
 *           └ 102
 *
 * St3 ┬ ad6 ┬ sb4 ┬ 103
 *     │     │     └ 104
 *     │     └ 105
 *     └ 106
 *
 * NS1 ─ 118
 *   ╠═▶ St6
 *   ╠═▶ NS2 ─ 117
 *         ╠═▶ St7 ┬ 115
 *                 └ 116
 *
 * St4 ┬ ad7 ┬ sb5 ┬ ad8 ┬ 107
 *     │     │     │     └ 108
 *     │     │     └ 109
 *     │     └ 110
 *     ├ 111
 *     └ 112
 *
 * NS3 ─ 119
 *   ╠═▶ St8
 *   ╠═▶ St9
 *
 * St5 ┬ 113
 *     └ 114
 * ```
 */
export const statementTreeWithNesting: TowerStatementNode = linkStatementChain([
    statements[0],
    statements[1],
    statements[2],
    nestingStatement1,
    statements[3],
    nestingStatement3,
    statements[4],
]);
