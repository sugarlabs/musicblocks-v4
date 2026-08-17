import type { BrickViewProps, ParamArgPair } from '@/@types/brick.types';
import type {
    ExportedNode,
    ExportedProject,
    ExportedTower,
    ImportIdMap,
    ImportIdStrategy,
} from '@/@types/import-export.types';
import type { TowerNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';

import { createBrickModel, wrapAsRootNode } from '@/utils/brick-model-factory';
import { listNodes } from '@/utils/tower-traversal';

/** Schema version stamped on every payload `exportWorkspace` produces. */
export const EXPORT_SCHEMA_VERSION = 1;

// ─────────────────────────────────────────────────────────────────────────────

/** The brick id a slot points at, or null when the slot is empty. */
function pointerId(node: TowerNode | null | undefined): string | null {
    return node ? node.model.id : null;
}

/**
 * Serialises a single node, replacing each of its downward references with the referenced brick's
 * id. Widgets are cloned rather than handed over by reference — an input widget's `value` is
 * mutated in place as the user types, so sharing it would let the workspace edit an export that
 * has already been handed to the caller.
 */
function exportNode(node: TowerNode): ExportedNode {
    const config = {
        colorsDefault: { ...node.model.colorsDefault },
        tooltipText: node.model.tooltipText,
        scaleLevel: node.model.scaleLevel,
    };

    switch (node.kind) {
        case 'value':
            return {
                kind: 'value',
                id: node.model.id,
                modelConfig: { ...config, widget: structuredClone(node.model.widget) },
            };
        case 'expression':
            return {
                kind: 'expression',
                id: node.model.id,
                modelConfig: {
                    ...config,
                    widget: structuredClone(node.model.widget),
                    params: [...node.model.params],
                },
                args: node.args.map(pointerId),
            };
        case 'statement':
            return {
                kind: 'statement',
                id: node.model.id,
                modelConfig: {
                    ...config,
                    widget: structuredClone(node.model.widget),
                    params: [...node.model.params],
                    hasNesting: node.model.hasNesting,
                    isNestingFolded: node.model.isNestingFolded,
                    hasConnectionPrev: node.model.hasConnectionPrev,
                    hasConnectionNext: node.model.hasConnectionNext,
                },
                args: node.args.map(pointerId),
                next: pointerId(node.next),
                // A brick without a cavity carries no nested pointer at all, not a null one.
                ...(node.model.hasNesting ? { nestedNext: pointerId(node.nestedNext) } : {}),
            };
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialises every tower in the workspace into a flat, JSON-serializable project.
 *
 * Only the downward pointers (`args`, `next`, `nestedNext`) are written out; `parent` and `prev`
 * are what make the live graph cyclic, and the importer restores them from the pointers that are
 * kept. Derived state is left out entirely — the collision spaces and every measured dimension are
 * rebuilt by the layout once the imported bricks mount.
 *
 * @param towers The live towers record from the workspace store.
 * @returns An `ExportedProject` safe to hand to `JSON.stringify`.
 */
export function exportWorkspace(towers: Record<string, TowerState>): ExportedProject {
    const exportedTowers: ExportedTower[] = [];
    const nodes: Record<string, ExportedNode> = {};

    for (const tower of Object.values(towers)) {
        exportedTowers.push({
            id: tower.id,
            position: { ...tower.position },
            rootNodeId: tower.root.model.id,
        });

        for (const node of listNodes(tower.root)) {
            // Brick ids are unique across the whole workspace — `useBrickLayoutStore` already keys
            // its per-brick state by them — so a clash means the graph is corrupt. Flattening into
            // one dictionary regardless would silently drop whichever subtree lost the race, so
            // fail here rather than write a project file that is quietly missing bricks.
            if (node.model.id in nodes) {
                throw new Error(`exportWorkspace: duplicate brick id "${node.model.id}"`);
            }
            nodes[node.model.id] = exportNode(node);
        }
    }

    return {
        version: EXPORT_SCHEMA_VERSION,
        towers: exportedTowers,
        nodes,
    };
}

// ── Import: validation ───────────────────────────────────────────────────────
//
// A payload arrives as parsed JSON from outside the app, so nothing about its shape can be assumed.
// Validation is strict and all-or-nothing: the first breach throws, and because nothing here or in
// the reconstruction below touches a store, a rejected payload leaves the workspace untouched.
//
// ─────────────────────────────────────────────────────────────────────────────

/** Rejects the payload. Every validation breach funnels through here for one consistent prefix. */
function reject(reason: string): never {
    throw new Error(`importWorkspace: ${reason}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Asserts a slot holds an array of brick ids — `string` for a filled slot, `null` for an empty. */
function assertPointerArray(value: unknown, where: string): (string | null)[] {
    if (!Array.isArray(value)) reject(`${where} is not an array`);
    for (const entry of value) {
        if (entry !== null && typeof entry !== 'string') {
            reject(`${where} holds ${JSON.stringify(entry)}, expected a brick id or null`);
        }
    }
    return value as (string | null)[];
}

/** Asserts the config every brick kind shares. Widget contents beyond `type` are not inspected. */
function assertBaseConfig(config: Record<string, unknown>, where: string): void {
    const colors = config.colorsDefault;
    if (!isRecord(colors)) reject(`${where} has no colorsDefault`);
    for (const channel of ['background', 'foreground', 'border']) {
        if (typeof colors[channel] !== 'string') {
            reject(`${where} is missing colorsDefault.${channel}`);
        }
    }
    if (typeof config.tooltipText !== 'string') reject(`${where} has no tooltipText`);
    if (config.scaleLevel !== 1 && config.scaleLevel !== 2 && config.scaleLevel !== 3) {
        reject(`${where} has scaleLevel ${JSON.stringify(config.scaleLevel)}, expected 1, 2 or 3`);
    }
    if (!isRecord(config.widget) || typeof config.widget.type !== 'string') {
        reject(`${where} has no widget`);
    }
}

/** Asserts the param labels a brick declares, returning them for the arg-count check. */
function assertParams(config: Record<string, unknown>, where: string): (string | null)[] {
    const params = config.params;
    if (!Array.isArray(params)) reject(`${where} has no params array`);
    for (const param of params) {
        if (param !== null && typeof param !== 'string') {
            reject(`${where} has a param that is neither a label nor null`);
        }
    }
    return params as (string | null)[];
}

/** Shape-checks one node in isolation; cross-node pointer checks come later. */
function assertNode(id: string, value: unknown): ExportedNode {
    const where = `node "${id}"`;

    if (!isRecord(value)) reject(`${where} is not an object`);
    if (value.id !== id) {
        reject(`${where} is keyed as "${id}" but carries id ${JSON.stringify(value.id)}`);
    }

    const config = value.modelConfig;
    if (!isRecord(config)) reject(`${where} has no modelConfig`);
    assertBaseConfig(config, `${where} modelConfig`);

    switch (value.kind) {
        case 'value':
            break;

        case 'expression': {
            const params = assertParams(config, `${where} modelConfig`);
            // The model's params are a non-empty tuple; parsed JSON carries no such guarantee.
            if (params.length === 0) reject(`${where} is an expression with no params`);
            const args = assertPointerArray(value.args, `${where} args`);
            if (args.length !== params.length) {
                reject(
                    `${where} has ${args.length} arg slot(s) for ${params.length} param(s); the ` +
                        `layout indexes them in lockstep`,
                );
            }
            break;
        }

        case 'statement': {
            const params = assertParams(config, `${where} modelConfig`);
            const args = assertPointerArray(value.args, `${where} args`);
            if (args.length !== params.length) {
                reject(
                    `${where} has ${args.length} arg slot(s) for ${params.length} param(s); the ` +
                        `layout indexes them in lockstep`,
                );
            }
            for (const flag of [
                'hasNesting',
                'isNestingFolded',
                'hasConnectionPrev',
                'hasConnectionNext',
            ]) {
                if (typeof config[flag] !== 'boolean')
                    reject(`${where} modelConfig has no ${flag}`);
            }
            if (value.next !== null && typeof value.next !== 'string') {
                reject(
                    `${where} has next ${JSON.stringify(value.next)}, expected a brick id or null`,
                );
            }
            // The cavity pointer exists exactly when the cavity does, mirroring `TowerStatementNode`.
            const hasNestedNext = 'nestedNext' in value;
            if (config.hasNesting && !hasNestedNext) {
                reject(`${where} has a nesting cavity but no nestedNext`);
            }
            if (!config.hasNesting && hasNestedNext) {
                reject(`${where} has no nesting cavity but carries nestedNext`);
            }
            if (
                hasNestedNext &&
                value.nestedNext !== null &&
                typeof value.nestedNext !== 'string'
            ) {
                reject(`${where} has a nestedNext that is neither a brick id nor null`);
            }
            break;
        }

        default:
            reject(`${where} has kind ${JSON.stringify(value.kind)}`);
    }

    return value as unknown as ExportedNode;
}

/** Every downward pointer a node holds, with the brick kind that slot is allowed to hold. */
function pointersOf(
    node: ExportedNode,
): { id: string; slot: string; wants: 'argument' | 'statement' }[] {
    const pointers: { id: string; slot: string; wants: 'argument' | 'statement' }[] = [];

    if (node.kind === 'expression' || node.kind === 'statement') {
        node.args.forEach((id, index) => {
            if (id !== null) pointers.push({ id, slot: `args[${index}]`, wants: 'argument' });
        });
    }
    if (node.kind === 'statement') {
        if (node.next !== null) pointers.push({ id: node.next, slot: 'next', wants: 'statement' });
        if (node.nestedNext != null) {
            pointers.push({ id: node.nestedNext, slot: 'nestedNext', wants: 'statement' });
        }
    }

    return pointers;
}

/**
 * Checks that the nodes form a forest of trees rooted exactly at the tower roots.
 *
 * Three conditions together imply it, and each maps to a way a payload can be malformed: no node
 * may be referenced twice (one brick, one parent), a root may not be referenced at all (it is
 * nobody's child), and walking from every root must reach every node (no orphans, and no cycle
 * floating free of the roots — a cycle's members all have a referrer, so they are unreachable).
 */
function assertForest(towers: ExportedTower[], nodes: Record<string, ExportedNode>): void {
    const referrers = new Map<string, number>();

    for (const node of Object.values(nodes)) {
        for (const pointer of pointersOf(node)) {
            const target = nodes[pointer.id];
            if (!target) {
                reject(
                    `node "${node.id}" points at missing node "${pointer.id}" via ${pointer.slot}`,
                );
            }
            if (pointer.wants === 'statement' && target.kind !== 'statement') {
                reject(
                    `node "${node.id}" has a ${target.kind} brick in ${pointer.slot}, which only ` +
                        `holds statements`,
                );
            }
            if (pointer.wants === 'argument' && target.kind === 'statement') {
                reject(
                    `node "${node.id}" has a statement brick in ${pointer.slot}, which only holds ` +
                        `values and expressions`,
                );
            }
            referrers.set(pointer.id, (referrers.get(pointer.id) ?? 0) + 1);
        }
    }

    for (const [id, count] of referrers) {
        if (count > 1) reject(`node "${id}" is referenced ${count} times; a brick has one parent`);
    }

    for (const tower of towers) {
        if ((referrers.get(tower.rootNodeId) ?? 0) > 0) {
            reject(`tower "${tower.id}" is rooted at "${tower.rootNodeId}", which is also a child`);
        }
    }

    const visited = new Set<string>();
    for (const tower of towers) {
        const stack = [tower.rootNodeId];
        while (stack.length > 0) {
            const id = stack.pop()!;
            if (visited.has(id)) {
                reject(`node "${id}" belongs to more than one tower`);
            }
            visited.add(id);
            for (const pointer of pointersOf(nodes[id])) stack.push(pointer.id);
        }
    }

    const orphans = Object.keys(nodes).filter((id) => !visited.has(id));
    if (orphans.length > 0) {
        reject(
            `${orphans.length} node(s) are not reachable from any tower root, starting with ` +
                `"${orphans[0]}"`,
        );
    }
}

/**
 * Validates an untrusted payload, returning it typed once every rule holds.
 *
 * Throws on the first breach and touches no store, so a caller can validate before it commits to
 * replacing anything.
 */
export function validateProject(payload: unknown): ExportedProject {
    if (!isRecord(payload)) reject('payload is not an object');

    if (payload.version !== EXPORT_SCHEMA_VERSION) {
        reject(
            `unsupported schema version ${JSON.stringify(payload.version)}, expected ` +
                `${EXPORT_SCHEMA_VERSION}`,
        );
    }

    if (!isRecord(payload.nodes)) reject('payload has no nodes object');
    const nodes: Record<string, ExportedNode> = {};
    for (const [id, value] of Object.entries(payload.nodes)) {
        nodes[id] = assertNode(id, value);
    }

    if (!Array.isArray(payload.towers)) reject('payload has no towers array');
    const towers: ExportedTower[] = [];
    const seenTowerIds = new Set<string>();
    for (const [index, value] of payload.towers.entries()) {
        const where = `tower at index ${index}`;
        if (!isRecord(value)) reject(`${where} is not an object`);
        if (typeof value.id !== 'string') reject(`${where} has no id`);
        if (seenTowerIds.has(value.id)) reject(`two towers share the id "${value.id}"`);
        seenTowerIds.add(value.id);

        if (!isRecord(value.position)) reject(`tower "${value.id}" has no position`);
        if (typeof value.position.x !== 'number' || typeof value.position.y !== 'number') {
            reject(`tower "${value.id}" has a position that is not a pair of numbers`);
        }
        if (typeof value.rootNodeId !== 'string') reject(`tower "${value.id}" has no rootNodeId`);
        if (!(value.rootNodeId in nodes)) {
            reject(`tower "${value.id}" is rooted at missing node "${value.rootNodeId}"`);
        }

        towers.push({
            id: value.id,
            position: { x: value.position.x, y: value.position.y },
            rootNodeId: value.rootNodeId,
        });
    }

    assertForest(towers, nodes);

    return { version: EXPORT_SCHEMA_VERSION, towers, nodes };
}

// ── Import: id resolution ────────────────────────────────────────────────────

/**
 * Maps every id in the payload to the id its rebuilt counterpart will carry.
 *
 * Runs ahead of reconstruction because a brick model's id is fixed at construction and readonly
 * afterwards. Keeping it a separate stage is what lets a future merge mode reuse the reconstruction
 * below untouched: merging is a different map, not a different rebuild.
 */
export function resolveIds(project: ExportedProject, strategy: ImportIdStrategy): ImportIdMap {
    const keep = strategy === 'preserve';

    return {
        nodes: new Map(
            Object.keys(project.nodes).map((id) => [id, keep ? id : crypto.randomUUID()]),
        ),
        towers: new Map(
            project.towers.map((tower) => [
                tower.id,
                keep ? tower.id : `tower-${crypto.randomUUID()}`,
            ]),
        ),
    };
}

// ── Import: graph reconstruction ─────────────────────────────────────────────

/** Maps an exported node back to the flat render config `createBrickModel` builds models from. */
function toViewProps(node: ExportedNode): BrickViewProps {
    const config = node.modelConfig;
    const base = {
        colorsDefault: { ...config.colorsDefault },
        tooltipText: config.tooltipText,
        scaleLevel: config.scaleLevel,
    };

    switch (node.kind) {
        case 'value':
            return { ...base, kind: 'value', widget: structuredClone(node.modelConfig.widget) };
        case 'expression':
            return {
                ...base,
                kind: 'expression',
                widget: structuredClone(node.modelConfig.widget),
                // Validation has established there is at least one, which the tuple type demands.
                paramArgs: node.modelConfig.params.map(toParamArg) as [
                    ParamArgPair,
                    ...ParamArgPair[],
                ],
            };
        case 'statement':
            return {
                ...base,
                kind: 'statement',
                widget: structuredClone(node.modelConfig.widget),
                paramArgs: node.modelConfig.params.map(toParamArg),
                // Dimensions are measured, never stored; the cavity's presence is what round-trips.
                nesting: node.modelConfig.hasNesting
                    ? { dims: null, isFolded: node.modelConfig.isNestingFolded }
                    : undefined,
                hasConnectionPrev: node.modelConfig.hasConnectionPrev,
                hasConnectionNext: node.modelConfig.hasConnectionNext,
            };
    }
}

/** An empty argument slot carrying its param label; sizes are measured once the brick mounts. */
function toParamArg(param: string | null): ParamArgPair {
    return { param: param ?? undefined, argDims: null };
}

/**
 * Rebuilds the live tower graphs a validated payload describes.
 *
 * Two passes, because the graph is cyclic: every node is created before any pointer is wired, so a
 * pointer always has something to reference. The payload holds only downward pointers, and the
 * upward ones are derived as each link is made — including the cavity's asymmetry, where the first
 * brick inside a cavity is the head of its own sequence and so has no `prev`.
 *
 * Nodes are keyed here by their payload ids, while the models they carry hold the resolved ids.
 */
export function reconstructTowers(
    project: ExportedProject,
    idMap: ImportIdMap,
): Record<string, TowerState> {
    const shells = new Map<string, TowerNode>();
    for (const node of Object.values(project.nodes)) {
        const model = createBrickModel(toViewProps(node), idMap.nodes.get(node.id));
        shells.set(node.id, wrapAsRootNode(model));
    }

    for (const node of Object.values(project.nodes)) {
        const self = shells.get(node.id)!;

        if (node.kind === 'expression' || node.kind === 'statement') {
            const parent = self as Extract<TowerNode, { kind: 'expression' | 'statement' }>;
            node.args.forEach((childId, index) => {
                if (childId === null) return;
                // Validation has established every arg holds a value or expression, both of which
                // carry the parent pointer this writes.
                const child = shells.get(childId) as Extract<
                    TowerNode,
                    { kind: 'value' | 'expression' }
                >;
                parent.args[index] = child;
                child.parent = parent;
            });
        }

        if (node.kind === 'statement') {
            const statement = self as Extract<TowerNode, { kind: 'statement' }>;

            if (node.next !== null) {
                const next = shells.get(node.next) as Extract<TowerNode, { kind: 'statement' }>;
                statement.next = next;
                next.prev = statement;
            }

            if (node.nestedNext != null) {
                const nested = shells.get(node.nestedNext) as Extract<
                    TowerNode,
                    { kind: 'statement' }
                >;
                statement.nestedNext = nested;
                // A cavity's first brick starts a sequence of its own, so it has no predecessor;
                // the cavity's owner is reachable only by searching, as `detachBrickToNewTower` does.
                nested.prev = null;
            }
        }
    }

    const towers: Record<string, TowerState> = {};
    for (const tower of project.towers) {
        const id = idMap.towers.get(tower.id)!;
        towers[id] = {
            id,
            position: { ...tower.position },
            root: shells.get(tower.rootNodeId)!,
        };
    }

    return towers;
}

/**
 * Turns an untrusted payload into workspace-ready towers: validate, resolve ids, rebuild.
 *
 * Pure — it reads no store and writes none, so every way an import can fail happens here, before
 * the caller has given anything up. Installing the result is a separate step.
 *
 * @param payload Parsed JSON, of no assumed shape.
 * @param strategy How to resolve the payload's ids; see {@link ImportIdStrategy}.
 * @returns The rebuilt towers, keyed by their resolved ids.
 */
export function importProject(
    payload: unknown,
    strategy: ImportIdStrategy = 'remint',
): Record<string, TowerState> {
    const project = validateProject(payload);
    return reconstructTowers(project, resolveIds(project, strategy));
}
