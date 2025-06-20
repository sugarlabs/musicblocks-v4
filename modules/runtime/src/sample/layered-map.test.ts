/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { LayeredMap } from '../execution/scope';

type TestMapType = {
    [x: string]: any;
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    e?: string;
    count?: number;
    name?: string;
    value?: any;
};

describe('LayeredMap Tests', () => {
    let layeredMap: LayeredMap<TestMapType>;

    beforeEach(() => {
        layeredMap = new LayeredMap<TestMapType>({
            a: 'root-a',
            b: 'root-b',
        });
    });

    describe('Constructor', () => {
        it('should initialize with provided initial map', () => {
            expect(layeredMap.rootID).toBeDefined();
            expect(layeredMap.projectFlatMap(layeredMap.rootID)).toEqual({
                a: 'root-a',
                b: 'root-b',
            });
        });

        it('should initialize with empty map when no initial provided', () => {
            const emptyMap = new LayeredMap<TestMapType>();
            expect(emptyMap.projectFlatMap(emptyMap.rootID)).toEqual({});
        });

        it('should create unique root IDs for different instances', () => {
            const map1 = new LayeredMap<TestMapType>({ a: 'test1' });
            const map2 = new LayeredMap<TestMapType>({ a: 'test2' });

            expect(map1.rootID).not.toBe(map2.rootID);
        });

        it('should create deep copy of initial map', () => {
            const initial = { a: 'original', count: 1 };
            const map = new LayeredMap(initial);

            // Modify original
            initial.a = 'modified';
            initial.count = 999;

            // Map should be unaffected
            expect(map.projectFlatMap(map.rootID)).toEqual({
                a: 'original',
                count: 1,
            });
        });
    });

    describe('rootID', () => {
        it('should return consistent root ID', () => {
            const rootId1 = layeredMap.rootID;
            const rootId2 = layeredMap.rootID;

            expect(rootId1).toBe(rootId2);
            expect(typeof rootId1).toBe('string');
            expect(rootId1.length).toBeGreaterThan(0);
        });

        it('should be valid UUID format', () => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(layeredMap.rootID).toMatch(uuidRegex);
        });
    });

    describe('addFrame', () => {
        it('should add child frame to root', () => {
            const childId = layeredMap.addFrame(layeredMap.rootID);

            expect(childId).toBeDefined();
            expect(childId).not.toBe(layeredMap.rootID);
            expect(typeof childId).toBe('string');
        });

        it('should generate unique frame IDs', () => {
            const child1 = layeredMap.addFrame(layeredMap.rootID);
            const child2 = layeredMap.addFrame(layeredMap.rootID);
            const child3 = layeredMap.addFrame(layeredMap.rootID);

            expect(child1).not.toBe(child2);
            expect(child2).not.toBe(child3);
            expect(child1).not.toBe(child3);
        });

        it('should add child frame to existing child', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);
            const grandchild = layeredMap.addFrame(child);

            expect(grandchild).toBeDefined();
            expect(grandchild).not.toBe(child);
            expect(grandchild).not.toBe(layeredMap.rootID);
        });

        it('should create deep hierarchies', () => {
            let currentId = layeredMap.rootID;
            const depth = 10;
            const frameIds: string[] = [currentId];

            for (let i = 0; i < depth; i++) {
                currentId = layeredMap.addFrame(currentId);
                frameIds.push(currentId);
            }

            expect(frameIds).toHaveLength(depth + 1);
            expect(new Set(frameIds).size).toBe(depth + 1); // All unique
        });

        it('should throw error for non-existent parent ID', () => {
            expect(() => {
                layeredMap.addFrame('non-existent-id');
            }).toThrow('UndefinedError: Frame with ID "non-existent-id" doesn\'t exist');
        });

        it('should throw error for empty parent ID', () => {
            expect(() => {
                layeredMap.addFrame('');
            }).toThrow('UndefinedError: Frame with ID "" doesn\'t exist');
        });

        it('should handle adding many children to same parent', () => {
            const parent = layeredMap.addFrame(layeredMap.rootID);
            const children: string[] = [];

            for (let i = 0; i < 100; i++) {
                const child = layeredMap.addFrame(parent);
                children.push(child);
            }

            expect(children).toHaveLength(100);
            expect(new Set(children).size).toBe(100); // All unique
        });
    });

    describe('removeFrame', () => {
        it('should remove leaf frame', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);

            expect(() => {
                layeredMap.removeFrame(child);
            }).not.toThrow();
        });

        it('should throw error when removing root frame', () => {
            expect(() => {
                layeredMap.removeFrame(layeredMap.rootID);
            }).toThrow('InvalidOperationError: Cannot remove root frame');
        });

        it('should throw error when removing non-existent frame', () => {
            expect(() => {
                layeredMap.removeFrame('non-existent');
            }).toThrow('UndefinedError: Frame with ID "non-existent" doesn\'t exist');
        });

        it('should throw error when removing frame with children', () => {
            const parent = layeredMap.addFrame(layeredMap.rootID);
            const child = layeredMap.addFrame(parent);

            expect(() => {
                layeredMap.removeFrame(parent);
            }).toThrow('InvalidOperationError: Frame has child frames');
        });

        it('should allow removal after children are removed', () => {
            const parent = layeredMap.addFrame(layeredMap.rootID);
            const child = layeredMap.addFrame(parent);

            // Remove child first
            layeredMap.removeFrame(child);

            // Now parent can be removed
            expect(() => {
                layeredMap.removeFrame(parent);
            }).not.toThrow();
        });

        it('should handle removal of deep hierarchies bottom-up', () => {
            let currentId = layeredMap.rootID;
            const frameIds: string[] = [];

            // Create deep hierarchy
            for (let i = 0; i < 5; i++) {
                currentId = layeredMap.addFrame(currentId);
                frameIds.push(currentId);
            }

            // Remove from leaf to root direction
            for (let i = frameIds.length - 1; i >= 0; i--) {
                expect(() => {
                    layeredMap.removeFrame(frameIds[i]);
                }).not.toThrow();
            }
        });

        it('should handle removal of siblings', () => {
            const parent = layeredMap.addFrame(layeredMap.rootID);
            const child1 = layeredMap.addFrame(parent);
            const child2 = layeredMap.addFrame(parent);
            const child3 = layeredMap.addFrame(parent);

            // Remove middle child
            layeredMap.removeFrame(child2);

            // Other children should still be removable
            layeredMap.removeFrame(child1);
            layeredMap.removeFrame(child3);

            // Parent should now be removable
            layeredMap.removeFrame(parent);
        });
    });

    describe('updateFrameKeyMap', () => {
        it('should update root frame key map', () => {
            layeredMap.updateFrameKeyMap(layeredMap.rootID, {
                a: 'updated-a',
                c: 'new-c',
            });

            expect(layeredMap.projectFlatMap(layeredMap.rootID)).toEqual({
                a: 'updated-a',
                c: 'new-c',
            });
        });

        it('should update child frame key map', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);

            layeredMap.updateFrameKeyMap(child, {
                b: 'child-b',
                d: 'child-d',
            });

            expect(layeredMap.projectFlatMap(child)).toEqual({
                a: 'root-a', // inherited
                b: 'child-b', // overridden
                d: 'child-d', // new
            });
        });

        it('should throw error for non-existent frame', () => {
            expect(() => {
                layeredMap.updateFrameKeyMap('non-existent', { a: 'test' });
            }).toThrow('UndefinedError: Frame with ID "non-existent" doesn\'t exist');
        });

        it('should handle empty key map updates', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);

            layeredMap.updateFrameKeyMap(child, {});

            expect(layeredMap.projectFlatMap(child)).toEqual({
                a: 'root-a',
                b: 'root-b',
            });
        });

        it('should handle large key map updates', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);
            const largeMap: any = {};

            for (let i = 0; i < 1000; i++) {
                largeMap[`key${i}`] = `value${i}`;
            }

            layeredMap.updateFrameKeyMap(child, largeMap);

            const projection = layeredMap.projectFlatMap(child);
            expect(Object.keys(projection)).toHaveLength(1002); // 1000 + 2 inherited
            expect(projection.key500).toBe('value500');
        });

        it('should create deep copy of provided key map', () => {
            const child = layeredMap.addFrame(layeredMap.rootID);
            const keyMap = { a: 'test', count: 42 };

            layeredMap.updateFrameKeyMap(child, keyMap);

            // Modify original
            keyMap.a = 'modified';
            keyMap.count = 999;

            // Frame should be unaffected
            const projection = layeredMap.projectFlatMap(child);
            expect(projection.a).toBe('test');
            expect(projection.count).toBe(42);
        });
    });

    describe('projectFlatMap', () => {
        it('should project root frame correctly', () => {
            expect(layeredMap.projectFlatMap(layeredMap.rootID)).toEqual({
                a: 'root-a',
                b: 'root-b',
            });
        });

        it('should throw error for non-existent frame', () => {
            expect(() => {
                layeredMap.projectFlatMap('non-existent');
            }).toThrow('UndefinedError: Frame with ID "non-existent" doesn\'t exist');
        });

        it('should handle variable shadowing correctly', () => {
            const level1 = layeredMap.addFrame(layeredMap.rootID);
            const level2 = layeredMap.addFrame(level1);

            layeredMap.updateFrameKeyMap(level1, {
                a: 'level1-a',
                c: 'level1-c',
            });

            layeredMap.updateFrameKeyMap(level2, {
                a: 'level2-a',
                d: 'level2-d',
            });

            expect(layeredMap.projectFlatMap(level2)).toEqual({
                a: 'level2-a', // shadowed by level2
                b: 'root-b', // inherited from root
                c: 'level1-c', // inherited from level1
                d: 'level2-d', // from level2
            });
        });

        it('should handle deep inheritance chains', () => {
            let currentId = layeredMap.rootID;
            const depth = 5;

            for (let i = 1; i <= depth; i++) {
                currentId = layeredMap.addFrame(currentId);
                layeredMap.updateFrameKeyMap(currentId, {
                    [`level${i}`]: `value${i}`,
                    a: `level${i}-a`, // Shadow previous values
                });
            }

            const projection = layeredMap.projectFlatMap(currentId);

            expect(projection.a).toBe('level5-a'); // Final shadow
            expect(projection.b).toBe('root-b'); // Inherited from root

            for (let i = 1; i <= depth; i++) {
                expect(projection[`level${i}` as keyof TestMapType]).toBe(`value${i}`);
            }
        });

        it('should handle complex branching with multiple children', () => {
            const level1a = layeredMap.addFrame(layeredMap.rootID);
            const level1b = layeredMap.addFrame(layeredMap.rootID);
            const level2a = layeredMap.addFrame(level1a);
            const level2b = layeredMap.addFrame(level1b);

            layeredMap.updateFrameKeyMap(level1a, { a: 'branch-a', c: 'from-1a' });
            layeredMap.updateFrameKeyMap(level1b, { a: 'branch-b', d: 'from-1b' });
            layeredMap.updateFrameKeyMap(level2a, { e: 'leaf-a' });
            layeredMap.updateFrameKeyMap(level2b, { e: 'leaf-b' });

            expect(layeredMap.projectFlatMap(level2a)).toEqual({
                a: 'branch-a',
                b: 'root-b',
                c: 'from-1a',
                e: 'leaf-a',
            });

            expect(layeredMap.projectFlatMap(level2b)).toEqual({
                a: 'branch-b',
                b: 'root-b',
                d: 'from-1b',
                e: 'leaf-b',
            });
        });

        it('should handle empty frames in hierarchy', () => {
            const level1 = layeredMap.addFrame(layeredMap.rootID);
            const level2 = layeredMap.addFrame(level1);
            const level3 = layeredMap.addFrame(level2);

            // Only update level1 and level3, leave level2 empty
            layeredMap.updateFrameKeyMap(level1, { c: 'level1-c' });
            layeredMap.updateFrameKeyMap(level3, { d: 'level3-d' });

            expect(layeredMap.projectFlatMap(level3)).toEqual({
                a: 'root-a',
                b: 'root-b',
                c: 'level1-c',
                d: 'level3-d',
            });
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle the reference diagram scenario', () => {
            // Create the complex structure from the reference
            const level1 = layeredMap.addFrame(layeredMap.rootID);
            const level2a = layeredMap.addFrame(level1);
            const level2b = layeredMap.addFrame(layeredMap.rootID);
            const level2c = layeredMap.addFrame(layeredMap.rootID);
            const level3 = layeredMap.addFrame(level2c);

            // Set up the key maps as per reference
            layeredMap.updateFrameKeyMap(layeredMap.rootID, {
                a: 'a',
                b: 'b',
                c: 'c',
                d: 'd',
                name: 'i',
            });
            layeredMap.updateFrameKeyMap(level1, {
                c: 'e',
                d: 'f',
                e: 'h',
            });
            layeredMap.updateFrameKeyMap(level2a, {
                d: 'g',
            });
            layeredMap.updateFrameKeyMap(level2b, {
                value: 'j',
                count: 'k' as any,
            });
            layeredMap.updateFrameKeyMap(level2c, {
                name: 'l',
            });
            layeredMap.updateFrameKeyMap(level3, {
                value: 'm',
            });

            // Test projections
            expect(layeredMap.projectFlatMap(level2a)).toMatchObject({
                a: 'a',
                b: 'b',
                c: 'e',
                d: 'g',
                e: 'h',
                name: 'i',
            });

            expect(layeredMap.projectFlatMap(level3)).toMatchObject({
                a: 'a',
                b: 'b',
                c: 'c',
                d: 'd',
                name: 'l',
                value: 'm',
            });
        });

        it('should maintain consistency during frame lifecycle', () => {
            // Create and populate hierarchy
            const child1 = layeredMap.addFrame(layeredMap.rootID);
            const child2 = layeredMap.addFrame(child1);
            const child3 = layeredMap.addFrame(child2);

            layeredMap.updateFrameKeyMap(child1, { a: 'child1' });
            layeredMap.updateFrameKeyMap(child2, { b: 'child2' });
            layeredMap.updateFrameKeyMap(child3, { c: 'child3' });

            // Verify deep projection
            expect(layeredMap.projectFlatMap(child3)).toEqual({
                a: 'child1',
                b: 'child2',
                c: 'child3',
            });

            // Remove frames bottom-up
            layeredMap.removeFrame(child3);
            expect(layeredMap.projectFlatMap(child2)).toEqual({
                a: 'child1',
                b: 'child2',
            });

            layeredMap.removeFrame(child2);
            expect(layeredMap.projectFlatMap(child1)).toEqual({
                a: 'child1',
                b: 'root-b',
            });

            layeredMap.removeFrame(child1);
            expect(layeredMap.projectFlatMap(layeredMap.rootID)).toEqual({
                a: 'root-a',
                b: 'root-b',
            });
        });
    });

    describe('Performance and Memory', () => {
        it('should handle large numbers of frames efficiently', () => {
            const startTime = performance.now();
            const frameCount = 1000;
            const frames: string[] = [];

            // Create many sibling frames
            for (let i = 0; i < frameCount; i++) {
                const frame = layeredMap.addFrame(layeredMap.rootID);
                layeredMap.updateFrameKeyMap(frame, { [`key${i}`]: `value${i}` });
                frames.push(frame);
            }

            // Test projection performance
            for (const frame of frames) {
                const projection = layeredMap.projectFlatMap(frame);
                expect(projection[`key${frames.indexOf(frame)}`]).toBeDefined();
            }

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(2000); // Should be reasonably fast
        });

        it('should handle deep hierarchies efficiently', () => {
            let currentId = layeredMap.rootID;
            const depth = 100;

            const startTime = performance.now();

            for (let i = 0; i < depth; i++) {
                currentId = layeredMap.addFrame(currentId);
                layeredMap.updateFrameKeyMap(currentId, { [`level${i}`]: i });
            }

            const projection = layeredMap.projectFlatMap(currentId);
            expect(Object.keys(projection)).toHaveLength(depth + 2); // depth + original 2

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
});
