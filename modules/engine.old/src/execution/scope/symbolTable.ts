import { ContextManager } from './context';

// -- types ----------------------------------------------------------------------------------------

import type {
    IContextStack,
    ISymbolTableManager,
    ISymbolTableStack,
    TSymbolEntry,
    TSymbolTableKeyMap,
} from '../../@types/scope';

// -- public classes -------------------------------------------------------------------------------

/**
 * @class
 * Defines a `Symbol Table` stack.
 * @description
 * A symbol table stack handles the creation, querying, and removal of individual symbol table
 * frames.
 */
export class SymbolTableStack implements ISymbolTableStack {
    /** Corresponding context stack instance. */
    private _contextStack: IContextStack<TSymbolTableKeyMap>;

    // == public ===========================================

    /**
     * @constructor
     * Creates a new symbol table stack instance.
     * @param contextStack corresponding context stack instance
     */
    constructor(contextStack: IContextStack<TSymbolTableKeyMap>) {
        this._contextStack = contextStack;
    }

    public get symbolTableID(): string {
        return this._contextStack.contextID;
    }

    /**
     * @todo Revisit choice.
     * Currently overwrites symbol if already existing in same frame.
     * Mechanism doesn't yet exist to check if symbol already exists in same frame.
     * Perhaps separate add and update functions?
     * In which case add throws error if symbol already exists.
     */
    public addSymbol(
        name: string,
        entry: TSymbolEntry<unknown>,
        scope: 'local' | 'global' = 'local',
    ): void {
        const keyMap: TSymbolTableKeyMap =
            scope === 'local'
                ? this._contextStack.contextLocalKeyMap
                : this._contextStack.contextGlobalKeyMap;

        const newKeyMap: TSymbolTableKeyMap = { ...keyMap };
        newKeyMap[name] = entry;
        if (scope === 'local') {
            this._contextStack.contextLocalKeyMap = { ...newKeyMap };
        } /* if (scope === 'global') */ else {
            this._contextStack.contextGlobalKeyMap = { ...newKeyMap };
        }
    }

    public getSymbol(
        name: string,
        scope: 'local' | 'global' = 'local',
    ): TSymbolEntry<unknown> | undefined {
        const keyMap: TSymbolTableKeyMap =
            scope === 'local'
                ? this._contextStack.contextLocalKeyMap
                : this._contextStack.contextGlobalKeyMap;

        return name in keyMap ? keyMap[name] : undefined;
    }

    public removeSymbol(name: string, scope: 'local' | 'global' = 'local'): void {
        const keyMap: TSymbolTableKeyMap =
            scope === 'local'
                ? this._contextStack.contextLocalKeyMap
                : this._contextStack.contextGlobalKeyMap;

        if (!(name in keyMap)) {
            throw Error(`InvalidSymbolError: Symbol "${name}" doesn't exist`);
        }

        const newKeyMap: TSymbolTableKeyMap = { ...keyMap };
        delete newKeyMap[name];
        if (scope === 'local') {
            this._contextStack.contextLocalKeyMap = { ...newKeyMap };
        } /* if (scope === 'global') */ else {
            this._contextStack.contextGlobalKeyMap = { ...newKeyMap };
        }
    }

    public listSymbols(): TSymbolTableKeyMap;
    public listSymbols(orderBy: 'name'): TSymbolTableKeyMap;
    public listSymbols(orderBy: 'type'): { [type: string]: TSymbolTableKeyMap };
    public listSymbols(
        orderBy: 'name' | 'type' = 'name',
    ): TSymbolTableKeyMap | { [type: string]: TSymbolTableKeyMap } {
        if (orderBy === 'name') return this._contextStack.contextLocalKeyMap;

        const tableByType: { [type: string]: TSymbolTableKeyMap } = {};
        Object.entries(this._contextStack.contextLocalKeyMap).forEach(([name, entry]) => {
            if (!(entry.type in tableByType)) tableByType[entry.type] = {};
            tableByType[entry.type][name] = entry;
        });

        return tableByType;
    }

    public pushFrame(): void {
        this._contextStack.pushFrame();
    }

    public popFrame(): void {
        this._contextStack.popFrame();
    }
}

/**
 * @class
 * Defines a `Symbol Table` manager.
 * @description
 * Manages different symbol table stack instances; consider each symbol table stack to be a scope
 * root inside the global symbol table scope. This also provides access to the global symbols.
 */
export class SymbolTableManager implements ISymbolTableManager {
    /** Corresponding context manager instance. */
    private _contextManager: ContextManager<TSymbolTableKeyMap>;
    /** Stores the symbol table stack instances by ID. */
    private _symbolTableMap: { [symbolTableID: string]: ISymbolTableStack } = {};

    // == public ===========================================

    /**
     * @constructor
     * Creates a symbol table manager instance.
     */
    constructor() {
        this._contextManager = new ContextManager<TSymbolTableKeyMap>({});
    }

    public createSymbolTableStack(): ISymbolTableStack {
        const context = this._contextManager.createContextStack();
        const symbolTable = new SymbolTableStack(context);

        this._symbolTableMap[context.contextID] = symbolTable;

        return symbolTable;
    }

    public getSymbolTableStack(symbolTableStackID: string): ISymbolTableStack {
        try {
            const context = this._contextManager.getContextStack(symbolTableStackID);
            return this._symbolTableMap[context.contextID];
        } catch (_) {
            throw Error(
                `InvalidAccessError: Symbol Table stack with ID "${symbolTableStackID}" doesn't exist`,
            );
        }
    }

    public removeSymbolTableStack(symbolTableStackID: string): void {
        try {
            this._contextManager.removeContextStack(symbolTableStackID);
        } catch (_) {
            throw Error(
                `InvalidAccessError: Symbol Table stack with ID "${symbolTableStackID}" doesn't exist`,
            );
        }
    }

    public addGlobalSymbol(name: string, entry: TSymbolEntry<unknown>): void {
        const newKeyMap: TSymbolTableKeyMap = { ...this._contextManager.contextGlobalKeyMap };
        newKeyMap[name] = entry;
        this._contextManager.updateContextGlobalKeyMap({ ...newKeyMap });
    }

    public getGlobalSymbol(name: string): TSymbolEntry<unknown> | undefined {
        return name in this._contextManager.contextGlobalKeyMap
            ? this._contextManager.contextGlobalKeyMap[name]
            : undefined;
    }

    public removeGlobalSymbol(name: string): void {
        if (!(name in this._contextManager.contextGlobalKeyMap)) {
            throw Error(`InvalidSymbolError: Symbol "${name}" doesn't exist`);
        }

        const newKeyMap: TSymbolTableKeyMap = { ...this._contextManager.contextGlobalKeyMap };
        delete newKeyMap[name];
        this._contextManager.updateContextGlobalKeyMap({ ...newKeyMap });
    }

    public listGlobalSymbols(): TSymbolTableKeyMap;
    public listGlobalSymbols(orderBy: 'name'): TSymbolTableKeyMap;
    public listGlobalSymbols(orderBy: 'type'): { [type: string]: TSymbolTableKeyMap };
    public listGlobalSymbols(
        orderBy: 'name' | 'type' = 'name',
    ): TSymbolTableKeyMap | { [type: string]: TSymbolTableKeyMap } {
        if (orderBy === 'name') return this._contextManager.contextGlobalKeyMap;

        const tableByType: { [type: string]: TSymbolTableKeyMap } = {};
        Object.entries(this._contextManager.contextGlobalKeyMap).forEach(([name, entry]) => {
            if (!(entry.type in tableByType)) tableByType[entry.type] = {};
            tableByType[entry.type][name] = entry;
        });

        return tableByType;
    }

    public reset(): void {
        this._contextManager.reset();
    }
}
