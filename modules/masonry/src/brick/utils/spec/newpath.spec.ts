import { generateBrickOutline } from '../newpath';
import type { BrickOutlineConfig, Dimension } from '../newpath';
import { generateBrickData } from '../path';
import type { TInputUnion } from '../path';

// ---------------------------------------------------------------------------
// Helper: parse an SVG path string and compute a bounding box from it.
// (Copied from path.spec.ts for consistency.)
// ---------------------------------------------------------------------------
function calculatePathBoundingBox(pathString: string): { w: number; h: number } {
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
            currentX += parseFloat(tokens[i + 1]);
            currentY += parseFloat(tokens[i + 2]);
            i += 3;
        } else if (command === 'M') {
            currentX = parseFloat(tokens[i + 1]);
            currentY = parseFloat(tokens[i + 2]);
            i += 3;
        } else if (command === 'h') {
            currentX += parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'H') {
            currentX = parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'v') {
            currentY += parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'V') {
            currentY = parseFloat(tokens[i + 1]);
            i += 2;
        } else if (command === 'a') {
            if (i + 7 < tokens.length) {
                currentX += parseFloat(tokens[i + 6]);
                currentY += parseFloat(tokens[i + 7]);
                i += 8;
            } else {
                i += 1;
            }
        } else if (command === 'A') {
            if (i + 7 < tokens.length) {
                currentX = parseFloat(tokens[i + 6]);
                currentY = parseFloat(tokens[i + 7]);
                i += 8;
            } else {
                i += 1;
            }
        } else if (command === 'z' || command === 'Z') {
            i += 1;
        } else if (!isNaN(parseFloat(command))) {
            i += 1;
        } else {
            i += 1;
        }
        minX = Math.min(minX, currentX);
        minY = Math.min(minY, currentY);
        maxX = Math.max(maxX, currentX);
        maxY = Math.max(maxY, currentY);
    }

    return { w: Math.abs(maxX - minX), h: Math.abs(maxY - minY) };
}

// ---------------------------------------------------------------------------
// Equivalence test cases — same inputs expressed in both APIs.
// ---------------------------------------------------------------------------

type EquivalencePair = {
    name: string;
    oldInput: TInputUnion;
    newInput: BrickOutlineConfig;
};

const equivalenceCases: EquivalencePair[] = [
    {
        name: 'Type1 – with top/bottom notch, one arg',
        oldInput: {
            type: 'type1',
            strokeWidth: 2,
            scaleFactor: 1,
            bBoxLabel: { w: 20, h: 35 },
            bBoxArgs: [{ w: 40, h: 35 }],
            hasNotchAbove: true,
            hasNotchBelow: true,
        },
        newInput: {
            hasTopNotch: true,
            hasBottomNotch: true,
            hasLeftNotch: false,
            containsNesting: false,
            nestingDimensions: [],
            argumentDimensions: [{ w: 40, h: 35 }],
            labelWidth: 20,
            labelHeight: 35,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type1 – no args, large label',
        oldInput: {
            type: 'type1',
            strokeWidth: 2,
            scaleFactor: 1,
            bBoxLabel: { w: 100, h: 0 },
            bBoxArgs: [],
            hasNotchAbove: true,
            hasNotchBelow: true,
        },
        newInput: {
            hasTopNotch: true,
            hasBottomNotch: true,
            hasLeftNotch: false,
            containsNesting: false,
            nestingDimensions: [],
            argumentDimensions: [],
            labelWidth: 100,
            labelHeight: 0,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type2 – left notch, one arg',
        oldInput: {
            type: 'type2',
            strokeWidth: 2,
            scaleFactor: 1,
            bBoxLabel: { w: 150, h: 90 },
            bBoxArgs: [{ w: 70, h: 45 }],
        },
        newInput: {
            hasTopNotch: false,
            hasBottomNotch: false,
            hasLeftNotch: true,
            containsNesting: false,
            nestingDimensions: [],
            argumentDimensions: [{ w: 70, h: 45 }],
            labelWidth: 150,
            labelHeight: 90,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type2 – left notch, two args',
        oldInput: {
            type: 'type2',
            strokeWidth: 2,
            scaleFactor: 1,
            bBoxLabel: { w: 60, h: 20 },
            bBoxArgs: [
                { w: 20, h: 40 },
                { w: 20, h: 40 },
            ],
        },
        newInput: {
            hasTopNotch: false,
            hasBottomNotch: false,
            hasLeftNotch: true,
            containsNesting: false,
            nestingDimensions: [],
            argumentDimensions: [
                { w: 20, h: 40 },
                { w: 20, h: 40 },
            ],
            labelWidth: 60,
            labelHeight: 20,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type3 – nesting, secondary label off',
        oldInput: {
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
        newInput: {
            hasTopNotch: true,
            hasBottomNotch: false,
            hasLeftNotch: false,
            containsNesting: true,
            nestingDimensions: [
                { w: 80, h: 40 },
                { w: 100, h: 30 },
            ],
            argumentDimensions: [
                { w: 50, h: 20 },
                { w: 60, h: 15 },
            ],
            labelWidth: 140,
            labelHeight: 50,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type3 – nesting empty, secondary label on',
        oldInput: {
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
        newInput: {
            hasTopNotch: false,
            hasBottomNotch: true,
            hasLeftNotch: false,
            containsNesting: true,
            nestingDimensions: [],
            argumentDimensions: [
                { w: 60, h: 40 },
                { w: 60, h: 50 },
            ],
            labelWidth: 100,
            labelHeight: 20,
            secondaryLabel: true,
            strokeWidth: 2,
        },
    },
    {
        name: 'Type3 – minimal sizes',
        oldInput: {
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
        newInput: {
            hasTopNotch: true,
            hasBottomNotch: true,
            hasLeftNotch: false,
            containsNesting: true,
            nestingDimensions: [{ w: 10, h: 10 }],
            argumentDimensions: [{ w: 0, h: 20 }],
            labelWidth: 0,
            labelHeight: 0,
            secondaryLabel: false,
            strokeWidth: 2,
        },
    },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('newpath.ts — Brick Outline Generation', () => {
    describe('Path equivalence with path.ts', () => {
        equivalenceCases.forEach(({ name, oldInput, newInput }) => {
            it(`produces identical SVG path: ${name}`, () => {
                const oldResult = generateBrickData(oldInput);
                const newResult = generateBrickOutline(newInput);
                expect(newResult.path).toBe(oldResult.path);
            });

            it(`produces identical bounding box: ${name}`, () => {
                const oldResult = generateBrickData(oldInput);
                const newResult = generateBrickOutline(newInput);
                expect(newResult.boundingBox.w).toBeCloseTo(oldResult.boundingBox.w, 2);
                expect(newResult.boundingBox.h).toBeCloseTo(oldResult.boundingBox.h, 2);
            });

            it(`produces matching connection points: ${name}`, () => {
                const oldResult = generateBrickData(oldInput);
                const newResult = generateBrickOutline(newInput);

                // top
                if (oldResult.connectionPoints.top) {
                    expect(newResult.connectionPoints.top).toBeDefined();
                    expect(newResult.connectionPoints.top!.x).toBeCloseTo(
                        oldResult.connectionPoints.top.x,
                        2,
                    );
                    expect(newResult.connectionPoints.top!.y).toBeCloseTo(
                        oldResult.connectionPoints.top.y,
                        2,
                    );
                } else {
                    expect(newResult.connectionPoints.top).toBeUndefined();
                }

                // bottom
                if (oldResult.connectionPoints.bottom) {
                    expect(newResult.connectionPoints.bottom).toBeDefined();
                    expect(newResult.connectionPoints.bottom!.x).toBeCloseTo(
                        oldResult.connectionPoints.bottom.x,
                        2,
                    );
                    expect(newResult.connectionPoints.bottom!.y).toBeCloseTo(
                        oldResult.connectionPoints.bottom.y,
                        2,
                    );
                } else {
                    expect(newResult.connectionPoints.bottom).toBeUndefined();
                }

                // left
                if (oldResult.connectionPoints.left) {
                    expect(newResult.connectionPoints.left).toBeDefined();
                    expect(newResult.connectionPoints.left!.x).toBeCloseTo(
                        oldResult.connectionPoints.left.x,
                        2,
                    );
                    expect(newResult.connectionPoints.left!.y).toBeCloseTo(
                        oldResult.connectionPoints.left.y,
                        2,
                    );
                } else {
                    expect(newResult.connectionPoints.left).toBeUndefined();
                }

                // right
                expect(newResult.connectionPoints.right.length).toBe(
                    oldResult.connectionPoints.right.length,
                );
                for (let i = 0; i < oldResult.connectionPoints.right.length; i++) {
                    expect(newResult.connectionPoints.right[i].x).toBeCloseTo(
                        oldResult.connectionPoints.right[i].x,
                        2,
                    );
                    expect(newResult.connectionPoints.right[i].y).toBeCloseTo(
                        oldResult.connectionPoints.right[i].y,
                        2,
                    );
                }

                // args
                if (oldResult.connectionPoints.args) {
                    expect(newResult.connectionPoints.args).toBeDefined();
                    expect(newResult.connectionPoints.args!.length).toBe(
                        oldResult.connectionPoints.args.length,
                    );
                    for (let i = 0; i < oldResult.connectionPoints.args.length; i++) {
                        expect(newResult.connectionPoints.args![i].x).toBeCloseTo(
                            oldResult.connectionPoints.args[i].x,
                            2,
                        );
                        expect(newResult.connectionPoints.args![i].y).toBeCloseTo(
                            oldResult.connectionPoints.args[i].y,
                            2,
                        );
                    }
                }

                // nested
                if (oldResult.connectionPoints.nested) {
                    expect(newResult.connectionPoints.nested).toBeDefined();
                    expect(newResult.connectionPoints.nested!.x).toBeCloseTo(
                        oldResult.connectionPoints.nested.x,
                        2,
                    );
                    expect(newResult.connectionPoints.nested!.y).toBeCloseTo(
                        oldResult.connectionPoints.nested.y,
                        2,
                    );
                }
            });
        });
    });

    describe('Bounding box matches actual path dimensions', () => {
        equivalenceCases.forEach(({ name, newInput }) => {
            it(`bbox ≈ path extent: ${name}`, () => {
                const { path, boundingBox } = generateBrickOutline(newInput);
                const actualBounds = calculatePathBoundingBox(path);
                expect(Math.abs(boundingBox.w - actualBounds.w)).toBeLessThanOrEqual(1);
                expect(Math.abs(boundingBox.h - actualBounds.h)).toBeLessThanOrEqual(1);
            });
        });
    });

    describe('Connection points within bounding box', () => {
        equivalenceCases.forEach(({ name, newInput }) => {
            it(`all points inside bbox: ${name}`, () => {
                const { boundingBox, connectionPoints } = generateBrickOutline(newInput);

                if (connectionPoints.top) {
                    expect(connectionPoints.top.x).toBeGreaterThanOrEqual(0);
                    expect(connectionPoints.top.x).toBeLessThanOrEqual(boundingBox.w);
                    expect(connectionPoints.top.y).toBeGreaterThanOrEqual(0);
                    expect(connectionPoints.top.y).toBeLessThanOrEqual(boundingBox.h);
                }
                if (connectionPoints.bottom) {
                    expect(connectionPoints.bottom.x).toBeGreaterThanOrEqual(0);
                    expect(connectionPoints.bottom.x).toBeLessThanOrEqual(boundingBox.w);
                    expect(connectionPoints.bottom.y).toBeGreaterThanOrEqual(0);
                    expect(connectionPoints.bottom.y).toBeLessThanOrEqual(boundingBox.h);
                }
                connectionPoints.right.forEach((pt) => {
                    expect(pt.x).toBeGreaterThanOrEqual(0);
                    expect(pt.x).toBeLessThanOrEqual(boundingBox.w);
                    expect(pt.y).toBeGreaterThanOrEqual(0);
                    expect(pt.y).toBeLessThanOrEqual(boundingBox.h);
                });
                if (connectionPoints.left) {
                    expect(connectionPoints.left.y).toBeGreaterThanOrEqual(0);
                    expect(connectionPoints.left.y).toBeLessThanOrEqual(boundingBox.h);
                }
            });
        });
    });

    describe('Argument count derived from argumentDimensions.length', () => {
        it('zero arguments → no right notches', () => {
            const config: BrickOutlineConfig = {
                hasTopNotch: true,
                hasBottomNotch: true,
                hasLeftNotch: false,
                containsNesting: false,
                nestingDimensions: [],
                argumentDimensions: [],
                labelWidth: 80,
                labelHeight: 30,
                secondaryLabel: false,
                strokeWidth: 2,
            };
            const { connectionPoints } = generateBrickOutline(config);
            expect(connectionPoints.right).toHaveLength(0);
            expect(connectionPoints.args).toBeUndefined();
        });

        it('three arguments → three right notches', () => {
            const config: BrickOutlineConfig = {
                hasTopNotch: false,
                hasBottomNotch: false,
                hasLeftNotch: true,
                containsNesting: false,
                nestingDimensions: [],
                argumentDimensions: [
                    { w: 30, h: 25 },
                    { w: 30, h: 25 },
                    { w: 30, h: 25 },
                ],
                labelWidth: 120,
                labelHeight: 60,
                secondaryLabel: false,
                strokeWidth: 2,
            };
            const { connectionPoints } = generateBrickOutline(config);
            expect(connectionPoints.right).toHaveLength(3);
            expect(connectionPoints.args).toHaveLength(3);
        });
    });

    describe('Left notch is a first-class outline property', () => {
        it('hasLeftNotch produces left centroid regardless of other flags', () => {
            const config: BrickOutlineConfig = {
                hasTopNotch: true,
                hasBottomNotch: true,
                hasLeftNotch: true,
                containsNesting: false,
                nestingDimensions: [],
                argumentDimensions: [{ w: 40, h: 30 }],
                labelWidth: 80,
                labelHeight: 30,
                secondaryLabel: false,
                strokeWidth: 2,
            };
            const { connectionPoints } = generateBrickOutline(config);
            expect(connectionPoints.left).toBeDefined();
            expect(connectionPoints.left!.x).toBe(-7);
        });

        it('hasLeftNotch false → no left centroid', () => {
            const config: BrickOutlineConfig = {
                hasTopNotch: true,
                hasBottomNotch: true,
                hasLeftNotch: false,
                containsNesting: false,
                nestingDimensions: [],
                argumentDimensions: [{ w: 40, h: 30 }],
                labelWidth: 80,
                labelHeight: 30,
                secondaryLabel: false,
                strokeWidth: 2,
            };
            const { connectionPoints } = generateBrickOutline(config);
            expect(connectionPoints.left).toBeUndefined();
        });
    });

    describe('Consistency', () => {
        it('identical inputs produce identical outputs', () => {
            const config: BrickOutlineConfig = {
                hasTopNotch: true,
                hasBottomNotch: true,
                hasLeftNotch: false,
                containsNesting: true,
                nestingDimensions: [{ w: 50, h: 30 }],
                argumentDimensions: [{ w: 40, h: 20 }],
                labelWidth: 100,
                labelHeight: 40,
                secondaryLabel: true,
                strokeWidth: 2,
            };
            const r1 = generateBrickOutline(config);
            const r2 = generateBrickOutline(config);
            expect(r1.path).toBe(r2.path);
            expect(r1.boundingBox).toEqual(r2.boundingBox);
            expect(r1.connectionPoints).toEqual(r2.connectionPoints);
        });
    });
});
