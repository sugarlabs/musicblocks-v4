import { describe, expect, it } from 'vitest';

import type {
    ExportedNode,
    ExportedProject,
    ExportedStatementNode,
} from '@/@types/import-export.types';
import type { TowerNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';
import { makeEmptyStatement, makeEmptyValue, statementTreeWithNesting } from '@/mocks/tower';
import { listNodes } from '@/utils/tower-traversal';

import { EXPORT_SCHEMA_VERSION, exportWorkspace, importProject } from './import-export';

/** Wraps roots as a towers record, positioned along a diagonal so each placement is distinct. */
function workspaceOf(...roots: TowerNode[]): Record<string, TowerState> {
    const towers: Record<string, TowerState> = {};
    roots.forEach((root, index) => {
        const id = `tower-${index + 1}`;
        towers[id] = { id, root, position: { x: index * 100, y: index * 200 } };
    });
    return towers;
}

/** Reads a node out of a project, asserting it came back as a statement so `next` is in scope. */
function statementAt(project: ExportedProject, id: string): ExportedStatementNode {
    const node = project.nodes[id];
    if (node?.kind !== 'statement') {
        throw new Error(`expected a statement brick at "${id}", got ${node?.kind ?? 'nothing'}`);
    }
    return node;
}

/** A payload as an importer really meets one: exported, then round-tripped through JSON text. */
function payloadOf(...roots: TowerNode[]): ExportedProject {
    return JSON.parse(JSON.stringify(exportWorkspace(workspaceOf(...roots))));
}

/** The ids a node points at, in declaration order. */
function childIdsOf(node: ExportedNode): string[] {
    if (node.kind === 'value') return [];

    const ids = [...node.args];
    if (node.kind === 'statement') {
        ids.push(node.next);
        if (node.nestedNext != null) ids.push(node.nestedNext);
    }
    return ids.filter((id): id is string => id !== null);
}

/**
 * Relabels every id in a project by the order a fixed walk reaches it, so two projects that differ
 * only in their ids compare equal. Lets the round-trip assertion hold under reminting, where the
 * point is that the graph and its config survive — not that the ids were copied across.
 */
function canonicalize(project: ExportedProject): ExportedProject {
    const labels = new Map<string, string>();

    const visit = (id: string) => {
        if (labels.has(id)) return;
        labels.set(id, `node-${labels.size}`);
        childIdsOf(project.nodes[id]).forEach(visit);
    };
    project.towers.forEach((tower) => visit(tower.rootNodeId));

    const nodes: Record<string, ExportedNode> = {};
    for (const [id, label] of labels) {
        const node: ExportedNode = JSON.parse(JSON.stringify(project.nodes[id]));
        Object.assign(node, { id: label });

        if (node.kind !== 'value') {
            Object.assign(node, {
                args: node.args.map((arg: string | null) =>
                    arg === null ? null : labels.get(arg),
                ),
            });
        }
        if (node.kind === 'statement') {
            Object.assign(node, {
                next: node.next === null ? null : labels.get(node.next),
                ...(node.nestedNext != null ? { nestedNext: labels.get(node.nestedNext) } : {}),
            });
        }
        nodes[label] = node;
    }

    return {
        version: project.version,
        towers: project.towers.map((tower, index) => ({
            id: `tower-${index}`,
            position: tower.position,
            rootNodeId: labels.get(tower.rootNodeId)!,
        })),
        nodes,
    };
}

describe('exportWorkspace', () => {
    describe('project', () => {
        it('stamps the schema version on the payload', () => {
            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            expect(exported.version).toBeTypeOf('number');
            expect(exported.version).toBe(EXPORT_SCHEMA_VERSION);
        });

        it('returns an empty project for an empty workspace', () => {
            expect(exportWorkspace({})).toEqual({
                version: EXPORT_SCHEMA_VERSION,
                towers: [],
                nodes: {},
            });
        });

        it('exports one entry per tower, carrying its placement and root', () => {
            const towers = workspaceOf(statementTreeWithNesting, makeEmptyStatement('lone', 0));

            const exported = exportWorkspace(towers);

            expect(exported.towers).toEqual([
                {
                    id: 'tower-1',
                    position: { x: 0, y: 0 },
                    rootNodeId: statementTreeWithNesting.model.id,
                },
                { id: 'tower-2', position: { x: 100, y: 200 }, rootNodeId: 'lone' },
            ]);
        });

        it('copies the tower position rather than sharing it', () => {
            const towers = workspaceOf(makeEmptyStatement('lone', 0));

            const exported = exportWorkspace(towers);
            towers['tower-1'].position.x = 999;

            expect(exported.towers[0].position.x).toBe(0);
        });
    });

    describe('traversal', () => {
        it('exports every node in the graph exactly once', () => {
            const live = listNodes(statementTreeWithNesting);

            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            expect(Object.keys(exported.nodes)).toHaveLength(live.length);
            for (const node of live) {
                expect(exported.nodes[node.model.id]).toBeDefined();
            }
        });

        it('collects the nodes of every tower into one dictionary', () => {
            const second = makeEmptyStatement('lone', 0);

            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting, second));

            const live = [...listNodes(statementTreeWithNesting), ...listNodes(second)];
            const expected = live.map((node) => node.model.id).sort();
            expect(Object.keys(exported.nodes).sort()).toEqual(expected);
        });

        it('survives a JSON round trip, having broken every cycle', () => {
            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            expect(() => JSON.stringify(exported)).not.toThrow();
            expect(JSON.parse(JSON.stringify(exported))).toEqual(exported);
        });

        it('throws when two towers share a brick id', () => {
            // Both roots are distinct objects carrying the same id, so flattening them into one
            // dictionary would drop a subtree; the export must refuse instead.
            const towers = workspaceOf(makeEmptyStatement('dup', 0), makeEmptyStatement('dup', 0));

            expect(() => exportWorkspace(towers)).toThrow(/duplicate brick id "dup"/);
        });
    });

    describe('structural pointers', () => {
        it('replaces each child reference with the referenced brick id', () => {
            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            const nesting1 = statementAt(exported, 'Nesting Statement 1');
            expect(nesting1.next).toBe('Statement 4');
            expect(nesting1.nestedNext).toBe('Nesting Statement 1.Statement 6');
            expect(nesting1.args).toEqual(['Nesting Statement 1.118']);
        });

        it('nulls the next pointer of the last brick in a sequence', () => {
            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            expect(statementAt(exported, 'Statement 5').next).toBeNull();
        });

        it('keeps empty argument slots as null at their own slot index', () => {
            const root = makeEmptyStatement('host', 3);
            const filled = makeEmptyValue('plugged');
            root.args[1] = filled;
            filled.parent = root;

            const exported = exportWorkspace(workspaceOf(root));

            expect(statementAt(exported, 'host').args).toEqual([null, 'plugged', null]);
        });

        it('omits nestedNext for a brick with no cavity and nulls it for an empty one', () => {
            const exported = exportWorkspace(
                workspaceOf(makeEmptyStatement('flat', 0), makeEmptyStatement('hollow', 0, true)),
            );

            expect('nestedNext' in statementAt(exported, 'flat')).toBe(false);
            expect(statementAt(exported, 'hollow').nestedNext).toBeNull();
        });
    });

    describe('brick config', () => {
        it('preserves the connection capabilities a brick was built with', () => {
            // `Statement 1` is a hat brick and `Statement 5` a terminal one. These flags drive
            // which notches get drawn, and no pointer on the exported node implies them.
            const exported = exportWorkspace(workspaceOf(statementTreeWithNesting));

            expect(statementAt(exported, 'Statement 1').modelConfig).toMatchObject({
                hasConnectionPrev: false,
                hasConnectionNext: true,
            });
            expect(statementAt(exported, 'Statement 5').modelConfig).toMatchObject({
                hasConnectionPrev: true,
                hasConnectionNext: false,
            });
        });

        it('preserves the nesting state', () => {
            const folded = makeEmptyStatement('folded', 0, true);
            folded.model.isNestingFolded = true;

            const exported = exportWorkspace(workspaceOf(folded));

            expect(statementAt(exported, 'folded').modelConfig).toMatchObject({
                hasNesting: true,
                isNestingFolded: true,
            });
        });

        it('preserves the render config and param labels', () => {
            const root = makeEmptyStatement('host', 2);
            root.model.scaleLevel = 3;

            const exported = exportWorkspace(workspaceOf(root));

            expect(statementAt(exported, 'host').modelConfig).toMatchObject({
                colorsDefault: root.model.colorsDefault,
                tooltipText: root.model.tooltipText,
                scaleLevel: 3,
                params: [...root.model.params],
            });
        });

        it("preserves a value brick's user-entered widget value", () => {
            const value = makeEmptyValue('answer');
            (value.model.widget as { value: number }).value = 42;

            const exported = exportWorkspace(workspaceOf(value));

            expect(exported.nodes['answer'].modelConfig.widget).toEqual({
                type: 'numberbox',
                value: 42,
            });
        });

        it('snapshots the widget so later edits do not reach into the export', () => {
            const value = makeEmptyValue('answer');
            (value.model.widget as { value: number }).value = 42;

            const exported = exportWorkspace(workspaceOf(value));
            // The view mutates an input widget's value in place as the user types.
            (value.model.widget as { value: number }).value = 7;

            expect(exported.nodes['answer'].modelConfig.widget).toEqual({
                type: 'numberbox',
                value: 42,
            });
        });

        it('snapshots the colors so later edits do not reach into the export', () => {
            const root = makeEmptyStatement('host', 0);

            const exported = exportWorkspace(workspaceOf(root));
            (root.model.colorsDefault as { background: string }).background = '#000000';

            expect(statementAt(exported, 'host').modelConfig.colorsDefault.background).not.toBe(
                '#000000',
            );
        });
    });
});

describe('importProject', () => {
    describe('round trip', () => {
        it('rebuilds a project that re-exports to the same graph and config', () => {
            const original = payloadOf(statementTreeWithNesting, makeEmptyStatement('lone', 0));

            const reExported = exportWorkspace(importProject(original));

            expect(canonicalize(reExported)).toEqual(canonicalize(original));
        });

        it('re-exports identically when ids are preserved', () => {
            const original = payloadOf(statementTreeWithNesting);

            const reExported = exportWorkspace(importProject(original, 'preserve'));

            expect(reExported).toEqual(original);
        });

        it('survives a second round trip', () => {
            const original = payloadOf(statementTreeWithNesting);

            const once = exportWorkspace(importProject(original));
            const twice = exportWorkspace(importProject(once));

            expect(canonicalize(twice)).toEqual(canonicalize(original));
        });
    });

    describe('id resolution', () => {
        it('mints ids that collide with neither the payload nor a second import', () => {
            const payload = payloadOf(statementTreeWithNesting);

            const first = importProject(payload);
            const second = importProject(payload);

            const idsOf = (towers: Record<string, TowerState>) =>
                Object.values(towers).flatMap((t) => listNodes(t.root).map((n) => n.model.id));
            const payloadIds = new Set(Object.keys(payload.nodes));
            const firstIds = idsOf(first);
            const secondIds = idsOf(second);

            expect(firstIds.some((id) => payloadIds.has(id))).toBe(false);
            expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
            // Tower ids are minted too, so two imports of one payload can coexist.
            expect(Object.keys(first)).not.toEqual(Object.keys(second));
            expect(new Set(firstIds).size).toBe(firstIds.length);
        });

        it('keeps the payload ids when asked to preserve them', () => {
            const payload = payloadOf(statementTreeWithNesting);

            const towers = importProject(payload, 'preserve');

            const ids = Object.values(towers).flatMap((t) =>
                listNodes(t.root).map((n) => n.model.id),
            );
            expect(new Set(ids)).toEqual(new Set(Object.keys(payload.nodes)));
            expect(Object.keys(towers)).toEqual(payload.towers.map((t) => t.id));
        });
    });

    describe('back-references', () => {
        it('points every argument back at the brick whose slot it fills', () => {
            const towers = importProject(payloadOf(statementTreeWithNesting));

            let checked = 0;
            for (const tower of Object.values(towers)) {
                for (const node of listNodes(tower.root)) {
                    if (node.kind === 'value') continue;
                    node.args.forEach((arg: TowerNode | null) => {
                        if (!arg) return;
                        // Arg slots only ever hold values and expressions, the two kinds that
                        // carry a parent pointer.
                        expect(
                            (arg as Extract<TowerNode, { kind: 'value' | 'expression' }>).parent,
                        ).toBe(node);
                        checked++;
                    });
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        it('points every chained statement back at its predecessor', () => {
            const towers = importProject(payloadOf(statementTreeWithNesting));

            let checked = 0;
            for (const tower of Object.values(towers)) {
                for (const node of listNodes(tower.root)) {
                    if (node.kind !== 'statement' || !node.next) continue;
                    expect(node.next.kind).toBe('statement');
                    expect((node.next as Extract<TowerNode, { kind: 'statement' }>).prev).toBe(
                        node,
                    );
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        it("leaves a cavity's first brick without a predecessor", () => {
            const towers = importProject(payloadOf(statementTreeWithNesting));

            let checked = 0;
            for (const tower of Object.values(towers)) {
                for (const node of listNodes(tower.root)) {
                    if (node.kind !== 'statement' || !node.nestedNext) continue;
                    // The cavity's head starts a sequence of its own, so it has no `prev` — the
                    // owner is reachable only by searching, as the disconnect logic does.
                    expect(
                        (node.nestedNext as Extract<TowerNode, { kind: 'statement' }>).prev,
                    ).toBeNull();
                    checked++;
                }
            }
            expect(checked).toBeGreaterThan(0);
        });

        it('leaves a root free of any incoming pointer', () => {
            const towers = importProject(payloadOf(statementTreeWithNesting));

            const root = Object.values(towers)[0].root;
            expect(root.kind).toBe('statement');
            expect((root as Extract<TowerNode, { kind: 'statement' }>).prev).toBeNull();
        });
    });

    describe('model reconstruction', () => {
        it('restores the nesting cavity as empty-but-present, ready for the layout to measure', () => {
            const towers = importProject(
                payloadOf(makeEmptyStatement('hollow', 0, true)),
                'preserve',
            );

            const root = Object.values(towers)[0].root as Extract<TowerNode, { kind: 'statement' }>;
            expect(root.model.hasNesting).toBe(true);
            expect(root.nestedNext).toBeNull();
            expect(root.model.nestingDims).toBeNull();
        });

        it('gives a brick with no cavity no cavity pointer at all', () => {
            const towers = importProject(payloadOf(makeEmptyStatement('flat', 0)), 'preserve');

            const root = Object.values(towers)[0].root as Extract<TowerNode, { kind: 'statement' }>;
            expect(root.model.hasNesting).toBe(false);
            expect(root.nestedNext).toBeUndefined();
        });

        it('sizes the argument slots from the param labels, all of them empty', () => {
            const towers = importProject(payloadOf(makeEmptyStatement('host', 3)), 'preserve');

            const root = Object.values(towers)[0].root as Extract<TowerNode, { kind: 'statement' }>;
            expect(root.args).toEqual([null, null, null]);
            expect(root.model.argDims).toEqual([null, null, null]);
        });

        it('restores the connection capabilities that drive the notches', () => {
            const towers = importProject(payloadOf(statementTreeWithNesting), 'preserve');

            const nodes = listNodes(Object.values(towers)[0].root);
            const hat = nodes.find((n) => n.model.id === 'Statement 1');
            const last = nodes.find((n) => n.model.id === 'Statement 5');
            expect((hat as Extract<TowerNode, { kind: 'statement' }>).model.hasConnectionPrev).toBe(
                false,
            );
            expect(
                (last as Extract<TowerNode, { kind: 'statement' }>).model.hasConnectionNext,
            ).toBe(false);
        });

        it('rebuilds towers at their exported positions', () => {
            const towers = importProject(
                payloadOf(statementTreeWithNesting, makeEmptyStatement('lone', 0)),
            );

            const positions = Object.values(towers).map((t) => t.position);
            expect(positions).toEqual([
                { x: 0, y: 0 },
                { x: 100, y: 200 },
            ]);
        });
    });

    describe('rejection', () => {
        // Each case breaks exactly one rule in an otherwise valid payload. Every one must reject
        // the whole import: a half-loaded project is worse than a refused one.
        const cases: {
            rule: string;
            breakIt: (project: ExportedProject) => void;
            match: RegExp;
        }[] = [
            {
                rule: 'an unsupported schema version',
                breakIt: (p) => Object.assign(p, { version: 99 }),
                match: /unsupported schema version/,
            },
            {
                rule: 'a missing nodes dictionary',
                breakIt: (p) => Reflect.deleteProperty(p, 'nodes'),
                match: /no nodes object/,
            },
            {
                rule: 'a missing towers array',
                breakIt: (p) => Reflect.deleteProperty(p, 'towers'),
                match: /no towers array/,
            },
            {
                rule: 'a node keyed under an id it does not carry',
                breakIt: (p) => Object.assign(p.nodes['Statement 1'], { id: 'elsewhere' }),
                match: /but carries id/,
            },
            {
                rule: 'an unknown brick kind',
                breakIt: (p) => Object.assign(p.nodes['Statement 1'], { kind: 'nonsense' }),
                match: /has kind "nonsense"/,
            },
            {
                rule: 'a missing modelConfig',
                breakIt: (p) => Reflect.deleteProperty(p.nodes['Statement 1'], 'modelConfig'),
                match: /has no modelConfig/,
            },
            {
                rule: 'a missing colour channel',
                breakIt: (p) =>
                    Reflect.deleteProperty(
                        p.nodes['Statement 1'].modelConfig.colorsDefault,
                        'border',
                    ),
                match: /missing colorsDefault\.border/,
            },
            {
                rule: 'an out-of-range scale level',
                breakIt: (p) =>
                    Object.assign(p.nodes['Statement 1'].modelConfig, { scaleLevel: 7 }),
                match: /has scaleLevel 7/,
            },
            {
                rule: 'a missing widget',
                breakIt: (p) =>
                    Reflect.deleteProperty(p.nodes['Statement 1'].modelConfig, 'widget'),
                match: /has no widget/,
            },
            {
                rule: 'an expression with no params',
                breakIt: (p) => {
                    Object.assign(p.nodes['Statement 2.Add 5'].modelConfig, { params: [] });
                    Object.assign(p.nodes['Statement 2.Add 5'], { args: [] });
                },
                match: /expression with no params/,
            },
            {
                rule: 'more arg slots than params',
                breakIt: (p) =>
                    Object.assign(p.nodes['Statement 2.Add 5'], { args: [null, null, null] }),
                match: /arg slot\(s\) for 2 param\(s\)/,
            },
            {
                rule: 'a missing statement flag',
                breakIt: (p) =>
                    Reflect.deleteProperty(p.nodes['Statement 1'].modelConfig, 'hasConnectionNext'),
                match: /has no hasConnectionNext/,
            },
            {
                rule: 'a cavity pointer on a brick with no cavity',
                breakIt: (p) => Object.assign(p.nodes['Statement 1'], { nestedNext: null }),
                match: /no nesting cavity but carries nestedNext/,
            },
            {
                rule: 'a missing cavity pointer on a brick with a cavity',
                breakIt: (p) =>
                    Reflect.deleteProperty(p.nodes['Nesting Statement 1'], 'nestedNext'),
                match: /nesting cavity but no nestedNext/,
            },
            {
                rule: 'a pointer at a node that is not there',
                breakIt: (p) => Object.assign(p.nodes['Statement 1'], { next: 'ghost' }),
                match: /points at missing node "ghost"/,
            },
            {
                rule: 'a statement in an argument slot',
                breakIt: (p) => Object.assign(p.nodes['Statement 2'], { args: ['Statement 3'] }),
                match: /statement brick in args\[0\], which only holds values/,
            },
            {
                rule: 'a value brick in a sequence slot',
                breakIt: (p) => Object.assign(p.nodes['Statement 5'], { next: 'Statement 5.113' }),
                match: /value brick in next, which only holds statements/,
            },
            {
                rule: 'a brick claimed by two parents',
                // `Statement 4` is already the cavity owner's next; a second referrer makes it
                // two bricks' child. Kind-legal, so it is the parent count that has to catch it.
                breakIt: (p) => Object.assign(p.nodes['Statement 5'], { next: 'Statement 4' }),
                match: /is referenced 2 times; a brick has one parent/,
            },
            {
                rule: 'a root that is also a child',
                breakIt: (p) => Object.assign(p.towers[0], { rootNodeId: 'Statement 2' }),
                match: /which is also a child/,
            },
            {
                rule: 'two towers sharing one graph',
                breakIt: (p) =>
                    p.towers.push({
                        id: 'second',
                        position: { x: 0, y: 0 },
                        rootNodeId: 'Statement 1',
                    }),
                match: /belongs to more than one tower/,
            },
            {
                rule: 'a node no root can reach',
                breakIt: (p) => {
                    // `Statement 1` has no args and no cavity, so the clone dangles nothing.
                    const stray = JSON.parse(JSON.stringify(p.nodes['Statement 1']));
                    Object.assign(stray, { id: 'stray', next: null });
                    Object.assign(p.nodes, { stray });
                },
                match: /not reachable from any tower root/,
            },
            {
                rule: 'a cycle',
                breakIt: (p) => {
                    Object.assign(p.nodes['Statement 5'], { next: 'Statement 1' });
                    Object.assign(p.towers[0], { rootNodeId: 'Statement 2' });
                },
                match: /referenced 2 times|also a child|not reachable/,
            },
            {
                rule: 'two towers with the same id',
                breakIt: (p) => p.towers.push({ ...p.towers[0] }),
                match: /two towers share the id/,
            },
            {
                rule: 'a tower with no position',
                breakIt: (p) => Reflect.deleteProperty(p.towers[0], 'position'),
                match: /has no position/,
            },
            {
                rule: 'a tower rooted at a node that is not there',
                breakIt: (p) => Object.assign(p.towers[0], { rootNodeId: 'ghost' }),
                match: /rooted at missing node "ghost"/,
            },
        ];

        for (const { rule, breakIt, match } of cases) {
            it(`rejects ${rule}`, () => {
                const payload = payloadOf(statementTreeWithNesting);
                breakIt(payload);

                expect(() => importProject(payload)).toThrow(match);
            });
        }

        it('rejects a payload that is not an object at all', () => {
            expect(() => importProject(null)).toThrow(/payload is not an object/);
            expect(() => importProject([])).toThrow(/payload is not an object/);
            expect(() => importProject('{}')).toThrow(/payload is not an object/);
        });

        it('accepts the untouched payload, so each rejection is down to its own breakage', () => {
            expect(() => importProject(payloadOf(statementTreeWithNesting))).not.toThrow();
        });
    });
});
