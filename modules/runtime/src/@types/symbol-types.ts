/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Table Type Definitions
 *
 * This file defines the core types and interfaces for the symbol table system.
 * The symbol table acts as a metadata layer above the existing memory module,
 * storing information about symbols (variables, functions) rather than their values.
 */

/**
 * Types of symbols that can be stored in the symbol table
 */
export enum SymbolType {
    /** System-defined variables and functions (built-in) */
    SYSTEM_VARIABLE = 'system_variable',
    SYSTEM_FUNCTION = 'system_function',

    /** User-defined variables */
    USER_VARIABLE = 'user_variable',

    /** User-defined functions */
    USER_FUNCTION = 'user_function',

    /** Function parameters */
    PARAMETER = 'parameter',

    /** Loop iteration variables */
    ITERATOR = 'iterator',
}

/**
 * Scope levels where symbols can be defined
 */
export enum ScopeType {
    /** Global scope - accessible everywhere */
    GLOBAL = 'global',

    /** Function scope - accessible within function */
    FUNCTION = 'function',

    /** Block scope - accessible within block */
    BLOCK = 'block',

    /** Parameter scope - function parameters */
    PARAMETER = 'parameter',
}

/**
 * Data types for symbol values
 */
export enum DataType {
    NUMBER = 'number',
    STRING = 'string',
    BOOLEAN = 'boolean',
    FUNCTION = 'function',
    OBJECT = 'object',
    ARRAY = 'array',
    UNDEFINED = 'undefined',
    ANY = 'any',
}

/**
 * Additional metadata that can be attached to symbols
 */
export interface SymbolMetadata {
    /** When the symbol was declared */
    readonly declaredAt?: string;

    /** Source location information */
    readonly sourceLocation?: {
        line: number;
        column: number;
        file?: string;
    };

    /** Function-specific metadata */
    readonly functionMetadata?: {
        parameterCount: number;
        parameterNames: readonly string[];
        returnType?: DataType;
        isAsync?: boolean;
    };

    /** Variable-specific metadata */
    readonly variableMetadata?: {
        isInitialized: boolean;
        defaultValue?: unknown;
    };

    /** Additional custom metadata */
    readonly [key: string]: unknown;
}

/**
 * Core symbol entry interface
 */
export interface ISymbolEntry {
    toPlainObject(): unknown;
    isFunction(): any;
    getFunctionMetadata(): unknown;
    /** Symbol name/identifier */
    readonly name: string;

    /** Type of symbol */
    readonly symbolType: SymbolType;

    /** Scope where symbol is defined */
    readonly scopeType: ScopeType;

    /** Data type of symbol value */
    readonly dataType: DataType;

    /** Whether symbol is user-defined or system-defined */
    readonly isUserDefined: boolean;

    /** Whether symbol value can be modified */
    readonly isMutable: boolean;

    /** Reference to memory location in the memory module */
    readonly memoryLocation?: string;

    /** Frame ID in the LayeredMap where symbol is stored */
    readonly frameId?: string;

    /** Additional metadata */
    readonly metadata?: SymbolMetadata;

    /** Unique identifier for this symbol entry */
    readonly id: string;
}

/**
 * Symbol lookup result
 */
export interface SymbolLookupResult {
    /** Found symbol entry */
    readonly entry: ISymbolEntry;

    /** Scope depth where symbol was found (0 = current scope) */
    readonly scopeDepth: number;

    /** Whether symbol was found in current scope or inherited */
    readonly isInCurrentScope: boolean;
}

/**
 * Symbol table interface
 */
export interface ISymbolTable<T extends object> {
    /** Declare a new symbol */
    declare(
        name: string,
        symbolType: SymbolType,
        dataType: DataType,
        options?: {
            isMutable?: boolean;
            metadata?: SymbolMetadata;
            frameId?: string;
        },
    ): ISymbolEntry;

    /** Look up a symbol by name */
    lookup(name: string): SymbolLookupResult | null;

    /** Check if symbol exists in current scope */
    existsInCurrentScope(name: string): boolean;

    /** Check if symbol exists in any accessible scope */
    existsInAnyScope(name: string): boolean;

    /** Get all symbols in current scope */
    getCurrentScopeSymbols(): readonly ISymbolEntry[];

    /** Get all symbols in all accessible scopes */
    getAllAccessibleSymbols(): readonly ISymbolEntry[];

    /** Enter a new scope */
    pushScope(): void;

    /** Exit current scope */
    popScope(): void;

    /** Get current scope depth */
    getCurrentScopeDepth(): number;

    /** Validate symbol usage */
    validateSymbolUsage(name: string, context: string): boolean;

    /** Remove symbol from current scope */
    removeSymbol(name: string): boolean;

    /** Clear all symbols in current scope */
    clearCurrentScope(): void;

    /** Reset symbol table to initial state */
    reset(): void;
}

/**
 * Symbol resolver interface for name resolution
 */
export interface ISymbolResolver<T extends object> {
    /** Resolve symbol name to memory location */
    resolveToMemoryLocation(name: string): string | null;

    /** Resolve symbol name to frame ID */
    resolveToFrameId(name: string): string | null;

    /** Get symbol metadata */
    getSymbolMetadata(name: string): SymbolMetadata | null;

    /** Check if symbol is accessible from current context */
    isSymbolAccessible(name: string): boolean;
}

/**
 * Errors that can occur in symbol table operations
 */
export class SymbolTableError extends Error {
    constructor(
        message: string,
        public readonly symbolName?: string,
    ) {
        super(message);
        this.name = 'SymbolTableError';
    }
}

export class SymbolAlreadyExistsError extends SymbolTableError {
    constructor(symbolName: string) {
        super(`Symbol "${symbolName}" already exists in current scope`, symbolName);
        this.name = 'SymbolAlreadyExistsError';
    }
}

export class SymbolNotFoundError extends SymbolTableError {
    constructor(symbolName: string) {
        super(`Symbol "${symbolName}" not found`, symbolName);
        this.name = 'SymbolNotFoundError';
    }
}

export class InvalidSymbolOperationError extends SymbolTableError {
    constructor(operation: string, symbolName: string, reason: string) {
        super(`Invalid ${operation} operation on symbol "${symbolName}": ${reason}`, symbolName);
        this.name = 'InvalidSymbolOperationError';
    }
}

export class ScopeOperationError extends SymbolTableError {
    constructor(operation: string, reason: string) {
        super(`Scope ${operation} failed: ${reason}`);
        this.name = 'ScopeOperationError';
    }
}
