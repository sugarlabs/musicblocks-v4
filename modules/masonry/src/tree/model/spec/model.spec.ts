import { describe, it, expect, beforeEach } from 'vitest';
import BrickTreeManager from '../model.js';
import { SimpleBrick, ExpressionBrick } from '../../../brick/model/model';
import CompoundBrick from '../../../brick/model/model';
import { IBrick } from '../../../brick/@types/brick';

describe('BrickTreeManager', () => {
    let treeManager: BrickTreeManager;
    let simpleBrick1: IBrick;
    let simpleBrick2: IBrick;
    let expressionBrick: IBrick;
    let expressionBrick2: IBrick;
    let compoundBrick: IBrick;

    beforeEach(() => {
        treeManager = new BrickTreeManager();

        simpleBrick1 = new SimpleBrick({
            uuid: 'simple1',
            name: 'Simple 1',
            label: 's1',
            labelType: 'text',
            colorBg: 'red',
            colorFg: 'white',
            strokeColor: 'black',
            shadow: false,
            scale: 1,
            bboxArgs: [{ w: 10, h: 20 }], // Add bboxArgs to generate right connection points
            topNotch: true,
            bottomNotch: true,
        });

        // Use SimpleBrick for top-bottom tests
        simpleBrick2 = new SimpleBrick({
            uuid: 'simple2',
            name: 'Simple 2',
            label: 's2',
            labelType: 'text',
            colorBg: 'green',
            colorFg: 'white',
            strokeColor: 'black',
            shadow: false,
            scale: 1,
            bboxArgs: [{ w: 10, h: 20 }],
            topNotch: true,
            bottomNotch: true,
        });

        // Use ExpressionBrick for right-to-left tests
        expressionBrick = new ExpressionBrick({
            uuid: 'expr1',
            name: 'Expression 1',
            label: 'e1',
            labelType: 'text',
            colorBg: 'blue',
            colorFg: 'white',
            strokeColor: 'black',
            shadow: false,
            scale: 1,
            bboxArgs: [], // Expression bricks have a left notch by default
        });
        expressionBrick2 = new ExpressionBrick({
            uuid: 'expr2',
            name: 'Expression 2',
            label: 'e2',
            labelType: 'text',
            colorBg: 'orange',
            colorFg: 'white',
            strokeColor: 'black',
            shadow: false,
            scale: 1,
            bboxArgs: [],
        });

        compoundBrick = new CompoundBrick({
            uuid: 'comp1',
            name: 'Compound 1',
            label: 'c1',
            labelType: 'text',
            colorBg: 'purple',
            colorFg: 'white',
            strokeColor: 'black',
            shadow: false,
            scale: 1,
            bboxArgs: [{ w: 10, h: 20 }], // Add bboxArgs to generate right connection points
            bboxNest: [],
            topNotch: true,
            bottomNotch: true,
        });
    });

    describe('Tree Creation', () => {
        it('should create a new tree with a single brick', () => {
            const tree = treeManager.createTree(simpleBrick1, { x: 0, y: 0 });
            expect(tree.id).toBe('tree_1');
        });
    });

    describe('Hierarchical Tree Behavior (Folder-like Structure)', () => {
        it('should disconnect a parent and keep children', () => {
            const tree = treeManager.createTree(simpleBrick1, { x: 0, y: 0 });
            treeManager.addBrickToTree(tree.id, simpleBrick2, simpleBrick1.uuid, { x: 0, y: 50 });
            treeManager.connectBricks(
                simpleBrick1.uuid,
                simpleBrick2.uuid,
                simpleBrick1.connectionPoints.bottom!,
                simpleBrick2.connectionPoints.top!,
                'top-bottom',
            );
            const result = treeManager.disconnectBrick(simpleBrick2.uuid);
            expect(result.newTreeIds).toHaveLength(1);
            expect(result.removedConnections).toHaveLength(1);
        });
    });

    describe('Right-to-Left "Puzzle" Connections', () => {
        it('should connect two bricks with a right-to-left connection', () => {
            treeManager.createTree(simpleBrick1, { x: 0, y: 0 });
            treeManager.createTree(expressionBrick, { x: 120, y: 0 });
            const newTreeId = treeManager.connectBricks(
                simpleBrick1.uuid,
                expressionBrick.uuid,
                simpleBrick1.connectionPoints.right[0],
                expressionBrick.connectionPoints.left!,
                'right-left',
            );
            const tree = treeManager.getTree(newTreeId!);
            expect(tree?.connections[0].fromNotchId).toBe('right_0');
            expect(tree?.connections[0].toNotchId).toBe('left');
            expect(treeManager.getBrickParent(expressionBrick.uuid)).toBe(simpleBrick1.uuid);
        });

        it('should not connect if a notch is already in use', () => {
            const treeId = treeManager.createTree(simpleBrick1, { x: 0, y: 0 }).id;
            treeManager.addBrickToTree(treeId, expressionBrick, simpleBrick1.uuid, {
                x: 120,
                y: 0,
            });
            treeManager.connectBricks(
                simpleBrick1.uuid,
                expressionBrick.uuid,
                simpleBrick1.connectionPoints.right[0],
                expressionBrick.connectionPoints.left!,
                'right-left',
            );
            treeManager.createTree(expressionBrick2, { x: 120, y: 50 });
            const result = treeManager.connectBricks(
                simpleBrick1.uuid,
                expressionBrick2.uuid,
                simpleBrick1.connectionPoints.right[0],
                expressionBrick2.connectionPoints.left!,
                'right-left',
            );
            expect(result).toBeNull();
        });

        it('should disconnect a right-to-left connection', () => {
            treeManager.createTree(simpleBrick1, { x: 0, y: 0 });
            treeManager.createTree(expressionBrick, { x: 120, y: 0 });
            treeManager.connectBricks(
                simpleBrick1.uuid,
                expressionBrick.uuid,
                simpleBrick1.connectionPoints.right[0],
                expressionBrick.connectionPoints.left!,
                'right-left',
            );
            const result = treeManager.disconnectBrick(expressionBrick.uuid);
            expect(result.removedConnections).toHaveLength(1);
            expect(result.newTreeIds).toHaveLength(1);
            expect(treeManager.areBricksConnected(simpleBrick1.uuid, expressionBrick.uuid)).toBe(
                false,
            );
        });
    });

    // Re-introducing Tower Model Test Cases
    describe('Tower Model Test Cases', () => {
        it('Test Case 1: should connect multiple bricks in a chain', () => {
            const treeId = treeManager.createTree(simpleBrick1, { x: 0, y: 0 }).id;
            treeManager.addBrickToTree(treeId, simpleBrick2, simpleBrick1.uuid, { x: 0, y: 50 });
            treeManager.addBrickToTree(treeId, compoundBrick, simpleBrick2.uuid, { x: 0, y: 100 });

            treeManager.connectBricks(
                simpleBrick1.uuid,
                simpleBrick2.uuid,
                simpleBrick1.connectionPoints.bottom!,
                simpleBrick2.connectionPoints.top!,
                'top-bottom',
            );
            treeManager.connectBricks(
                simpleBrick2.uuid,
                compoundBrick.uuid,
                simpleBrick2.connectionPoints.bottom!,
                (compoundBrick as IBrick).connectionPoints.top!,
                'top-bottom',
            );
            expect(treeManager.getAllTrees()).toHaveLength(1);
            expect(treeManager.getBricksInTree('tree_1')).toHaveLength(3);
        });

        it('Test Case 2: should disconnect a brick from the middle of a chain', () => {
            const treeId = treeManager.createTree(simpleBrick1, { x: 0, y: 0 }).id;
            treeManager.addBrickToTree(treeId, simpleBrick2, simpleBrick1.uuid, { x: 0, y: 50 });
            treeManager.addBrickToTree(treeId, compoundBrick, simpleBrick2.uuid, { x: 0, y: 100 });
            treeManager.connectBricks(
                simpleBrick1.uuid,
                simpleBrick2.uuid,
                simpleBrick1.connectionPoints.bottom!,
                simpleBrick2.connectionPoints.top!,
                'top-bottom',
            );
            treeManager.connectBricks(
                simpleBrick2.uuid,
                compoundBrick.uuid,
                simpleBrick2.connectionPoints.bottom!,
                (compoundBrick as IBrick).connectionPoints.top!,
                'top-bottom',
            );

            const result = treeManager.disconnectBrick(simpleBrick2.uuid);
            expect(result.removedConnections).toHaveLength(2);
            expect(result.newTreeIds).toHaveLength(1); // Disconnected brick forms its own tree
        });

        it('Test Case 3: should not connect when notch is already connected', () => {
            treeManager.createTree(simpleBrick1, { x: 0, y: 0 });
            treeManager.createTree(simpleBrick2, { x: 0, y: 50 });
            treeManager.connectBricks(
                simpleBrick1.uuid,
                simpleBrick2.uuid,
                simpleBrick1.connectionPoints.bottom!,
                simpleBrick2.connectionPoints.top!,
                'top-bottom',
            );
            treeManager.createTree(compoundBrick, { x: 0, y: 100 });
            const result = treeManager.connectBricks(
                simpleBrick1.uuid,
                compoundBrick.uuid,
                simpleBrick1.connectionPoints.bottom!,
                (compoundBrick as IBrick).connectionPoints.top!,
                'top-bottom',
            );
            expect(result).toBeNull();
        });
    });
});
