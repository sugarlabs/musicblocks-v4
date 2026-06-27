/**
 * Interface for a tree-like data structure which transparently exposes a flat-map object.
 * @typeParam T an object type (lists the keys and their respective value types)
 */
// eslint-disable-next-line
export interface ILayeredMap<T extends Object> {
    /** Root frame ID. */
    get rootID(): string;
    /**
     * Adds a new child frame from a parent frame.
     * @param frameParentID parent frame ID
     * @throws UndefinedError if frame with frameParentID doesn't exist
     */
    addFrame(frameParentID: string): string;
    /**
     * Removes an existing frame.
     * @param frameID frame ID
     * @throws UndefinedError if frame with frameID doesn't exist
     * @throws InvalidOperationError if frameID is ID of root frame
     * @throws InvalidOperationError if frame with frameID has child frames
     */
    removeFrame(frameID: string): void;
    /**
     * Updates the key-value dictionary of a frame.
     * @param frameID frame ID
     * @param keyMap new key-value dictionary
     * @throws InvalidOperationError if frame ID doesn't exist
     */
    updateFrameKeyMap(frameID: string, keyMap: T): void;
    /**
     * Returns a flat key-value dictionary projected until the root frame from a frame.
     * @param frameID frame ID
     * @throws InvalidOperationError if frame ID doesn't exist
     */
    projectFlatMap(frameID: string): T;
}

// == context ======================================================================================

/**
 * Interface for a `Context` instance.
 * @typeParam T type-definition of the context.
 */
// eslint-disable-next-line
export interface IContext<T extends Object> {
    /** Context ID. */
    get contextID(): string;
    /** Global key-value dictionary of the context. */
    get contextGlobalKeyMap(): T;
    set contextGlobalKeyMap(keyMap: T);
    /** Local key-value dictionary of the context. */
    get contextLocalKeyMap(): T;
    set contextLocalKeyMap(keyMap: T);
}

/** Interface for a `Context` stack. */
// eslint-disable-next-line
export interface IContextStack<T extends Object> extends IContext<T> {
    /** Pushes a new context frame into the stack. */
    pushFrame(): void;
    /**
     * Removes topmost context frame from the stack.
     * @throws InvalidOperationError if popping root frame
     */
    popFrame(): void;
}

/** Interface for a `Context` manager. */
// eslint-disable-next-line
export interface IContextManager<T extends Object> {
    /** Creates a new context stack. */
    createContextStack(): IContextStack<T>;
    /**
     * Returns an existing context stack.
     * @param contextStackID context stack ID
     * @throws InvalidAccessError if context stack with contextStackID doesn't exist
     */
    getContextStack(contextStackID: string): IContextStack<T>;
    /**
     * Removes an existing context stack.
     * @param contextStackID context stack ID
     * @throws InvalidAccessError if context stack with contextStackID doesn't exist
     */
    removeContextStack(contextStackID: string): void;
    /** Global key-value dictionary of the context set. */
    get contextGlobalKeyMap(): T;
    /**
     * Updates the global key-value dictionary of the context set.
     * @param keyMap new key-value dictionary
     * @param commit whether to persist the new dictionary over reset cycles
     */
    updateContextGlobalKeyMap(keyMap: T, commit?: boolean): void;
    /** Resets states. */
    reset(): void;
}

// == symbol table =================================================================================

/** Type definition for each symbol's value entry. */
type TSymbolEntry<T> = {
    /** Symbol type. */
    type: string;
    /** Symbol value. */
    data: T;
};

/** Type definition for a symbol table key-value dictionary. */
export type TSymbolTableKeyMap = Record<string, TSymbolEntry<unknown>>;

/** Interface for a `Symbol Table` instance. */
export interface ISymbolTable {
    /** Symbol table ID. */
    get symbolTableID(): string;
    /**
     * Adds new symbol.
     * @param name symbol name
     * @param entry symbol entry
     * @param scope whether local or global
     */
    addSymbol(name: string, entry: TSymbolEntry<unknown>, scope?: 'local' | 'global'): void;
    /**
     * Returns existing symbol by name.
     * @param name symbol name
     * @param scope whether local or global
     * @returns symbol entry if present else `undefined`
     */
    getSymbol(name: string, scope?: 'local' | 'global'): TSymbolEntry<unknown> | undefined;
    // renameSymbol(oldName: string, newName: string): void;
    /**
     * Removes existing symbol by name.
     * @param name symbol name
     * @param scope whether local or global
     * @throws InvalidSymbolError if symbol doesn't exist
     */
    removeSymbol(name: string, scope?: 'local' | 'global'): void;
    listSymbols(): TSymbolTableKeyMap;
    listSymbols(orderBy: 'name'): TSymbolTableKeyMap;
    listSymbols(orderBy: 'type'): { [type: string]: TSymbolTableKeyMap };
    /**
     * Lists local symbol table as key-value dictionary.
     * @param orderBy whether to list by name or grouped by type
     * @returns a JSON object of key-value pairs
     */
    listSymbols(orderBy: 'name' | 'type'): TSymbolTableKeyMap;
}

/** Interface for a `Symbol Table` stack. */
export interface ISymbolTableStack extends ISymbolTable {
    /** Pushes a new symbol table frame into the stack. */
    pushFrame(): void;
    /**
     * Removes topmost symbol table frame from the stack.
     * @throws InvalidOperationError if popping root frame
     */
    popFrame(): void;
}

/** Interface for a `Symbol Table` manager. */
export interface ISymbolTableManager {
    /** Creates a new symbol table stack. */
    createSymbolTableStack(): ISymbolTableStack;
    /**
     * Returns an existing symbol table stack.
     * @param symbolTableStackID symbol table stack ID
     * @throws InvalidAccessError if symbol table stack with symbolTableStackID doesn't exist
     */
    getSymbolTableStack(symbolTableStackID: string): ISymbolTableStack;
    /**
     * Removes an existing symbol table stack.
     * @param symbolTableStackID symbol table stack ID
     * @throws InvalidAccessError if symbol table stack with symbolTableStackID doesn't exist
     */
    removeSymbolTableStack(symbolTableStackID: string): void;
    /**
     * Adds new global symbol.
     * @param name symbol name
     * @param entry symbol entry
     */
    addGlobalSymbol(name: string, entry: TSymbolEntry<unknown>): void;
    /**
     * Returns existing global symbol by name.
     * @param name symbol name
     * @returns symbol entry if present else `undefined`
     */
    getGlobalSymbol(name: string): TSymbolEntry<unknown> | undefined;
    /**
     * Removes existing global symbol by name.
     * @param name symbol name
     * @throws InvalidSymbolError if symbol doesn't exist
     */
    removeGlobalSymbol(name: string): void;
    listGlobalSymbols(): TSymbolTableKeyMap;
    listGlobalSymbols(orderBy: 'name'): TSymbolTableKeyMap;
    listGlobalSymbols(orderBy: 'type'): { [type: string]: TSymbolTableKeyMap };
    /**
     * Lists global symbol table as key-value dictionary.
     * @param orderBy whether to list by name or grouped by type
     * @returns a JSON object of key-value pairs
     */
    listGlobalSymbols(orderBy: 'name' | 'type'): TSymbolTableKeyMap;
    /** Resets states. */
    reset(): void;
}

// == symbol table =================================================================================

/** Interface for a `Scope` instance. */
export interface IScope {
    /**
     * Returns a context instance by name.
     * @param name context name
     */
    // eslint-disable-next-line
    getContext(name: string): IContext<Object>;
    /**
     * Returns symbol table stack.
     */
    getSymbolTable(): ISymbolTable;
}

/** Interface for a `Scope` stack. */
export interface IScopeStack extends IScope {
    /** Pushes a new scope frame into the stack. */
    pushFrame(): void;
    /**
     * Removes topmost scope frame from the stack.
     * @throws InvalidOperationError if popping root frame
     */
    popFrame(): void;
}
