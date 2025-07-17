import { createReverseMappingUtility } from '../ReverseMappingUtility';
import type { TPoint } from '../../@types/tower';
import WorkspaceManager from '../../workspace/model/model';
import {
    createSimpleBrick,
    createExpressionBrick,
    createCompoundBrick,
    resetFactoryCounter,
} from '../../brick/utils/brickFactory';

describe('ReverseMappingUtility', () => {
    let workspaceManager: WorkspaceManager;

    beforeEach(() => {
        resetFactoryCounter();
        workspaceManager = new WorkspaceManager();
    });

    function setupTowers() {
        const reverseMapper = createReverseMappingUtility(workspaceManager);

        // Tower 1: Simple vertical stack
        const root1 = createSimpleBrick({ label: 'Root Brick' });
        const child1 = createSimpleBrick({ label: 'Child 1' });
        const child2 = createSimpleBrick({ label: 'Child 2' });

        const tower1 = workspaceManager.createTower(root1, { x: 100, y: 100 });
        tower1.addBrick(root1.uuid, child1, { x: 100, y: 150 });
        tower1.addBrick(child1.uuid, child2, { x: 100, y: 200 });

        // Tower 2: Compound brick with argument bricks
        const compound = createCompoundBrick({
            label: 'Compound Brick',
            bboxArgs: [
                { w: 80, h: 30 },
                { w: 60, h: 25 },
            ],
        });
        const arg1 = createExpressionBrick({ label: 'Arg 1' });
        const arg2 = createExpressionBrick({ label: 'Arg 2' });

        const tower2 = workspaceManager.createTower(compound, { x: 400, y: 100 });
        tower2.addArgumentBrick(compound.uuid, arg1, { x: 0, y: 0 }, 0);
        tower2.addArgumentBrick(compound.uuid, arg2, { x: 0, y: 0 }, 1);

        // Tower 3: Compound brick with nested bricks
        const compound2 = createCompoundBrick({
            label: 'Nested Brick',
            bboxArgs: [{ w: 70, h: 40 }],
        });
        const nested1 = createSimpleBrick({ label: 'Nested 1' });
        const nested2 = createSimpleBrick({ label: 'Nested 2' });

        const tower3 = workspaceManager.createTower(compound2, { x: 700, y: 100 });
        tower3.addNestedBrick(compound2.uuid, nested1, { x: 0, y: 0 });
        tower3.addNestedBrick(compound2.uuid, nested2, { x: 0, y: 0 });

        return {
            reverseMapper,
            brickRefs: {
                root1,
                child1,
                child2,
                compound,
                arg1,
                arg2,
                compound2,
                nested1,
                nested2,
            },
        };
    }

    it('should find a brick at a known location', () => {
        const { reverseMapper } = setupTowers();
        const testPoint: TPoint = { x: 120, y: 110 }; // Inside root1 brick area

        const result = reverseMapper.findBrickAtPoint(testPoint);

        expect(result.brick).not.toBeNull();
        expect(result.tower).not.toBeNull();
        expect(result.towerNode).not.toBeNull();
        expect(result.brickLocalPoint).not.toBeNull();
    });

    it('should return null for a point that does not intersect any brick', () => {
        const { reverseMapper } = setupTowers();
        const testPoint: TPoint = { x: 1000, y: 1000 };

        const result = reverseMapper.findBrickAtPoint(testPoint);

        expect(result.brick).toBeNull();
        expect(result.tower).toBeNull();
        expect(result.towerNode).toBeNull();
    });

    it('should find multiple bricks within a given area', () => {
        const { reverseMapper } = setupTowers();
        const topLeft: TPoint = { x: 50, y: 50 };
        const bottomRight: TPoint = { x: 500, y: 300 };

        const results = reverseMapper.findBricksInArea(topLeft, bottomRight);

        expect(results.length).toBeGreaterThan(0);
        expect(results.every((r) => r.brick !== null)).toBe(true);
    });

    it('should return all connection points for a brick by ID', () => {
        const { reverseMapper, brickRefs } = setupTowers();

        const result = reverseMapper.getBrickConnectionPoints(brickRefs.root1.uuid);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        result.forEach((conn) => {
            expect(conn.point).toHaveProperty('x');
            expect(conn.point).toHaveProperty('y');
            expect(conn.type).toMatch(/top|right|bottom|left/);
        });
    });

    it('should not return connection points for a nonexistent brick', () => {
        const reverseMapper = createReverseMappingUtility(workspaceManager);
        const result = reverseMapper.getBrickConnectionPoints('nonexistent-brick-id');
        expect(result.length).toBe(0);
    });
});
