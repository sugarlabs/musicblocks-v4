/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { ContextManager } from '../execution/scope';

type TestType = {
    foo: number;
    bar: string;
    baz?: boolean;
    count?: number;
    name?: string;
};

describe('ContextManager Tests', () => {
    let contextManager: ContextManager<TestType>;

    beforeEach(() => {
        contextManager = new ContextManager<TestType>({
            foo: 10,
            bar: 'initial',
        });
    });

    describe('Constructor', () => {
        it('should initialize with provided keyMap', () => {
            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
            });
        });

        it('should handle empty keyMap', () => {
            const emptyManager = new ContextManager<Record<string, never>>({});
            expect(emptyManager.contextGlobalKeyMap).toEqual({});
        });

        it('should create deep copy of initial keyMap', () => {
            const originalMap = { foo: 1, bar: 'test' };
            const manager = new ContextManager(originalMap);

            // Modify original - should not affect manager
            originalMap.foo = 999;
            expect(manager.contextGlobalKeyMap.foo).toBe(1);
        });
    });

    describe('createContextStack', () => {
        it('should create new context stack with unique ID', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();

            expect(stack1.contextID).toBeDefined();
            expect(stack2.contextID).toBeDefined();
            expect(stack1.contextID).not.toBe(stack2.contextID);
        });

        it('should create stack with access to global context', () => {
            const stack = contextManager.createContextStack();
            expect(stack.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
            });
        });

        it('should create multiple stacks with same global context', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();

            expect(stack1.contextGlobalKeyMap).toEqual(stack2.contextGlobalKeyMap);
        });

        it('should register created stacks internally', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();

            // Should be able to retrieve them
            expect(contextManager.getContextStack(stack1.contextID)).toBe(stack1);
            expect(contextManager.getContextStack(stack2.contextID)).toBe(stack2);
        });
    });

    describe('getContextStack', () => {
        it('should return existing context stack by ID', () => {
            const stack = contextManager.createContextStack();
            const retrieved = contextManager.getContextStack(stack.contextID);

            expect(retrieved).toBe(stack);
            expect(retrieved.contextID).toBe(stack.contextID);
        });

        it('should throw error for non-existent context stack ID', () => {
            expect(() => {
                contextManager.getContextStack('non-existent-id');
            }).toThrow(
                'InvalidAccessError: Context stack with ID "non-existent-id" doesn\'t exist',
            );
        });

        it('should handle UUID-like non-existent IDs', () => {
            const fakeUUID = '123e4567-e89b-12d3-a456-426614174000';
            expect(() => {
                contextManager.getContextStack(fakeUUID);
            }).toThrow(`InvalidAccessError: Context stack with ID "${fakeUUID}" doesn't exist`);
        });
    });

    describe('removeContextStack', () => {
        it('should remove existing context stack', () => {
            const stack = contextManager.createContextStack();
            const stackID = stack.contextID;

            // Should exist before removal
            expect(contextManager.getContextStack(stackID)).toBe(stack);

            // Remove stack
            expect(() => {
                contextManager.removeContextStack(stackID);
            }).not.toThrow();

            // Should not exist after removal
            expect(() => {
                contextManager.getContextStack(stackID);
            }).toThrow(`InvalidAccessError: Context stack with ID "${stackID}" doesn't exist`);
        });

        it('should throw error when removing non-existent stack', () => {
            expect(() => {
                contextManager.removeContextStack('non-existent-id');
            }).toThrow(
                'InvalidAccessError: Context stack with ID "non-existent-id" doesn\'t exist',
            );
        });

        it('should allow removal of multiple stacks', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();
            const stack3 = contextManager.createContextStack();

            contextManager.removeContextStack(stack1.contextID);
            contextManager.removeContextStack(stack3.contextID);

            expect(() => contextManager.getContextStack(stack1.contextID)).toThrow();
            expect(() => contextManager.getContextStack(stack3.contextID)).toThrow();
            expect(contextManager.getContextStack(stack2.contextID)).toBe(stack2);
        });

        it('should handle double removal gracefully', () => {
            const stack = contextManager.createContextStack();
            const stackID = stack.contextID;

            contextManager.removeContextStack(stackID);

            expect(() => {
                contextManager.removeContextStack(stackID);
            }).toThrow(`InvalidAccessError: Context stack with ID "${stackID}" doesn't exist`);
        });
    });

    describe('contextGlobalKeyMap (getter)', () => {
        it('should return current global key map', () => {
            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
            });
        });

        it('should return updated global key map after updates', () => {
            contextManager.updateContextGlobalKeyMap({
                foo: 20,
                bar: 'updated',
                baz: true,
            });

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 20,
                bar: 'updated',
                baz: true,
            });
        });

        it('should return copy, not reference to internal data', () => {
            const globalMap = contextManager.contextGlobalKeyMap;
            globalMap.foo = 999;

            // Original should be unchanged
            expect(contextManager.contextGlobalKeyMap.foo).toBe(10);
        });
    });

    describe('updateContextGlobalKeyMap', () => {
        it('should update global key map without commit', () => {
            contextManager.updateContextGlobalKeyMap({
                foo: 25,
                bar: 'new-value',
                count: 5,
            });

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 25,
                bar: 'new-value',
                count: 5,
            });
        });

        it('should update global key map with commit', () => {
            contextManager.updateContextGlobalKeyMap(
                {
                    foo: 30,
                    bar: 'committed',
                    name: 'test',
                },
                true,
            );

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 30,
                bar: 'committed',
                name: 'test',
            });
        });

        it('should affect all existing context stacks', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();

            contextManager.updateContextGlobalKeyMap({
                foo: 100,
                bar: 'shared-update',
            });

            expect(stack1.contextGlobalKeyMap).toEqual({
                foo: 100,
                bar: 'shared-update',
            });
            expect(stack2.contextGlobalKeyMap).toEqual({
                foo: 100,
                bar: 'shared-update',
            });
        });

        it('should handle partial updates', () => {
            contextManager.updateContextGlobalKeyMap({
                foo: 10,
                bar: 'initial',
                baz: true,
            });

            // Partial update
            contextManager.updateContextGlobalKeyMap({
                foo: 15,
                bar: 'initial',
            });

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 15,
                bar: 'initial',
            });
        });

        it('should handle adding new properties', () => {
            contextManager.updateContextGlobalKeyMap({
                ...contextManager.contextGlobalKeyMap,
                count: 42,
                name: 'added',
            });

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
                count: 42,
                name: 'added',
            });
        });
    });

    describe('reset', () => {
        it('should reset to original state without commit', () => {
            // Make changes
            contextManager.updateContextGlobalKeyMap({
                foo: 999,
                bar: 'changed',
                baz: true,
            });

            const stack = contextManager.createContextStack();

            // Reset
            contextManager.reset();

            // Should be back to original
            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
            });

            // Stacks should be cleared
            expect(() => {
                contextManager.getContextStack(stack.contextID);
            }).toThrow();
        });

        it('should reset to committed state when commit was used', () => {
            // Update with commit
            contextManager.updateContextGlobalKeyMap(
                {
                    foo: 50,
                    bar: 'committed-value',
                    count: 10,
                },
                true,
            );

            // Make additional changes
            contextManager.updateContextGlobalKeyMap({
                foo: 999,
                bar: 'temporary',
                name: 'temp',
            });

            // Reset should go back to committed state
            contextManager.reset();

            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 50,
                bar: 'committed-value',
                count: 10,
            });
        });

        it('should clear all context stacks', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();
            const stack3 = contextManager.createContextStack();

            contextManager.reset();

            expect(() => contextManager.getContextStack(stack1.contextID)).toThrow();
            expect(() => contextManager.getContextStack(stack2.contextID)).toThrow();
            expect(() => contextManager.getContextStack(stack3.contextID)).toThrow();
        });

        it('should allow creating new stacks after reset', () => {
            contextManager.reset();

            const newStack = contextManager.createContextStack();
            expect(newStack.contextID).toBeDefined();
            expect(newStack.contextGlobalKeyMap).toEqual({
                foo: 10,
                bar: 'initial',
            });
        });
    });

    describe('Integration with ContextStack', () => {
        it('should maintain consistency between manager and stacks', () => {
            const stack = contextManager.createContextStack();

            // Update through manager
            contextManager.updateContextGlobalKeyMap({
                foo: 123,
                bar: 'manager-update',
            });

            // Stack should see the update
            expect(stack.contextGlobalKeyMap).toEqual({
                foo: 123,
                bar: 'manager-update',
            });

            // Update through stack
            stack.contextGlobalKeyMap = {
                foo: 456,
                bar: 'stack-update',
            };

            // Manager should see the update
            expect(contextManager.contextGlobalKeyMap).toEqual({
                foo: 456,
                bar: 'stack-update',
            });
        });

        it('should handle stack removal during active use', () => {
            const stack1 = contextManager.createContextStack();
            const stack2 = contextManager.createContextStack();

            // Use stacks
            stack1.contextLocalKeyMap = { ...stack1.contextLocalKeyMap, count: 1 };
            stack2.contextLocalKeyMap = { ...stack2.contextLocalKeyMap, count: 2 };

            // Remove one stack
            contextManager.removeContextStack(stack1.contextID);

            // Other stack should still work
            expect(stack2.contextLocalKeyMap.count).toBe(2);

            // Removed stack should be inaccessible
            expect(() => {
                contextManager.getContextStack(stack1.contextID);
            }).toThrow();
        });
    });

    describe('Memory and Performance', () => {
        it('should handle many context stacks efficiently', () => {
            const stacks: any[] = [];
            const count = 100;

            const startTime = performance.now();

            // Create many stacks
            for (let i = 0; i < count; i++) {
                const stack = contextManager.createContextStack();
                stacks.push(stack);
            }

            // Verify all created
            expect(stacks).toHaveLength(count);

            // Remove all stacks
            for (const stack of stacks) {
                contextManager.removeContextStack(stack.contextID);
            }

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(1000); // Should be fast
        });

        it('should handle large global key maps', () => {
            const largeKeyMap: any = {};
            for (let i = 0; i < 1000; i++) {
                largeKeyMap[`key${i}`] = `value${i}`;
            }

            const largeManager = new ContextManager(largeKeyMap);
            const stack = largeManager.createContextStack();

            expect(Object.keys(stack.contextGlobalKeyMap)).toHaveLength(1000);
            expect(stack.contextGlobalKeyMap.key500).toBe('value500');
        });
    });

    describe('Error Conditions', () => {
        it('should handle empty string IDs gracefully', () => {
            expect(() => {
                contextManager.getContextStack('');
            }).toThrow('InvalidAccessError: Context stack with ID "" doesn\'t exist');

            expect(() => {
                contextManager.removeContextStack('');
            }).toThrow('InvalidAccessError: Context stack with ID "" doesn\'t exist');
        });

        it('should handle special character IDs', () => {
            const specialIds = ['@#$%', '   ', '\n\t', '🚀'];

            for (const id of specialIds) {
                expect(() => {
                    contextManager.getContextStack(id);
                }).toThrow(`InvalidAccessError: Context stack with ID "${id}" doesn't exist`);
            }
        });

        it('should maintain state after errors', () => {
            const validStack = contextManager.createContextStack();

            // Try invalid operations
            try {
                contextManager.getContextStack('invalid');
            } catch {}
            try {
                contextManager.removeContextStack('invalid');
            } catch {}

            // Valid operations should still work
            expect(contextManager.getContextStack(validStack.contextID)).toBe(validStack);

            contextManager.updateContextGlobalKeyMap({
                foo: 42,
                bar: 'still-working',
            });

            expect(validStack.contextGlobalKeyMap).toEqual({
                foo: 42,
                bar: 'still-working',
            });
        });
    });
});
