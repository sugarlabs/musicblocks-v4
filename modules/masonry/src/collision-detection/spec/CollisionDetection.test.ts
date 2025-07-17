import { CollisionSpaceBrute, CollisionSpaceQuadTree } from '../CollisionDetection';

type Input = { id: string; x: number; y: number; width: number; height: number };

interface TestCase {
    name: string;
    objects: Input[];
    queryId: string;
    threshold?: number;
    expectedBrute: string[];
    expectedQuad: string[];
}

const testCases: TestCase[] = [
    {
        name: 'No collisions',
        objects: [
            { id: 'a', x: 0, y: 0, width: 10, height: 10 },
            { id: 'b', x: 100, y: 100, width: 10, height: 10 },
        ],
        queryId: 'a',
        expectedBrute: [],
        expectedQuad: [], // both are outside collision distance
    },
    {
        name: 'Single collision',
        objects: [
            { id: 'a', x: 0, y: 0, width: 20, height: 20 },
            { id: 'b', x: 10, y: 0, width: 20, height: 20 },
        ],
        queryId: 'a',
        expectedBrute: ['b'],
        expectedQuad: ['b'],
    },
    {
        name: 'Threshold extends collision',
        objects: [
            { id: 'a', x: 0, y: 0, width: 20, height: 20 },
            { id: 'b', x: 30, y: 0, width: 20, height: 20 },
        ],
        queryId: 'a',
        threshold: 0.5,
        expectedBrute: ['b'],
        expectedQuad: ['b'],
    },
    {
        name: 'Multiple collisions',
        objects: [
            { id: 'a', x: 0, y: 0, width: 20, height: 20 },
            { id: 'b', x: 10, y: 0, width: 20, height: 20 },
            { id: 'c', x: -10, y: 0, width: 20, height: 20 },
        ],
        queryId: 'a',
        expectedBrute: ['b', 'c'],
        expectedQuad: ['b'],
    },
];

describe('CollisionSpaceBrute', () => {
    testCases.forEach(({ name, objects, queryId, threshold, expectedBrute }) => {
        it(name, () => {
            const space = new CollisionSpaceBrute();
            if (threshold !== undefined) {
                space.setOptions({ threshold });
            }
            space.addObjects(objects);
            const queryObj = objects.find((o) => o.id === queryId)!;
            expect(space.checkCollision(queryObj).sort()).toEqual(expectedBrute.sort());
        });
    });
});

describe('CollisionSpaceQuadTree', () => {
    testCases.forEach(({ name, objects, queryId, threshold, expectedQuad }) => {
        it(name, () => {
            const space = new CollisionSpaceQuadTree(200, 200);
            if (threshold !== undefined) {
                space.setOptions({ threshold });
            }
            space.addObjects(objects);
            const queryObj = objects.find((o) => o.id === queryId)!;
            expect(space.checkCollision(queryObj).sort()).toEqual(expectedQuad.sort());
        });
    });
});
