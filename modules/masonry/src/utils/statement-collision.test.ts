import { extractStatementConnectors } from './statement-collision';
import { listNodes } from './tower-traversal';
import {
    makeEmptyStatement,
    statementTreeNoNesting,
    statementTreeWithNesting,
} from '@/mocks/tower';

describe('extractStatementConnectors', () => {
    it('emits prev and next connectors for a statement brick without nesting', () => {
        statementTreeNoNesting.model.setPosition(200, 300);

        const results = extractStatementConnectors('t', statementTreeNoNesting);

        const rootId = statementTreeNoNesting.model.id;
        const rootResults = results.filter((r) => r.meta.brickId === rootId);
        expect(rootResults.length).toBeGreaterThanOrEqual(1);

        const types = rootResults.map((r) => r.meta.type);
        if (statementTreeNoNesting.model.hasConnectionPrev) {
            expect(types).toContain('prev');
        }
        if (statementTreeNoNesting.model.hasConnectionNext) {
            expect(types).toContain('next');
        }
        expect(types).not.toContain('nestedNext');
    });

    // #700: Re-pointed at `getConnectorCoords()`, now the extractor's single source of notch
    // geometry. The superseded version below asserted the hard-coded notch constants the extractor
    // used to duplicate (`V_NOTCH_OFFSET_X`, a 16x16 footprint) and derived the `next` offset from
    // `model.dims.h` — the very expression the old extractor read, and `{w: 0, h: 0}` on fixtures
    // that never run a layout pass, so `300 + h` matched `absY + model.dims.h` at 300 without
    // checking anything. Mirrors argument-collision.test.ts's connector-position test.
    it("positions each notch at model.position + the notch's own centre offset", () => {
        statementTreeNoNesting.model.setPosition(200, 300);

        const rootId = statementTreeNoNesting.model.id;
        const rootResults = extractStatementConnectors('t', statementTreeNoNesting).filter(
            (r) => r.meta.brickId === rootId,
        );

        // Connector bounds are relative to the brick's top-left, so the extractor's only job is to
        // offset them by the brick's absolute position.
        const coords = statementTreeNoNesting.model.getConnectorCoords();

        for (const type of ['prev', 'next', 'nestedNext'] as const) {
            const res = rootResults.find((r) => r.meta.type === type);
            const bounds = coords[type];

            // A notch is emitted exactly when the brick has it.
            expect(Boolean(res)).toBe(Boolean(bounds));
            if (!res || !bounds) continue;

            expect(res.object.x).toBe(200 + bounds.x);
            expect(res.object.y).toBe(300 + bounds.y);
            expect(res.object.w).toBe(bounds.w);
            expect(res.object.h).toBe(bounds.h);
        }
    });

    it('translates every notch by the same delta when the brick moves', () => {
        const rootId = statementTreeNoNesting.model.id;
        const boxesAt = (x: number, y: number) => {
            statementTreeNoNesting.model.setPosition(x, y);
            return extractStatementConnectors('t', statementTreeNoNesting)
                .filter((r) => r.meta.brickId === rootId)
                .map((r) => ({ type: r.meta.type, x: r.object.x, y: r.object.y }));
        };

        const before = boxesAt(200, 300);
        const after = boxesAt(260, 345);

        expect(after).toEqual(before.map((b) => ({ ...b, x: b.x + 60, y: b.y + 45 })));
    });

    // // #700: Superseded by the `getConnectorCoords`-based assertions above. Kept for reference.
    //
    // it('positions each notch at model.position + V_NOTCH_OFFSET_X and height offset', () => {
    //     statementTreeNoNesting.model.setPosition(200, 300);
    //     const { h } = statementTreeNoNesting.model.dims;
    //
    //     const results = extractStatementConnectors('t', statementTreeNoNesting);
    //     const rootId = statementTreeNoNesting.model.id;
    //     const rootResults = results.filter((r) => r.meta.brickId === rootId);
    //
    //     const nextRes = rootResults.find((r) => r.meta.type === 'next');
    //     if (nextRes) {
    //         expect(nextRes.object.x).toBe(200 + 18); // V_NOTCH_OFFSET_X = 18
    //         expect(nextRes.object.y).toBe(300 + h);
    //         expect(nextRes.object.w).toBe(16);
    //         expect(nextRes.object.h).toBe(16);
    //     }
    // });

    it('emits prev, next, and nestedNext connectors for statement bricks with nesting', () => {
        const results = extractStatementConnectors('tower', statementTreeWithNesting);

        const byBrick = new Map<string, Set<string>>();
        for (const { meta } of results) {
            const types = byBrick.get(meta.brickId) ?? new Set<string>();
            types.add(meta.type);
            byBrick.set(meta.brickId, types);
        }

        for (const node of listNodes(statementTreeWithNesting)) {
            if (node.kind === 'statement') {
                const types = byBrick.get(node.model.id) ?? new Set<string>();
                if (node.model.hasConnectionPrev) {
                    expect(types.has('prev')).toBe(true);
                }
                if (node.model.hasConnectionNext) {
                    expect(types.has('next')).toBe(true);
                }
                if (node.model.hasNesting) {
                    expect(types.has('nestedNext')).toBe(true);
                }
            }
        }
    });

    it('assigns every connector a unique collision id and the given tower id', () => {
        const results = extractStatementConnectors('tower', statementTreeWithNesting);
        const ids = results.map((r) => r.object.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(results.every((r) => r.meta.id === r.object.id)).toBe(true);
        expect(results.every((r) => r.meta.towerId === 'tower')).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * A folded brick and everything around it:
 *
 * ```
 * outer
 *   ╠═▶ inner ─ next: nestedTail
 *   next: tail
 * ```
 *
 * Built locally rather than folded into a shared mock, so the fold cannot leak into the tests above.
 */
function makeFoldedTower() {
    const outer = makeEmptyStatement('outer', 0, true);
    const inner = makeEmptyStatement('inner', 0, false);
    const nestedTail = makeEmptyStatement('nested-tail', 0, false);
    const tail = makeEmptyStatement('tail', 0, false);

    outer.nestedNext = inner;
    inner.prev = outer;
    inner.next = nestedTail;
    nestedTail.prev = inner;
    outer.next = tail;
    tail.prev = outer;

    return { outer, inner, nestedTail, tail };
}

describe('extractStatementConnectors with a folded brick', () => {
    it('emits nothing for the bricks the cavity hides', () => {
        const { outer, inner, nestedTail } = makeFoldedTower();

        outer.model.isNestingFolded = true;

        const brickIds = extractStatementConnectors('tower', outer).map((r) => r.meta.brickId);
        expect(brickIds).not.toContain(inner.model.id);
        expect(brickIds).not.toContain(nestedTail.model.id);
    });

    it('keeps the folded brick in the sequence, with its prev and next notches', () => {
        const { outer, tail } = makeFoldedTower();

        outer.model.isNestingFolded = true;

        const results = extractStatementConnectors('tower', outer);
        const outerTypes = results
            .filter((r) => r.meta.brickId === outer.model.id)
            .map((r) => r.meta.type);

        // A fold shuts the cavity; it does not take the brick out of the chain it sits in.
        expect(outerTypes).toContain('prev');
        expect(outerTypes).toContain('next');
        expect(results.map((r) => r.meta.brickId)).toContain(tail.model.id);
    });

    it('drops the cavity notch of the folded brick, so nothing can snap into a shut cavity', () => {
        const { outer } = makeFoldedTower();

        // The model still reports the notch — it is where the hidden sub-tree hangs — and this
        // space is what decides it is not a snap candidate.
        expect(outer.model.getConnectorCoords().nestedNext).toBeDefined();

        outer.model.isNestingFolded = true;

        const outerTypes = extractStatementConnectors('tower', outer)
            .filter((r) => r.meta.brickId === outer.model.id)
            .map((r) => r.meta.type);

        expect(outerTypes).not.toContain('nestedNext');
    });

    it('offers every dropped connector again once the fold is lifted', () => {
        const { outer } = makeFoldedTower();

        const asEmitted = () =>
            extractStatementConnectors('tower', outer)
                .map((r) => `${r.meta.brickId}:${r.meta.type}`)
                .sort();

        const before = asEmitted();

        outer.model.isNestingFolded = true;
        outer.model.isNestingFolded = false;

        expect(asEmitted()).toEqual(before);
    });
});
