import { generateBrickData } from '../path';
import type { TInputUnion } from '../path';

describe('Masonry: Brick > Path Generation', () => {
    const testCases = [
        {
            name: 'Type1 – No Args, Label Present',
            input: {
                type: 'type1',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 20, h: 35 },
                bBoxArgs: [{ w: 40, h: 35 }],
                hasNotchAbove: true,
                hasNotchBelow: true,
            },
        },
        {
            name: 'Type1 – No Args, Label = 0',
            input: {
                type: 'type1',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 100, h: 0 },
                bBoxArgs: [],
                hasNotchAbove: true,
                hasNotchBelow: true,
            },
        },
        {
            name: 'Type2 - Label > Sum(args), 1 Arg',
            input: {
                type: 'type2',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 150, h: 90 },
                bBoxArgs: [{ w: 70, h: 45 }],
            },
        },
        {
            name: 'Type2 – Label < Sum(args), 2 Args',
            input: {
                type: 'type2',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 60, h: 20 },
                bBoxArgs: [
                    { w: 20, h: 40 },
                    { w: 20, h: 40 },
                ],
            },
        },
        {
            name: 'Type2 – Label = Sum(args), 3 Args',
            input: {
                type: 'type2',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 120, h: 90 },
                bBoxArgs: [
                    { w: 60, h: 30 },
                    { w: 70, h: 30 },
                    { w: 40, h: 60 },
                ],
            },
        },
        {
            name: 'Type3 – Label > args, 2 nesting, secondaryLabel false',
            input: {
                type: 'type3',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 140, h: 50 },
                bBoxArgs: [
                    { w: 50, h: 20 },
                    { w: 60, h: 15 },
                ],
                hasNotchAbove: true,
                hasNotchBelow: false,
                bBoxNesting: [
                    { w: 80, h: 40 },
                    { w: 100, h: 30 },
                ],
                secondaryLabel: false,
            },
        },
        {
            name: 'Type3 – Label < args, nesting empty, secondaryLabel true',
            input: {
                type: 'type3',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 100, h: 20 },
                bBoxArgs: [
                    { w: 60, h: 40 },
                    { w: 60, h: 50 },
                ],
                hasNotchAbove: false,
                hasNotchBelow: true,
                bBoxNesting: [],
                secondaryLabel: true,
            },
        },
        {
            name: 'Type3 – No label, 1 arg, 1 nesting, all minimal sizes',
            input: {
                type: 'type3',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 0, h: 0 },
                bBoxArgs: [{ w: 0, h: 20 }],
                hasNotchAbove: true,
                hasNotchBelow: true,
                bBoxNesting: [{ w: 10, h: 10 }],
                secondaryLabel: false,
            },
        },
    ];

    testCases.forEach(({ name, input }) => {
        it(`generates path, bounding box, and connection points correctly: ${name}`, () => {
            const { path, boundingBox, connectionPoints } = generateBrickData(input as TInputUnion);

            // Validate the path
            expect(typeof path).toBe('string');
            expect(path.length).toBeGreaterThan(0);

            // Validate the bounding box
            expect(typeof boundingBox).toBe('object');
            expect(boundingBox).toHaveProperty('w');
            expect(boundingBox).toHaveProperty('h');
            expect(typeof boundingBox.w).toBe('number');
            expect(typeof boundingBox.h).toBe('number');
            expect(boundingBox.w).toBeGreaterThan(0);
            expect(boundingBox.h).toBeGreaterThan(0);

            // Validate connection points
            expect(connectionPoints).toHaveProperty('right');
            expect(Array.isArray(connectionPoints.right)).toBe(true);
            connectionPoints.right.forEach((pt) => {
                expect(pt).toHaveProperty('x');
                expect(pt).toHaveProperty('y');
                expect(typeof pt.x).toBe('number');
                expect(typeof pt.y).toBe('number');
            });

            if (connectionPoints.left) {
                expect(typeof connectionPoints.left.x).toBe('number');
                expect(typeof connectionPoints.left.y).toBe('number');
            }

            if (connectionPoints.top) {
                expect(typeof connectionPoints.top.x).toBe('number');
                expect(typeof connectionPoints.top.y).toBe('number');
            }

            if (connectionPoints.bottom) {
                expect(typeof connectionPoints.bottom.x).toBe('number');
                expect(typeof connectionPoints.bottom.y).toBe('number');
            }
        });
    });
});
