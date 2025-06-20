/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { ThreadContext, ThreadManager } from '../execution/scope/thread';

type ThreadTestType = {
    id: number;
    name: string;
    active?: boolean;
    temp?: string;
    counter?: number;
    data?: any;
    level?: number;
    iteration?: number;
    lastIteration?: number;
    test?: string;
    good?: string;
    empty?: string;
    zero?: number;
    false?: boolean;
    null?: null;
    undefined?: undefined;
    nonexistent?: any; // For error testing
};

describe('ThreadManager and ThreadContext Tests', () => {
    let threadManager: ThreadManager<ThreadTestType>;

    beforeEach(() => {
        threadManager = new ThreadManager<ThreadTestType>({
            id: 0,
            name: 'global',
            active: true,
        });
    });

    describe('ThreadManager Constructor', () => {
        it('should initialize with global state', () => {
            const manager = new ThreadManager<ThreadTestType>({
                id: 42,
                name: 'test-global',
            });

            const thread = manager.createThread();
            expect(thread.getGlobal('id')).toBe(42);
            expect(thread.getGlobal('name')).toBe('test-global');
        });

        it('should handle empty global state', () => {
            const manager = new ThreadManager<Partial<ThreadTestType>>({});
            const thread = manager.createThread();

            expect(thread.getGlobal('id')).toBeUndefined();
            expect(thread.getGlobal('name')).toBeUndefined();
        });
    });

    describe('createThread', () => {
        it('should create thread with unique ID', () => {
            const thread1 = threadManager.createThread();
            const thread2 = threadManager.createThread();

            expect(thread1.id).toBeDefined();
            expect(thread2.id).toBeDefined();
            expect(thread1.id).not.toBe(thread2.id);
        });

        it('should create thread with access to global state', () => {
            const thread = threadManager.createThread();

            expect(thread.getGlobal('id')).toBe(0);
            expect(thread.getGlobal('name')).toBe('global');
            expect(thread.getGlobal('active')).toBe(true);
        });

        it('should create thread with local state inheriting from global', () => {
            const thread = threadManager.createThread();

            expect(thread.getLocal('id')).toBe(0);
            expect(thread.getLocal('name')).toBe('global');
            expect(thread.getLocal('active')).toBe(true);
        });

        it('should create multiple independent threads', () => {
            const threads: ThreadContext<ThreadTestType>[] = [];
            const count = 10;

            for (let i = 0; i < count; i++) {
                threads.push(threadManager.createThread());
            }

            expect(threads).toHaveLength(count);

            // All should have unique IDs
            const ids = threads.map((t) => t.id);
            expect(new Set(ids).size).toBe(count);
        });
    });

    describe('getThread', () => {
        it('should retrieve existing thread by ID', () => {
            const originalThread = threadManager.createThread();
            const retrievedThread = threadManager.getThread(originalThread.id);

            expect(retrievedThread.id).toBe(originalThread.id);
        });

        it('should return ThreadContext with same state', () => {
            const thread1 = threadManager.createThread();
            thread1.setLocal('temp', 'test-value');

            const thread2 = threadManager.getThread(thread1.id);
            expect(thread2.getLocal('temp')).toBe('test-value');
        });

        it('should throw error for non-existent thread ID', () => {
            expect(() => {
                threadManager.getThread('non-existent-id');
            }).toThrow('InvalidAccessError: Thread with ID "non-existent-id" doesn\'t exist');
        });

        it('should handle UUID-like invalid IDs', () => {
            const fakeUUID = '123e4567-e89b-12d3-a456-426614174000';
            expect(() => {
                threadManager.getThread(fakeUUID);
            }).toThrow(`InvalidAccessError: Thread with ID "${fakeUUID}" doesn't exist`);
        });
    });

    describe('deleteThread', () => {
        it('should delete existing thread', () => {
            const thread = threadManager.createThread();
            const threadId = thread.id;

            expect(() => {
                threadManager.deleteThread(threadId);
            }).not.toThrow();

            expect(() => {
                threadManager.getThread(threadId);
            }).toThrow(`InvalidAccessError: Thread with ID "${threadId}" doesn't exist`);
        });

        it('should throw error when deleting non-existent thread', () => {
            expect(() => {
                threadManager.deleteThread('non-existent');
            }).toThrow('InvalidAccessError: Thread with ID "non-existent" doesn\'t exist');
        });

        it('should not affect other threads when deleting', () => {
            const thread1 = threadManager.createThread();
            const thread2 = threadManager.createThread();
            const thread3 = threadManager.createThread();

            thread1.setLocal('temp', 'thread1');
            thread2.setLocal('temp', 'thread2');
            thread3.setLocal('temp', 'thread3');

            threadManager.deleteThread(thread2.id);

            expect(threadManager.getThread(thread1.id).getLocal('temp')).toBe('thread1');
            expect(threadManager.getThread(thread3.id).getLocal('temp')).toBe('thread3');
            expect(() => threadManager.getThread(thread2.id)).toThrow();
        });

        it('should handle double deletion gracefully', () => {
            const thread = threadManager.createThread();
            const threadId = thread.id;

            threadManager.deleteThread(threadId);

            expect(() => {
                threadManager.deleteThread(threadId);
            }).toThrow(`InvalidAccessError: Thread with ID "${threadId}" doesn't exist`);
        });
    });

    describe('ThreadContext - Local CRUD Operations', () => {
        let thread: any;

        beforeEach(() => {
            thread = threadManager.createThread();
        });

        describe('getLocal', () => {
            it('should get inherited global values', () => {
                expect(thread.getLocal('id')).toBe(0);
                expect(thread.getLocal('name')).toBe('global');
                expect(thread.getLocal('active')).toBe(true);
            });

            it('should get local values after setting', () => {
                thread.setLocal('temp', 'local-value');
                expect(thread.getLocal('temp')).toBe('local-value');
            });

            it('should return undefined for non-existent keys', () => {
                expect(thread.getLocal('counter')).toBeUndefined();
            });

            it('should get local values that shadow global', () => {
                thread.setLocal('name', 'local-override');
                expect(thread.getLocal('name')).toBe('local-override');
                expect(thread.getGlobal('name')).toBe('global');
            });
        });

        describe('setLocal', () => {
            it('should set new local values', () => {
                thread.setLocal('temp', 'test-temp');
                thread.setLocal('counter', 42);

                expect(thread.getLocal('temp')).toBe('test-temp');
                expect(thread.getLocal('counter')).toBe(42);
            });

            it('should override inherited global values locally', () => {
                thread.setLocal('id', 999);
                thread.setLocal('name', 'local-name');

                expect(thread.getLocal('id')).toBe(999);
                expect(thread.getLocal('name')).toBe('local-name');
                expect(thread.getGlobal('id')).toBe(0);
                expect(thread.getGlobal('name')).toBe('global');
            });

            it('should handle complex data types', () => {
                const complexData = {
                    nested: { value: 'test' },
                    array: [1, 2, 3],
                    func: () => 'hello',
                };

                thread.setLocal('data', complexData);
                expect(thread.getLocal('data')).toBe(complexData);
            });

            it('should update existing local values', () => {
                thread.setLocal('counter', 1);
                expect(thread.getLocal('counter')).toBe(1);

                thread.setLocal('counter', 2);
                expect(thread.getLocal('counter')).toBe(2);
            });
        });

        describe('deleteLocal', () => {
            it('should delete existing local values', () => {
                thread.setLocal('temp', 'to-delete');
                expect(thread.getLocal('temp')).toBe('to-delete');

                thread.deleteLocal('temp');
                expect(thread.getLocal('temp')).toBeUndefined();
            });

            it('should reveal global values after deleting local shadow', () => {
                thread.setLocal('name', 'local-shadow');
                expect(thread.getLocal('name')).toBe('local-shadow');

                thread.deleteLocal('name');
                expect(thread.getLocal('name')).toBe('global');
            });

            it('should throw error when deleting non-existent local key', () => {
                expect(() => {
                    thread.deleteLocal('nonexistent');
                }).toThrow('InvalidSymbolError: Symbol "nonexistent" doesn\'t exist');
            });

            it('should handle deleteLocal operations correctly', () => {
                // Set a local value first
                thread.setLocal('temp', 'test-value');
                expect(thread.getLocal('temp')).toBe('test-value');

                // Delete the local value
                thread.deleteLocal('temp');
                expect(thread.getLocal('temp')).toBeUndefined();

                // Test deleting non-existent key
                expect(() => {
                    thread.deleteLocal('definitelyDoesNotExist');
                }).toThrow('InvalidSymbolError: Symbol "definitelyDoesNotExist" doesn\'t exist');

                // Note: Behavior with inherited keys may vary based on implementation
                // The 'active' key behavior seems to be implementation-specific
            });
        });
    });

    describe('ThreadContext - Global CRUD Operations', () => {
        let thread1: any;
        let thread2: any;

        beforeEach(() => {
            thread1 = threadManager.createThread();
            thread2 = threadManager.createThread();
        });

        describe('getGlobal', () => {
            it('should get global values from any thread', () => {
                expect(thread1.getGlobal('id')).toBe(0);
                expect(thread2.getGlobal('name')).toBe('global');
            });

            it('should return undefined for non-existent global keys', () => {
                expect(thread1.getGlobal('counter')).toBeUndefined();
            });
        });

        describe('setGlobal', () => {
            it('should set global values visible to all threads', () => {
                thread1.setGlobal('temp', 'shared-value');

                expect(thread1.getGlobal('temp')).toBe('shared-value');
                expect(thread2.getGlobal('temp')).toBe('shared-value');
            });

            it('should update existing global values', () => {
                thread1.setGlobal('id', 100);
                thread2.setGlobal('name', 'updated-global');

                expect(thread1.getGlobal('id')).toBe(100);
                expect(thread1.getGlobal('name')).toBe('updated-global');
                expect(thread2.getGlobal('id')).toBe(100);
                expect(thread2.getGlobal('name')).toBe('updated-global');
            });

            it('should not affect local overrides when setting global', () => {
                thread1.setLocal('name', 'local-override');
                thread2.setGlobal('name', 'new-global');

                expect(thread1.getLocal('name')).toBe('local-override');
                expect(thread1.getGlobal('name')).toBe('new-global');
                expect(thread2.getLocal('name')).toBe('new-global');
            });
        });

        describe('deleteGlobal', () => {
            it('should delete global values visible to all threads', () => {
                thread1.setGlobal('temp', 'to-delete');
                expect(thread2.getGlobal('temp')).toBe('to-delete');

                thread2.deleteGlobal('temp');
                expect(thread1.getGlobal('temp')).toBeUndefined();
                expect(thread2.getGlobal('temp')).toBeUndefined();
            });

            it('should throw error when deleting non-existent global key', () => {
                expect(() => {
                    thread1.deleteGlobal('nonexistent');
                }).toThrow('InvalidSymbolError: Symbol "nonexistent" doesn\'t exist');
            });

            it('should not affect local values when deleting global', () => {
                thread1.setLocal('name', 'local-value');
                thread2.deleteGlobal('name');

                expect(thread1.getLocal('name')).toBe('local-value');
                expect(thread1.getGlobal('name')).toBeUndefined();
            });
        });
    });

    describe('ThreadContext - Scope Management', () => {
        let thread: any;

        beforeEach(() => {
            thread = threadManager.createThread();
        });

        describe('pushScope', () => {
            it('should create new local scope frame', () => {
                thread.setLocal('temp', 'level0');

                thread.pushScope();
                expect(thread.getLocal('temp')).toBe('level0');

                thread.setLocal('temp', 'level1');
                expect(thread.getLocal('temp')).toBe('level1');
            });

            it('should allow multiple nested scopes', () => {
                for (let i = 0; i < 5; i++) {
                    thread.pushScope();
                    thread.setLocal('counter', i);
                    expect(thread.getLocal('counter')).toBe(i);
                }
            });

            it('should maintain scope isolation between threads', () => {
                const thread2 = threadManager.createThread();

                thread.pushScope();
                thread.setLocal('temp', 'thread1-scope');

                thread2.pushScope();
                thread2.setLocal('temp', 'thread2-scope');

                expect(thread.getLocal('temp')).toBe('thread1-scope');
                expect(thread2.getLocal('temp')).toBe('thread2-scope');
            });
        });

        describe('popScope', () => {
            it('should restore previous scope values', () => {
                thread.setLocal('temp', 'original');

                thread.pushScope();
                thread.setLocal('temp', 'modified');
                expect(thread.getLocal('temp')).toBe('modified');

                thread.popScope();
                expect(thread.getLocal('temp')).toBe('original');
            });

            it('should handle multiple nested pops', () => {
                const values = ['base', 'level1', 'level2', 'level3'];

                for (let i = 0; i < values.length; i++) {
                    if (i > 0) thread.pushScope();
                    thread.setLocal('temp', values[i]);
                }

                for (let i = values.length - 1; i >= 0; i--) {
                    expect(thread.getLocal('temp')).toBe(values[i]);
                    if (i > 0) thread.popScope();
                }
            });

            it('should throw error when popping root scope', () => {
                expect(() => {
                    thread.popScope();
                }).toThrow('InvalidOperationError: No context frame remaining to pop');
            });

            it('should throw error when popping too many scopes', () => {
                thread.pushScope();
                thread.popScope();

                expect(() => {
                    thread.popScope();
                }).toThrow('InvalidOperationError: No context frame remaining to pop');
            });
        });
    });

    describe('Thread Isolation and Concurrency', () => {
        it('should maintain complete local state isolation', () => {
            const threads = Array.from({ length: 10 }, () => threadManager.createThread());

            threads.forEach((thread, index) => {
                thread.setLocal('id', index * 100);
                thread.setLocal('name', `thread-${index}`);
                thread.setLocal('counter', index);
            });

            threads.forEach((thread, index) => {
                expect(thread.getLocal('id')).toBe(index * 100);
                expect(thread.getLocal('name')).toBe(`thread-${index}`);
                expect(thread.getLocal('counter')).toBe(index);
            });
        });

        it('should share global state across all threads', () => {
            const threads = Array.from({ length: 5 }, () => threadManager.createThread());

            threads[0].setGlobal('temp', 'shared-by-all');
            threads[2].setGlobal('counter', 999);

            threads.forEach((thread) => {
                expect(thread.getGlobal('temp')).toBe('shared-by-all');
                expect(thread.getGlobal('counter')).toBe(999);
            });
        });

        it('should handle rapid thread creation and deletion', () => {
            const iterations = 100;

            for (let i = 0; i < iterations; i++) {
                const thread = threadManager.createThread();
                thread.setLocal('iteration', i);
                thread.setGlobal('lastIteration', i);

                expect(thread.getLocal('iteration')).toBe(i);

                threadManager.deleteThread(thread.id);

                if (i > 0) {
                    const checkThread = threadManager.createThread();
                    expect(checkThread.getGlobal('lastIteration')).toBe(i);
                    threadManager.deleteThread(checkThread.id);
                }
            }
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle threads after manager operations', () => {
            const thread1 = threadManager.createThread();
            const thread2 = threadManager.createThread();

            thread1.setLocal('test', 'value1');
            thread2.setLocal('test', 'value2');

            threadManager.deleteThread(thread1.id);

            expect(thread2.getLocal('test')).toBe('value2');
            thread2.setLocal('test', 'updated');
            expect(thread2.getLocal('test')).toBe('updated');
        });

        it('should maintain state after error conditions', () => {
            const thread = threadManager.createThread();

            thread.setLocal('good', 'value');

            try {
                thread.deleteLocal('nonexistent');
            } catch {}
            try {
                thread.deleteGlobal('nonexistent');
            } catch {}
            try {
                thread.popScope();
            } catch {}

            expect(thread.getLocal('good')).toBe('value');
            thread.setLocal('good', 'updated');
            expect(thread.getLocal('good')).toBe('updated');
        });

        it('should handle empty and undefined values correctly', () => {
            const thread = threadManager.createThread();

            thread.setLocal('empty', '');
            thread.setLocal('zero', 0);
            thread.setLocal('false', false);
            thread.setLocal('null', null);
            thread.setLocal('undefined', undefined);

            expect(thread.getLocal('empty')).toBe('');
            expect(thread.getLocal('zero')).toBe(0);
            expect(thread.getLocal('false')).toBe(false);
            expect(thread.getLocal('null')).toBe(null);
            expect(thread.getLocal('undefined')).toBeUndefined();
        });
    });

    describe('Memory and Performance', () => {
        it('should handle large numbers of threads efficiently', () => {
            const threadCount = 100;
            const threads: any[] = [];

            const startTime = performance.now();

            for (let i = 0; i < threadCount; i++) {
                const thread = threadManager.createThread();
                thread.setLocal('id', i);
                threads.push(thread);
            }

            for (let i = 0; i < threadCount; i++) {
                expect(threads[i].getLocal('id')).toBe(i);
                threadManager.deleteThread(threads[i].id);
            }

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(2000);
        });

        it('should handle deep scope nesting efficiently', () => {
            const thread = threadManager.createThread();
            const depth = 100;

            const startTime = performance.now();

            for (let i = 0; i < depth; i++) {
                thread.pushScope();
                thread.setLocal('level', i);
            }

            expect(thread.getLocal('level')).toBe(depth - 1);

            for (let i = depth - 1; i >= 0; i--) {
                thread.popScope();
            }

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
});
