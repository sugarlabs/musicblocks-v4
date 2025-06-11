import {
    createBrickBlock,
    createBrickData,
    createBrickExpression,
    createBrickStatement,
    getBrickFromWarehouse,
    deleteBrickFromWarehouse,
} from './brickFactory';
import type { TColor } from '@/@types/brick';

// Mock color data for testing
const mockColor: TColor = '#FFFFFF';

// Test suite for BrickFactory
describe('BrickFactory', () => {
    it('should create a BrickBlock and add it to the warehouse', () => {
        const brick = createBrickBlock({
            name: 'TestBlock',
            label: 'BlockLabel',
            glyph: '🔲',
            args: [{ id: 'arg1', label: 'Arg 1' }],
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
            connectAbove: true,
            connectBelow: false,
            nestLengthY: 100,
            folded: false,
        });

        expect(brick).toBeDefined();
        expect(getBrickFromWarehouse(brick.uuid)).toBe(brick);
    });

    it('should create a BrickData and add it to the warehouse', () => {
        const brick = createBrickData({
            name: 'TestData',
            label: 'DataLabel',
            glyph: '🔢',
            dynamic: true,
            value: 42,
            input: 'number',
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
        });

        expect(brick).toBeDefined();
        expect(getBrickFromWarehouse(brick.uuid)).toBe(brick);
    });

    it('should create a BrickExpression and add it to the warehouse', () => {
        const brick = createBrickExpression({
            name: 'TestExpression',
            label: 'ExpressionLabel',
            glyph: '📐',
            args: { arg1: { label: 'Arg 1', dataType: 'number', meta: {} } },
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
        });

        expect(brick).toBeDefined();
        expect(getBrickFromWarehouse(brick.uuid)).toBe(brick);
    });

    it('should create a BrickStatement and add it to the warehouse', () => {
        const brick = createBrickStatement({
            name: 'TestStatement',
            label: 'StatementLabel',
            glyph: '📄',
            args: { arg1: { label: 'Arg 1', dataType: 'string', meta: {} } },
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
            connectAbove: true,
            connectBelow: true,
        });

        expect(brick).toBeDefined();
        expect(getBrickFromWarehouse(brick.uuid)).toBe(brick);
    });

    it('should retrieve a brick from the warehouse by its UUID', () => {
        const brick = createBrickBlock({
            name: 'RetrieveBlock',
            label: 'RetrieveLabel',
            glyph: '🔲',
            args: [{ id: 'arg2', label: 'Arg 2' }],
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
            connectAbove: true,
            connectBelow: true,
            nestLengthY: 200,
        });

        const retrievedBrick = getBrickFromWarehouse(brick.uuid);
        expect(retrievedBrick).toBe(brick);
    });

    it('should delete a brick from the warehouse by its UUID', () => {
        const brick = createBrickBlock({
            name: 'DeleteBlock',
            label: 'DeleteLabel',
            glyph: '🔲',
            args: [{ id: 'arg3', label: 'Arg 3' }],
            colorBg: mockColor,
            colorFg: mockColor,
            colorBgHighlight: mockColor,
            colorFgHighlight: mockColor,
            outline: mockColor,
            scale: 1,
            connectAbove: false,
            connectBelow: true,
            nestLengthY: 50,
        });

        const wasDeleted = deleteBrickFromWarehouse(brick.uuid);
        expect(wasDeleted).toBe(true);
        expect(getBrickFromWarehouse(brick.uuid)).toBeUndefined();
    });
});
