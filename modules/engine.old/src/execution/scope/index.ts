import { ContextManager } from './context';
import { SymbolTableManager } from './symbolTable';

// -- types ----------------------------------------------------------------------------------------

import type {
    IContext,
    IContextStack,
    IContextManager,
    ISymbolTable,
    ISymbolTableStack,
    ISymbolTableManager,
    IScopeStack,
} from '../../@types/scope';

// -- private variables ----------------------------------------------------------------------------

/** Stores the map of context managers by name of the context set. */
const _contextManagerMap: { [name: string]: ContextManager<Record<string, unknown>> } = {};
/** Stores symbol table manager instance. */
const _symbolTableManager: SymbolTableManager = new SymbolTableManager();

// -- private functions ----------------------------------------------------------------------------

/**
 * @private
 * Returns context manager instance by name.
 * @description
 * Only exposed for unit tests. Don't use anywhere else.
 * @param name context set name
 */
export function _getContextManager(name: string): IContextManager<Record<string, unknown>> {
    return _contextManagerMap[name];
}

/**
 * @private
 * Returns symbol table manager instance.
 * @description
 * Only exposed for unit tests. Don't use anywhere else.
 */
export function _getSymbolTableManager(): ISymbolTableManager {
    return _symbolTableManager;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Registers a context.
 * @param name context name
 * @param keyMap initial (global) key-value dictionary
 */
export function registerContext(name: string, keyMap: Record<string, unknown>): void {
    _contextManagerMap[name] = new ContextManager(keyMap);
}

/**
 * Deregisters a context.
 * @param name context name
 * @returns `true` if successfully deregistered, else `false`
 */
export function deregisterContext(name: string): boolean {
    if (!(name in _contextManagerMap)) return false;

    delete _contextManagerMap[name];

    return true;
}

/**
 * Returns whether a context is already registered.
 * @param name context name
 */
export function hasContext(name: string): boolean {
    return name in _contextManagerMap;
}

/**
 * Adds new global symbol.
 * @param name symbol name
 * @param entry symbol entry
 */
export const addGlobalSymbol = _symbolTableManager.addGlobalSymbol.bind(_symbolTableManager);

/**
 * Returns existing global symbol by name.
 * @param name symbol name
 * @returns symbol entry if present else `undefined`
 */
export const getGlobalSymbol = _symbolTableManager.getGlobalSymbol.bind(_symbolTableManager);

/**
 * Removes existing global symbol by name.
 * @param name symbol name
 * @throws InvalidSymbolError if symbol doesn't exist
 */
export const removeGlobalSymbol = _symbolTableManager.removeGlobalSymbol.bind(_symbolTableManager);

/**
 * Lists global symbol table as key-value dictionary.
 * @param orderBy whether to list by name or grouped by type
 * @returns a JSON object of key-value pairs
 */
export const listGlobalSymbols = _symbolTableManager.listGlobalSymbols.bind(_symbolTableManager);

// -- private classes ------------------------------------------------------------------------------

/**
 * @class
 * Defines a `Scope` stack.
 * @description
 * Handles the creation, querying, and removal of individual context frames per context set and
 * frames of its symbol table.
 */
export class ScopeStack implements IScopeStack {
    /** Stores the map of context stack instances by context set name. */
    private _contextStackMap: { [name: string]: IContextStack<Record<string, unknown>> } = {};
    /** Stores the symbol table stack instance. */
    private _symbolTableStack: ISymbolTableStack;

    // == public ===========================================

    /**
     * @constructor
     * Creates a scope stack.
     * @param contextStackMap map of context stack instances by context set name
     * @param symbolTableStack symbol table stack instance
     */
    constructor(
        contextStackMap?: { [name: string]: IContextStack<Record<string, unknown>> },
        symbolTableStack?: ISymbolTableStack,
    ) {
        if (!contextStackMap) contextStackMap = {};

        Object.entries(_contextManagerMap).forEach(([name, contextManager]) => {
            this._contextStackMap[name] =
                name in contextStackMap!
                    ? contextStackMap![name]
                    : contextManager.createContextStack();
        });

        this._symbolTableStack = symbolTableStack
            ? symbolTableStack
            : _symbolTableManager.createSymbolTableStack();
    }

    public getContext(name: string): IContext<Record<string, unknown>> {
        if (!(name in this._contextStackMap)) {
            throw Error(`InvalidAccessError: Context "${name}" doesn't exist`);
        }

        return this._contextStackMap[name];
    }

    public getSymbolTable(): ISymbolTable {
        return this._symbolTableStack;
    }

    public pushFrame(): void {
        Object.values(this._contextStackMap).forEach((contextStack) => contextStack.pushFrame());
        this._symbolTableStack.pushFrame();
    }

    public popFrame(): void {
        Object.values(this._contextStackMap).forEach((contextStack) => contextStack.popFrame());
        this._symbolTableStack.popFrame();
    }
}
