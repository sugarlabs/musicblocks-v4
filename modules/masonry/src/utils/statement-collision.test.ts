import { extractStatementConnectors } from './statement-collision';
import { listNodes } from './tower-traversal';
import { statementTreeNoNesting, statementTreeWithNesting } from '@/mocks/tower';

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

    it('positions each notch at model.position + V_NOTCH_OFFSET_X and height offset', () => {
        statementTreeNoNesting.model.setPosition(200, 300);
        const { h } = statementTreeNoNesting.model.dims;

        const results = extractStatementConnectors('t', statementTreeNoNesting);
        const rootId = statementTreeNoNesting.model.id;
        const rootResults = results.filter((r) => r.meta.brickId === rootId);

        const nextRes = rootResults.find((r) => r.meta.type === 'next');
        if (nextRes) {
            expect(nextRes.object.x).toBe(200 + 18); // V_NOTCH_OFFSET_X = 18
            expect(nextRes.object.y).toBe(300 + h);
            expect(nextRes.object.w).toBe(16);
            expect(nextRes.object.h).toBe(16);
        }
    });

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
