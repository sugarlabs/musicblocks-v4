import { ContextManager } from './context';
import type {
    IThreadManager,
    IThreadContext,
    IContextStack,
    IContextManager,
} from '../../@types/scope';

/**
 * A thin façade over a single ContextStack, exposing local & global CRUD plus push/pop.
 */
export class ThreadContext<T extends object> implements IThreadContext<T> {
    public readonly id: string;
    private readonly _stack: IContextStack<T>;
    private readonly _global: IContextManager<T>;

    constructor(id: string, stack: IContextStack<T>, global: IContextManager<T>) {
        this.id = id;
        this._stack = stack;
        this._global = global;
    }

    /** LOCAL */
    public getLocal<K extends keyof T>(key: K): T[K] | undefined {
        return this._stack.contextLocalKeyMap[key];
    }
    public setLocal<K extends keyof T>(key: K, value: T[K]): void {
        const cur = this._stack.contextLocalKeyMap;
        this._stack.contextLocalKeyMap = { ...cur, [key]: value };
    }
    public deleteLocal(key: keyof T): void {
        const cur = this._stack.contextLocalKeyMap;
        if (!((key as string) in cur)) {
            throw Error(`InvalidSymbolError: Symbol "${String(key)}" doesn't exist`);
        }
        const copy = { ...cur };
        delete (copy as Record<string, unknown>)[key as string];
        this._stack.contextLocalKeyMap = copy as T;
    }

    /** SCOPE */
    public pushScope(): void {
        this._stack.pushFrame();
    }
    public popScope(): void {
        this._stack.popFrame();
    }

    /** GLOBAL */
    public getGlobal<K extends keyof T>(key: K): T[K] | undefined {
        return this._global.contextGlobalKeyMap[key];
    }
    public setGlobal<K extends keyof T>(key: K, value: T[K]): void {
        const cur = this._global.contextGlobalKeyMap;
        this._global.updateContextGlobalKeyMap({ ...cur, [key]: value });
    }
    public deleteGlobal(key: keyof T): void {
        const cur = this._global.contextGlobalKeyMap;
        if (!((key as string) in cur)) {
            throw Error(`InvalidSymbolError: Symbol "${String(key)}" doesn't exist`);
        }
        const copy = { ...cur };
        delete (copy as Record<string, unknown>)[key as string];
        this._global.updateContextGlobalKeyMap(copy as T);
    }
}

/**
 * Manages multiple ThreadContexts, each with its own ContextStack.
 */
export class ThreadManager<T extends object> implements IThreadManager<T> {
    private readonly _global: IContextManager<T>;
    private readonly _threads: Record<string, IContextStack<T>> = {};

    constructor(initialGlobal: T) {
        this._global = new ContextManager<T>(initialGlobal);
    }

    public createThread(): ThreadContext<T> {
        const stack = this._global.createContextStack();
        this._threads[stack.contextID] = stack;
        return new ThreadContext<T>(stack.contextID, stack, this._global);
    }

    public getThread(threadID: string): ThreadContext<T> {
        const stack = this._threads[threadID];
        if (!stack) {
            throw Error(`InvalidAccessError: Thread with ID "${threadID}" doesn't exist`);
        }
        return new ThreadContext<T>(threadID, stack, this._global);
    }

    public deleteThread(threadID: string): void {
        if (!(threadID in this._threads)) {
            throw Error(`InvalidAccessError: Thread with ID "${threadID}" doesn't exist`);
        }
        this._global.removeContextStack(threadID);
        delete this._threads[threadID];
    }
}
