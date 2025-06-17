import { generatePath } from '../path';
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
        it(`generates path correctly: ${name}`, () => {
            const result = generatePath(input as TInputUnion);
            expect(typeof result.path).toBe('string');
            expect(result.path.length).toBeGreaterThan(0);
        });
    });
});
