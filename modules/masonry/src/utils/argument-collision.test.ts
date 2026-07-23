import { extractArgumentConnectors } from './argument-collision';
import { listNodes } from './tower-traversal';
import { expressionTree, valueTree } from '@/mocks/tower';

describe('extractArgumentConnectors', () => {
    it('emits a single output connector for a lone value brick and no inputs', () => {
        valueTree.model.setPosition(300, 400);

        const results = extractArgumentConnectors('t', valueTree);

        expect(results).toHaveLength(1);
        expect(results[0]!.meta).toMatchObject({
            towerId: 't',
            brickId: valueTree.model.id,
            type: 'output',
        });
        expect(results[0]!.meta.slotIndex).toBeUndefined();
    });

    it('positions each connector at model.position + its centroid offset', () => {
        valueTree.model.setPosition(300, 400);

        const { object } = extractArgumentConnectors('t', valueTree)[0]!;
        const { output } = valueTree.model.getConnectorCoords();

        expect(object.x).toBe(300 + output!.x);
        expect(object.y).toBe(400 + output!.y);
        expect(object.w).toBe(output!.w);
        expect(object.h).toBe(output!.h);
    });

    it('emits one indexed input per arg slot plus an output for expression bricks', () => {
        const results = extractArgumentConnectors('tower', expressionTree);

        // Group emitted connectors by owning brick.
        const byBrick = new Map<string, { inputs: number[]; outputs: number }>();
        for (const { meta } of results) {
            const entry = byBrick.get(meta.brickId) ?? { inputs: [], outputs: 0 };
            if (meta.type === 'input') entry.inputs.push(meta.slotIndex!);
            else entry.outputs += 1;
            byBrick.set(meta.brickId, entry);
        }

        for (const node of listNodes(expressionTree)) {
            const entry = byBrick.get(node.model.id)!;
            if (node.kind === 'value') {
                // Values plug in but own no slots.
                expect(entry.inputs).toEqual([]);
                expect(entry.outputs).toBe(1);
            } else if (node.kind === 'expression') {
                // One input per slot (filled and empty), indexed 0..n-1 in declaration order,
                // plus the output tab.
                const slotCount = node.model.getConnectorCoords().inputs.length;
                expect(entry.inputs).toEqual([...Array(slotCount).keys()]);
                expect(entry.outputs).toBe(1);
            }
        }
    });

    it('assigns every connector a unique collision id and the given tower id', () => {
        const results = extractArgumentConnectors('tower', expressionTree);
        const ids = results.map((r) => r.object.id);

        expect(new Set(ids).size).toBe(ids.length);
        expect(results.every((r) => r.meta.id === r.object.id)).toBe(true);
        expect(results.every((r) => r.meta.towerId === 'tower')).toBe(true);
    });
});
