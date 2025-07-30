import { generateBrickData } from '../path';
import type { TInputUnion } from '../path';

// Helper function to parse SVG path and calculate actual bounding box
function calculatePathBoundingBox(pathString: string): { w: number; h: number; debug?: unknown } {
    // More robust parsing - split by spaces but handle commas and multiple spaces
    const pathData = pathString.trim().replace(/,/g, ' ').replace(/\s+/g, ' ');
    const tokens = pathData.split(' ');

    let currentX = 0;
    let currentY = 0;
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    let i = 0;
    while (i < tokens.length) {
        const command = tokens[i];

        if (command === 'm') {
            // Relative move
            const dx = parseFloat(tokens[i + 1]);
            const dy = parseFloat(tokens[i + 2]);
            currentX += dx;
            currentY += dy;
            i += 3;
        } else if (command === 'M') {
            // Absolute move
            currentX = parseFloat(tokens[i + 1]);
            currentY = parseFloat(tokens[i + 2]);
            i += 3;
        } else if (command === 'h') {
            // Horizontal line (relative)
            const dx = parseFloat(tokens[i + 1]);
            currentX += dx;
            i += 2;
        } else if (command === 'H') {
            // Horizontal line (absolute)
            currentX = parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'v') {
            // Vertical line (relative)
            const dy = parseFloat(tokens[i + 1]);
            currentY += dy;
            i += 2;
        } else if (command === 'V') {
            // Vertical line (absolute)
            currentY = parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'a') {
            // Arc command (relative): a rx ry x-axis-rotation large-arc-flag sweep-flag dx dy
            if (i + 7 < tokens.length) {
                const rx = parseFloat(tokens[i + 1]);
                const ry = parseFloat(tokens[i + 2]);
                const xAxisRotation = parseFloat(tokens[i + 3]);
                const largeArcFlag = parseFloat(tokens[i + 4]);
                const sweepFlag = parseFloat(tokens[i + 5]);
                const dx = parseFloat(tokens[i + 6]);
                const dy = parseFloat(tokens[i + 7]);

                // For bounding box calculation, we need to consider arc extremes
                // Simplified: just use start and end points for now
                currentX += dx;
                currentY += dy;
                i += 8;
            } else {
                i += 1;
            }
        } else if (command === 'A') {
            // Arc command (absolute)
            if (i + 7 < tokens.length) {
                currentX = parseFloat(tokens[i + 6]);
                currentY = parseFloat(tokens[i + 7]);
                i += 8;
            } else {
                i += 1;
            }
        } else if (command === 'z' || command === 'Z') {
            // Close path - return to start
            // Note: This assumes we return to the last move point
            i += 1;
        } else if (!isNaN(parseFloat(command))) {
            // This might be a coordinate without a command (implicit lineto)
            i += 1;
        } else {
            // Unknown command, skip
            i += 1;
        }

        // Update bounds after each command
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);
    }

    const result = {
        w: Math.abs(maxX - minX),
        h: Math.abs(maxY - minY),
    };

    return result;
}

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

        // NEW TEST: Validate bounding box against actual path dimensions
        it(`bounding box matches actual path dimensions: ${name}`, () => {
            const { path, boundingBox } = generateBrickData(input as TInputUnion);

            // Calculate actual bounding box from path
            const actualBounds = calculatePathBoundingBox(path);

            // Debug output for failed tests
            if (
                Math.abs(boundingBox.w - actualBounds.w) > 1 ||
                Math.abs(boundingBox.h - actualBounds.h) > 1
            ) {
                console.log(`\n=== DEBUG INFO FOR: ${name} ===`);
                console.log('Input:', JSON.stringify(input, null, 2));
                console.log('Generated Path:', path);
                console.log('Expected Bounding Box:', boundingBox);
                console.log('Actual Path Bounds:', actualBounds);
                console.log('Width Difference:', Math.abs(boundingBox.w - actualBounds.w));
                console.log('Height Difference:', Math.abs(boundingBox.h - actualBounds.h));
                console.log('=====================================\n');
            }

            // Use larger tolerance since there might be genuine calculation differences
            // Especially with arc commands and complex path geometries
            const tolerance = 1;

            expect(Math.abs(boundingBox.w - actualBounds.w)).toBeLessThanOrEqual(tolerance);
            expect(Math.abs(boundingBox.h - actualBounds.h)).toBeLessThanOrEqual(tolerance);
        });

        // NEW TEST: Validate connection points are within bounding box
        it(`connection points are within bounding box: ${name}`, () => {
            const { boundingBox, connectionPoints } = generateBrickData(input as TInputUnion);

            // Check top connection point
            if (connectionPoints.top) {
                expect(connectionPoints.top.x).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.top.x).toBeLessThanOrEqual(boundingBox.w);
                expect(connectionPoints.top.y).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.top.y).toBeLessThanOrEqual(boundingBox.h);
            }

            // Check bottom connection point
            if (connectionPoints.bottom) {
                expect(connectionPoints.bottom.x).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.bottom.x).toBeLessThanOrEqual(boundingBox.w);
                expect(connectionPoints.bottom.y).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.bottom.y).toBeLessThanOrEqual(boundingBox.h);
            }

            // Check right connection points
            connectionPoints.right.forEach((pt, index) => {
                expect(pt.x).toBeGreaterThanOrEqual(0);
                expect(pt.x).toBeLessThanOrEqual(boundingBox.w);
                expect(pt.y).toBeGreaterThanOrEqual(0);
                expect(pt.y).toBeLessThanOrEqual(boundingBox.h);
            });

            // Check left connection point (type2 only)
            if (connectionPoints.left) {
                // Left connection point can be negative (extending outside bounding box)
                expect(connectionPoints.left.y).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.left.y).toBeLessThanOrEqual(boundingBox.h);
            }
        });

        // NEW TEST: Validate argument and nested origins
        it(`argument and nested origins are correctly positioned: ${name}`, () => {
            const { boundingBox, connectionPoints } = generateBrickData(input as TInputUnion);

            // Check argument origins - allow small tolerance for positioning
            if (connectionPoints.args) {
                connectionPoints.args.forEach((arg, index) => {
                    expect(typeof arg.x).toBe('number');
                    expect(typeof arg.y).toBe('number');
                    expect(arg.x).toBeGreaterThanOrEqual(0);
                    // Allow 1 units tolerance for argument positioning
                    expect(arg.x).toBeLessThanOrEqual(boundingBox.w + 1);
                    expect(arg.y).toBeGreaterThanOrEqual(0);
                    expect(arg.y).toBeLessThanOrEqual(boundingBox.h + 1);
                });
            }

            // Check nested origin (type3 only)
            if (connectionPoints.nested) {
                expect(typeof connectionPoints.nested.x).toBe('number');
                expect(typeof connectionPoints.nested.y).toBe('number');
                expect(connectionPoints.nested.x).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.nested.x).toBeLessThanOrEqual(boundingBox.w);
                expect(connectionPoints.nested.y).toBeGreaterThanOrEqual(0);
                expect(connectionPoints.nested.y).toBeLessThanOrEqual(boundingBox.h);
            }
        });
    });

    // NEW TEST SUITE: Edge cases and specific scenarios
    describe('Edge Cases and Specific Scenarios', () => {
        it('handles minimal label dimensions correctly', () => {
            const input = {
                type: 'type1',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 0, h: 0 },
                bBoxArgs: [],
                hasNotchAbove: false,
                hasNotchBelow: false,
            };

            const { boundingBox, path } = generateBrickData(input as TInputUnion);
            const actualBounds = calculatePathBoundingBox(path);

            // Should use minimum dimensions
            expect(boundingBox.w).toBeGreaterThan(0);
            expect(boundingBox.h).toBeGreaterThan(0);
            expect(Math.abs(boundingBox.w - actualBounds.w)).toBeLessThanOrEqual(10);
            expect(Math.abs(boundingBox.h - actualBounds.h)).toBeLessThanOrEqual(10);
        });

        it('handles maximum number of arguments correctly', () => {
            const input = {
                type: 'type2',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 200, h: 100 },
                bBoxArgs: Array(5).fill({ w: 30, h: 20 }), // 5 arguments
            };

            const { boundingBox, connectionPoints, path } = generateBrickData(input as TInputUnion);
            const actualBounds = calculatePathBoundingBox(path);

            expect(connectionPoints.right).toHaveLength(5);
            expect(connectionPoints.args).toHaveLength(5);
            expect(Math.abs(boundingBox.w - actualBounds.w)).toBeLessThanOrEqual(10);
            expect(Math.abs(boundingBox.h - actualBounds.h)).toBeLessThanOrEqual(10);
        });

        it('handles type3 with complex nesting correctly', () => {
            const input = {
                type: 'type3',
                strokeWidth: 4,
                scaleFactor: 1,
                bBoxLabel: { w: 180, h: 80 },
                bBoxArgs: [
                    { w: 40, h: 30 },
                    { w: 50, h: 40 },
                ],
                hasNotchAbove: true,
                hasNotchBelow: true,
                bBoxNesting: [
                    { w: 60, h: 25 },
                    { w: 70, h: 35 },
                    { w: 80, h: 45 },
                ],
                secondaryLabel: true,
            };

            const { boundingBox, connectionPoints, path } = generateBrickData(input as TInputUnion);
            const actualBounds = calculatePathBoundingBox(path);

            expect(connectionPoints.top).toBeDefined();
            expect(connectionPoints.bottom).toBeDefined();
            expect(connectionPoints.nested).toBeDefined();
            expect(connectionPoints.right).toHaveLength(2);
            expect(Math.abs(boundingBox.w - actualBounds.w)).toBeLessThanOrEqual(10);
            expect(Math.abs(boundingBox.h - actualBounds.h)).toBeLessThanOrEqual(10);
        });
    });

    // NEW TEST SUITE: Performance and consistency
    describe('Performance and Consistency', () => {
        it('generates consistent results for identical inputs', () => {
            const input = {
                type: 'type2',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 100, h: 50 },
                bBoxArgs: [{ w: 30, h: 25 }],
            };

            const result1 = generateBrickData(input as TInputUnion);
            const result2 = generateBrickData(input as TInputUnion);

            expect(result1.path).toBe(result2.path);
            expect(result1.boundingBox).toEqual(result2.boundingBox);
            expect(result1.connectionPoints).toEqual(result2.connectionPoints);
        });

        it('scales correctly with different stroke widths', () => {
            const baseInput = {
                type: 'type1',
                strokeWidth: 2,
                scaleFactor: 1,
                bBoxLabel: { w: 80, h: 40 },
                bBoxArgs: [],
                hasNotchAbove: true,
                hasNotchBelow: true,
            };

            const thickInput = { ...baseInput, strokeWidth: 6 };

            const baseResult = generateBrickData(baseInput as TInputUnion);
            const thickResult = generateBrickData(thickInput as TInputUnion);

            // Thicker stroke should result in larger bounding box
            expect(thickResult.boundingBox.w).toBeGreaterThan(baseResult.boundingBox.w);
            expect(thickResult.boundingBox.h).toBeGreaterThan(baseResult.boundingBox.h);
        });
    });
});
