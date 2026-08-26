import type { Point } from '@/@types/common.types';
import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { StatementConnectorMeta, TowerState } from '@/@types/workspace.types';
import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';

import { QuadtreeCollisionSpace } from './collision';
import { extractStatementConnectors } from './statement-collision';
import { traverseTopDown } from './tower-traversal';
import {
    joinStatement,
    resolveStatementConnection,
    type StatementSocket,
} from './statement-connect';

/** The notch kinds a statement brick can expose, as keyed by `getConnectorCoords`. */
type NotchKind = 'prev' | StatementSocket;

/**
 * Builds a workspace the way the store does: every tower placed at its own position, with all of
 * their connector points seeded into one shared collision space.
 */
function workspace(towers: { id: string; root: TowerNode; position: Point }[]) {
    const space = new QuadtreeCollisionSpace(4000, 4000);
    const connectors: Record<number, StatementConnectorMeta> = {};
    const record: Record<string, TowerState> = {};

    for (const tower of towers) {
        tower.root.model.setPosition(tower.position.x, tower.position.y);
        record[tower.id] = tower;

        const results = extractStatementConnectors(tower.id, tower.root);
        space.createObjects(results.map((result) => result.object));
        for (const result of results) connectors[result.meta.id] = result.meta;
    }

    return { space, connectors, towers: record };
}

/** World centre of one of a brick's sequence notches, once the brick is positioned. */
function notchCenter(node: TowerNode, kind: NotchKind): Point {
    const bounds = node.model.getConnectorCoords()[kind]!;
    return { x: node.model.position.x + bounds.x, y: node.model.position.y + bounds.y };
}

/** The tower position that puts `root`'s notch exactly on `point`. */
function positionNotchAt(root: TowerNode, kind: NotchKind, point: Point): Point {
    const bounds = root.model.getConnectorCoords()[kind]!;
    return { x: point.x - bounds.x, y: point.y - bounds.y };
}

describe('resolveStatementConnection', () => {
    describe('dragging a statement under another', () => {
        it('hangs the dragged tower off the tab it was dropped on', () => {
            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', notchCenter(host, 'next')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: host,
                child: dragged,
                socket: 'next',
                // The tower that stays rooted survives.
                hostTowerId: 'host-tower',
                absorbedTowerId: 'dragged-tower',
            });
        });

        it('snaps when the drop is merely near the notch, not exactly on it', () => {
            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0);
            const centre = notchCenter(host, 'next');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', {
                        x: centre.x + 11,
                        y: centre.y - 7,
                    }),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.socket).toBe('next');
            expect(result?.parent).toBe(host);
        });

        it('nests into an empty cavity through the nestedNext tab', () => {
            const clamp = makeEmptyStatement('clamp', 0, true);
            clamp.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', notchCenter(clamp, 'nestedNext')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: clamp,
                child: dragged,
                socket: 'nestedNext',
                hostTowerId: 'clamp-tower',
                absorbedTowerId: 'dragged-tower',
            });
        });

        it('skips a tab that already has a brick on it', () => {
            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', notchCenter(host, 'next')),
                },
            ]);

            // Linked after the space was seeded, so only the live graph knows the tab is taken.
            host.next = makeEmptyStatement('sitting-tenant', 0);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('never hangs off a tab the dragged tower already owns', () => {
            // A lone statement's own prev groove sits within snap distance of its own next tab, so
            // this only stays null because same-tower hits are rejected.
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'dragged-tower', root: dragged, position: { x: 500, y: 500 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });
    });

    describe('dragging a statement over another', () => {
        it('picks up the settled tower the dragged tab was dropped on', () => {
            const settled = makeEmptyStatement('settled', 0);
            settled.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'next', notchCenter(settled, 'prev')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: dragged,
                child: settled,
                socket: 'next',
                // The tower that stays rooted survives, which this time is the dragged one.
                hostTowerId: 'dragged-tower',
                absorbedTowerId: 'settled-tower',
            });
        });

        it('pulls the settled tower into the dragged tower’s empty cavity', () => {
            const settled = makeEmptyStatement('settled', 0);
            settled.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 0, true);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'nestedNext', notchCenter(settled, 'prev')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(dragged);
            expect(result?.child).toBe(settled);
            expect(result?.socket).toBe('nestedNext');
        });

        it('refuses a brick that already has a statement above it', () => {
            // `tenant` is not its tower's root, so its prev groove is already spoken for. It sits
            // well away from `owner` so that only its own notches are near the probe.
            const owner = makeEmptyStatement('owner', 0);
            const tenant = makeEmptyStatement('tenant', 0);
            owner.next = tenant;
            tenant.prev = owner;
            owner.model.setPosition(500, 500);
            tenant.model.setPosition(1200, 900);

            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'owner-tower', root: owner, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'next', notchCenter(tenant, 'prev')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('offers a tab from anywhere in the dragged tower, not just its root', () => {
            const settled = makeEmptyStatement('settled', 0);
            settled.model.setPosition(500, 500);

            // A dragged tower two deep: the root's next tab is taken, its child's is free.
            const root = makeEmptyStatement('root', 0);
            const inner = makeEmptyStatement('inner', 0);
            root.next = inner;
            inner.prev = root;

            const target = notchCenter(settled, 'prev');

            // The inner brick sits at this fixed offset within the dragged tower, as its layout
            // would place it. Position the tower so the inner brick's tab lands on the groove.
            const INNER_OFFSET = { x: 0, y: 44 };
            const tab = inner.model.getConnectorCoords().next!;
            const draggedPosition = {
                x: target.x - INNER_OFFSET.x - tab.x,
                y: target.y - INNER_OFFSET.y - tab.y,
            };
            inner.model.setPosition(
                draggedPosition.x + INNER_OFFSET.x,
                draggedPosition.y + INNER_OFFSET.y,
            );

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root, position: draggedPosition },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(inner);
            expect(result?.child).toBe(settled);
            expect(result?.socket).toBe('next');
        });
    });

    describe('either direction', () => {
        it('returns null when nothing is within snap distance', () => {
            const host = makeEmptyStatement('host', 0);
            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root: dragged, position: { x: 2000, y: 2000 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('returns null when the dragged tower is no longer in the workspace', () => {
            const host = makeEmptyStatement('host', 0);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'gone',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('returns null for a dragged argument brick, which owns no sequence notches', () => {
            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root: dragged, position: notchCenter(host, 'next') },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('prefers the closer pairing when the dragged tower could join either way', () => {
            // The dragged statement has a groove above and a tab below. A settled brick sits right
            // on its tab, while a host's tab is far from its groove, so the pick-up must win.
            const settled = makeEmptyStatement('settled', 0);
            settled.model.setPosition(500, 500);
            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(1500, 1500);

            const dragged = makeEmptyStatement('dragged', 0);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                { id: 'host-tower', root: host, position: { x: 1500, y: 1500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'next', notchCenter(settled, 'prev')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(dragged);
            expect(result?.child).toBe(settled);
            expect(result?.hostTowerId).toBe('dragged-tower');
        });
    });

    describe('with a folded cavity', () => {
        /**
         * A clamp whose cavity holds `contents`, laid out at `position` the way the tower layout
         * pass would: the chain measured into the clamp's `nestingDims`, every outline generated
         * off that, and the whole tree positioned from the origin down.
         *
         * The fold comes afterwards, as the user's does — so what the cavity holds keeps the
         * positions the open cavity gave it, which is exactly what a stale hit would snap onto.
         */
        function layOutClamp(position: Point, contents: TowerStatementNode[]) {
            const clamp = makeEmptyStatement('clamp', 0, true);

            contents.forEach((node, index) => {
                node.prev = contents[index - 1] ?? clamp;
                node.next = contents[index + 1] ?? null;
            });
            clamp.nestedNext = contents[0] ?? null;

            for (const node of [...contents].reverse()) node.model.computeOutline();
            clamp.model.nestingDims = contents.length
                ? {
                      w: Math.max(...contents.map((node) => node.model.dims.w)),
                      h: contents.reduce((total, node) => total + node.model.dims.h, 0),
                  }
                : null;
            clamp.model.computeOutline();

            traverseTopDown(clamp, position);

            return clamp;
        }

        it('refuses a drop into the cavity of a settled folded brick, taking it below instead', () => {
            const clamp = layOutClamp({ x: 500, y: 500 }, []);
            const cavity = notchCenter(clamp, 'nestedNext');

            clamp.model.isNestingFolded = true;

            const dragged = makeEmptyStatement('dragged', 0);
            const { space, connectors, towers } = workspace([
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', cavity),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            // The cavity is shut, so the drop lands on the tab that is on screen — under the
            // folded brick, where the user can still see what they dropped.
            expect(result?.parent).toBe(clamp);
            expect(result?.socket).toBe('next');
        });

        it('nests into that same cavity once the fold is lifted', () => {
            const clamp = layOutClamp({ x: 500, y: 500 }, []);
            const cavity = notchCenter(clamp, 'nestedNext');

            clamp.model.isNestingFolded = true;
            clamp.model.isNestingFolded = false;

            const dragged = makeEmptyStatement('dragged', 0);
            const { space, connectors, towers } = workspace([
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', cavity),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(clamp);
            expect(result?.socket).toBe('nestedNext');
        });

        it('refuses to pick anything up into the shut cavity of the brick being dragged', () => {
            const clamp = layOutClamp({ x: 500, y: 500 }, []);
            const cavity = notchCenter(clamp, 'nestedNext');

            clamp.model.isNestingFolded = true;

            // The settled brick sits exactly where the shut cavity's roof notch would be.
            const settled = makeEmptyStatement('settled', 0);
            const settledPosition = positionNotchAt(settled, 'prev', cavity);
            settled.model.setPosition(settledPosition.x, settledPosition.y);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: settledPosition },
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'clamp-tower',
                space,
                connectors,
                towers,
            });

            // Picked up below the folded brick rather than swallowed into it.
            expect(result?.child).toBe(settled);
            expect(result?.socket).toBe('next');
        });

        it('offers no tab of a brick the fold hides, however free that tab is', () => {
            const first = makeEmptyStatement('first', 0);
            const last = makeEmptyStatement('last', 0);
            const clamp = layOutClamp({ x: 500, y: 500 }, [first, last]);

            // The tail of the cavity chain: its `next` tab is free, and far enough below the
            // clamp's own for this to be about that tab and no other.
            const hiddenTab = notchCenter(last, 'next');

            clamp.model.isNestingFolded = true;

            const settled = makeEmptyStatement('settled', 0);
            const settledPosition = positionNotchAt(settled, 'prev', hiddenTab);
            settled.model.setPosition(settledPosition.x, settledPosition.y);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: settledPosition },
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'clamp-tower',
                space,
                connectors,
                towers,
            });

            // A hidden brick is drawn nowhere and stands wherever the layout left it before the
            // fold shut; a snap onto it would join two bricks that never met on screen.
            expect(result).toBeNull();
        });

        it('offers that tab again once the fold is lifted', () => {
            const first = makeEmptyStatement('first', 0);
            const last = makeEmptyStatement('last', 0);
            const clamp = layOutClamp({ x: 500, y: 500 }, [first, last]);
            const hiddenTab = notchCenter(last, 'next');

            clamp.model.isNestingFolded = true;
            clamp.model.isNestingFolded = false;

            const settled = makeEmptyStatement('settled', 0);
            const settledPosition = positionNotchAt(settled, 'prev', hiddenTab);
            settled.model.setPosition(settledPosition.x, settledPosition.y);

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: settledPosition },
                { id: 'clamp-tower', root: clamp, position: { x: 500, y: 500 } },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'clamp-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(last);
            expect(result?.child).toBe(settled);
            expect(result?.socket).toBe('next');
        });

        it('hangs a folded tower off a settled tab, carrying its hidden bricks and their folds', () => {
            const inner = makeEmptyStatement('inner', 0, true);
            const deep = makeEmptyStatement('deep', 0);
            inner.nestedNext = deep;
            deep.prev = inner;
            inner.model.isNestingFolded = true;

            const clamp = layOutClamp({ x: 900, y: 900 }, [inner]);
            clamp.model.isNestingFolded = true;

            const host = makeEmptyStatement('host', 0);
            host.model.setPosition(500, 500);
            const draggedPosition = positionNotchAt(clamp, 'prev', notchCenter(host, 'next'));

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                { id: 'clamp-tower', root: clamp, position: draggedPosition },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'clamp-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({ parent: host, child: clamp, socket: 'next' });

            joinStatement(result!);

            // The join edits pointers only, so the whole hidden sub-tree comes across still folded
            // exactly as it was — the fold is a way of looking at the graph, not a cut in it.
            expect(host.next).toBe(clamp);
            expect(clamp.nestedNext).toBe(inner);
            expect(inner.nestedNext).toBe(deep);
            expect(clamp.model.isNestingFolded).toBe(true);
            expect(inner.model.isNestingFolded).toBe(true);
        });
    });

    describe('after a scale change', () => {
        // Everything above runs at the default level, where `brickScale` is 1 and the notch
        // geometry happens to read the same in generator units as in pixels. These two run the
        // same snap at the levels where it does not.
        it.each([1, 3] as const)('still snaps onto a tab at level %i', (level) => {
            const host = makeEmptyStatement('host', 0);
            const dragged = makeEmptyStatement('dragged', 0);
            for (const node of [host, dragged]) node.model.scaleLevel = level;

            host.model.setPosition(500, 500);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', notchCenter(host, 'next')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: host,
                child: dragged,
                socket: 'next',
                hostTowerId: 'host-tower',
                absorbedTowerId: 'dragged-tower',
            });
        });

        it('snaps at a level whose notch boxes it never saw at the default', () => {
            const host = makeEmptyStatement('host', 0);
            const dragged = makeEmptyStatement('dragged', 0);

            // Laid out at the default, then rescaled — the order a real scale change happens in.
            host.model.setPosition(500, 500);
            for (const node of [host, dragged]) node.model.scaleLevel = 3;

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionNotchAt(dragged, 'prev', notchCenter(host, 'next')),
                },
            ]);

            const result = resolveStatementConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.socket).toBe('next');
            // The tab sits at the taller brick's foot, not where level 2 would have put it.
            expect(notchCenter(host, 'next').y).toBeGreaterThan(500 + host.model.dims.h / 2);
        });
    });
});

describe('joinStatement', () => {
    it('links the child below the parent and back-links its prev', () => {
        const parent = makeEmptyStatement('parent', 0);
        const child = makeEmptyStatement('child', 0);

        joinStatement({ parent, child, socket: 'next' });

        expect(parent.next).toBe(child);
        expect(child.prev).toBe(parent);
        expect(parent.nestedNext).toBeUndefined();
    });

    it('links the child into the cavity, leaving the parent’s next chain alone', () => {
        const parent = makeEmptyStatement('parent', 0, true);
        const below = makeEmptyStatement('below', 0);
        parent.next = below;
        below.prev = parent;

        const child = makeEmptyStatement('child', 0);

        joinStatement({ parent, child, socket: 'nestedNext' });

        expect(parent.nestedNext).toBe(child);
        // The cavity head back-points at its clamp, same as a next-linked brick would.
        expect(child.prev).toBe(parent);
        expect(parent.next).toBe(below);
    });

    it('keeps the child’s own chain when it is the head of a sequence', () => {
        const parent = makeEmptyStatement('parent', 0);
        const child = makeEmptyStatement('child', 0);
        const tail: TowerStatementNode = makeEmptyStatement('tail', 0);
        child.next = tail;
        tail.prev = child;

        joinStatement({ parent, child, socket: 'next' });

        expect(parent.next).toBe(child);
        expect(child.next).toBe(tail);
        expect(tail.prev).toBe(child);
    });
});
