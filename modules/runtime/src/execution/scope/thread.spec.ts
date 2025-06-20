import { describe, it, expect, beforeAll } from 'vitest';
import { ThreadManager, ThreadContext } from './thread';

type TThreadDummy = {
    foo: number;
    x?: number;
    y?: number;
    g?: string;
    a?: number;
};

// -------------------------------------------------------------------------------------------------

describe('Thread module', () => {
    let tm: ThreadManager<TThreadDummy>;
    let t1: ThreadContext<TThreadDummy>;
    let t2: ThreadContext<TThreadDummy>;

    beforeAll(() => {
        // initial global map = { foo: 1 }
        tm = new ThreadManager<TThreadDummy>({ foo: 1 });
    });

    it('creates a new thread context with initial globals', () => {
        t1 = tm.createThread();
        expect(t1.id).toBeDefined();
        expect(t1.getGlobal('foo')).toBe(1);
        expect(t1.getLocal('foo')).toBe(1);
    });

    it('throws when deleting a non-existent thread', () => {
        expect(() => tm.deleteThread('no-such-id')).toThrowError(
            `InvalidAccessError: Thread with ID "no-such-id" doesn't exist`,
        );
    });

    it('deletes an existing thread', () => {
        expect(() => tm.deleteThread(t1.id)).not.toThrowError();
        expect(() => tm.getThread(t1.id)).toThrowError(
            `InvalidAccessError: Thread with ID "${t1.id}" doesn't exist`,
        );
    });

    it('supports local CRUD in a thread', () => {
        t1 = tm.createThread();
        const xKey = 'x' as keyof TThreadDummy;
        t1.setLocal(xKey, 42);
        expect(t1.getLocal(xKey)).toBe(42);
        t1.deleteLocal(xKey);
        expect(t1.getLocal(xKey)).toBeUndefined();
    });

    it('supports push/pop of local scopes', () => {
        t1 = tm.createThread();
        t1.pushScope();
        const yKey = 'y' as keyof TThreadDummy;
        t1.setLocal(yKey, 99);
        expect(t1.getLocal(yKey)).toBe(99);
        t1.popScope();
        expect(t1.getLocal(yKey)).toBeUndefined();
        expect(() => t1.popScope()).toThrowError(
            'InvalidOperationError: No context frame remaining to pop',
        );
    });

    it('supports global CRUD via thread context', () => {
        t1 = tm.createThread();
        t2 = tm.createThread();
        const gKey = 'g' as keyof TThreadDummy;
        t1.setGlobal(gKey, 'hello');
        expect(t2.getGlobal(gKey)).toBe('hello');
        tm.deleteThread(t1.id);
        tm.deleteThread(t2.id);
    });

    it('isolates local scope across threads', () => {
        t1 = tm.createThread();
        t2 = tm.createThread();
        const aKey = 'a' as keyof TThreadDummy;
        t1.setLocal(aKey, 1);
        t2.setLocal(aKey, 2);
        expect(t1.getLocal(aKey)).toBe(1);
        expect(t2.getLocal(aKey)).toBe(2);
        tm.deleteThread(t1.id);
        tm.deleteThread(t2.id);
    });
});
