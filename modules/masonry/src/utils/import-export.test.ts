import { describe, it, expect } from 'vitest';
import { exportWorkspace } from './import-export';
import { createMockTowerRoot } from '@/mocks/workspaceTower';
import type { TowerState } from '@/@types/workspace.types';

describe('import-export utils', () => {
    describe('exportWorkspace', () => {
        it('should correctly flatten a cyclic tower graph into a JSON-serializable structure', () => {
            const root = createMockTowerRoot();
            const mockTower: TowerState = {
                id: 'test-tower',
                position: { x: 100, y: 200 },
                root,
            };

            const towers = { [mockTower.id]: mockTower };
            const exported = exportWorkspace(towers);

            // Assert towers array is correctly populated
            expect(exported.towers).toHaveLength(1);
            expect(exported.towers[0].id).toBe('test-tower');
            expect(exported.towers[0].position).toEqual({ x: 100, y: 200 });
            expect(exported.towers[0].rootNodeId).toBe(root.model.id);

            // Assert nodes dictionary is populated with the flattened nodes
            const nodeIds = Object.keys(exported.nodes);

            // The mock tower has around 17 interconnected nodes
            expect(nodeIds.length).toBeGreaterThan(10);

            // Check that the root node was flattened correctly
            const rootNode = exported.nodes[root.model.id];
            expect(rootNode).toBeDefined();
            expect(rootNode.id).toBe(root.model.id);
            expect(rootNode.kind).toBe('statement');
            expect(rootNode.modelConfig.id).toBe(root.model.id);

            // Verify downward pointers are extracted as string IDs
            if (root.kind === 'statement' && root.nestedNext) {
                expect(rootNode.nestedNext).toBe(root.nestedNext.model.id);
                // Verify the nested node was successfully traversed and exists in the dictionary
                expect(exported.nodes[root.nestedNext.model.id]).toBeDefined();
            }

            // Ensure no cyclic references exist that would break standard JSON serialization
            expect(() => JSON.stringify(exported)).not.toThrow();
        });

        it('should properly handle multiple towers', () => {
            const root1 = createMockTowerRoot();
            const root2 = createMockTowerRoot();

            const towers = {
                'tower-1': { id: 'tower-1', position: { x: 0, y: 0 }, root: root1 },
                'tower-2': { id: 'tower-2', position: { x: 50, y: 50 }, root: root2 },
            };

            const exported = exportWorkspace(towers);

            expect(exported.towers).toHaveLength(2);

            // Both towers' nodes should be in the dictionary
            const nodeIds = Object.keys(exported.nodes);
            expect(nodeIds.length).toBeGreaterThan(20);

            // Should still safely serialize without circular dependency errors
            expect(() => JSON.stringify(exported)).not.toThrow();
        });
    });
});
