/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Table Type Definitions
 *
 * This file defines the core types and interfaces for the enhanced symbol table system.
 * Supports member expressions, enums, arrays, dictionaries, and system variable access control.
 */

/**
 * Types of symbols that can be stored in the symbol table
 */
export enum SymbolType {
    /** System-defined variables (immutable by user programs) */
    SYSTEM_VARIABLE = 'system_variable',

    /** System-defined variables (configurable by main program, immutable by user programs) */
    SYSTEM_VARIABLE_CONFIGURABLE = 'system_variable_configurable',

    /** System-defined functions (built-in) */
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
    DICTIONARY = 'dictionary',
    ENUM = 'enum',
    PRIMITIVE_VARIABLE = 'primitive_variable',
    UNDEFINED = 'undefined',
    ANY = 'any',
}

/**
 * Execution context for access control
 */
export enum ExecutionContext {
    /** Main program execution - can modify system configurable variables */
    MAIN_PROGRAM = 'main_program',

    /** User program execution - cannot modify system variables */
    USER_PROGRAM = 'user_program',
}

/**
 * Memory pointer to reference memory module locations
 */
export interface MemoryPointer {
    readonly threadId: string;
    readonly frameId: string;
    readonly variableName: string;
}

/**
 * Enum-specific metadata
 */
export interface EnumMetadata {
    readonly possibleValues: readonly string[];
    readonly currentValue?: string;
    readonly enumType: string;
}

/**
 * Array-specific metadata
 */
export interface ArrayMetadata {
    readonly elementType: DataType;
    readonly dimensions?: number;
    readonly maxLength?: number;
    readonly minLength?: number;
}

/**
 * Dictionary-specific metadata
 */
export interface DictionaryMetadata {
    readonly keyType: DataType;
    readonly valueType: DataType;
    readonly requiredKeys?: readonly string[];
    readonly allowDynamicKeys: boolean;
    readonly maxSize?: number;
}

/**
 * Object property metadata for member expressions
 */
export interface ObjectPropertyMetadata {
    readonly propertyName: string;
    readonly propertyType: DataType;
    readonly isReadOnly: boolean;
    readonly parentObject: string;
}

/**
 * Metadata that can be attached to symbols
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

    /** Memory pointer to memory module */
    readonly memoryPointer?: MemoryPointer;

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

    /** Enum-specific metadata */
    readonly enumMetadata?: EnumMetadata;

    /** Array-specific metadata */
    readonly arrayMetadata?: ArrayMetadata;

    /** Dictionary-specific metadata */
    readonly dictionaryMetadata?: DictionaryMetadata;

    /** Object property metadata for member expressions */
    readonly objectPropertyMetadata?: ObjectPropertyMetadata;

    /** Additional custom metadata */
    readonly [key: string]: unknown;
}

/**
 * Core symbol entry interface
 */
export interface ISymbolEntry {
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

    /** Whether symbol can be modified by user programs */
    readonly isUserModifiable: boolean;

    /** Reference to memory location in the memory module */
    readonly memoryLocation?: string;

    /** Frame ID in the LayeredMap where symbol is stored */
    readonly frameId?: string;

    /** Additional metadata */
    readonly metadata?: SymbolMetadata;

    /** Unique identifier for this symbol entry */
    readonly id: string;

    /** Methods */
    withUpdates(updates: {
        memoryLocation?: string;
        frameId?: string;
        metadata?: SymbolMetadata;
    }): ISymbolEntry;

    canBeShadowed(): boolean;
    canBeModified(): boolean;
    canBeModifiedByUser(): boolean;
    isFunction(): boolean;
    isVariable(): boolean;
    isEnum(): boolean;
    isArray(): boolean;
    isDictionary(): boolean;
    isMemberReference(): boolean;
    getFunctionMetadata(): SymbolMetadata['functionMetadata'] | null;
    getVariableMetadata(): SymbolMetadata['variableMetadata'] | null;
    getEnumMetadata(): EnumMetadata | null;
    getArrayMetadata(): ArrayMetadata | null;
    getDictionaryMetadata(): DictionaryMetadata | null;
    getObjectPropertyMetadata(): ObjectPropertyMetadata | null;
    toPlainObject(): Record<string, unknown>;
    toString(): string;
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
 * Member expression resolution result
 */
export interface MemberResolutionResult {
    /** Parent object symbol */
    readonly parentSymbol: ISymbolEntry;

    /** Property name being accessed */
    readonly propertyName: string;

    /** Property type */
    readonly propertyType: DataType;

    /** Whether property exists */
    readonly exists: boolean;

    /** Whether property is readable */
    readonly isReadable: boolean;

    /** Whether property is writable */
    readonly isWritable: boolean;
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
            executionContext?: ExecutionContext;
        },
    ): ISymbolEntry;

    /** Look up a symbol by name */
    lookup(name: string): SymbolLookupResult | null;

    /** Resolve member expression (a.b) */
    resolveMember(objectName: string, propertyName: string): MemberResolutionResult | null;

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

    /** Validate symbol usage with access control */
    validateSymbolUsage(
        name: string,
        context: string,
        executionContext?: ExecutionContext,
    ): boolean;

    /** Validate member access */
    validateMemberAccess(
        objectName: string,
        propertyName: string,
        isWrite: boolean,
        executionContext?: ExecutionContext,
    ): boolean;

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

    /** Resolve member expression to memory location */
    resolveMemberToMemoryLocation(objectName: string, propertyName: string): string | null;

    /** Get symbol metadata */
    getSymbolMetadata(name: string): SymbolMetadata | null;

    /** Check if symbol is accessible from current context */
    isSymbolAccessible(name: string, executionContext?: ExecutionContext): boolean;

    /** Check if member is accessible */
    isMemberAccessible(
        objectName: string,
        propertyName: string,
        executionContext?: ExecutionContext,
    ): boolean;

    /** Validate enum value */
    validateEnumValue(symbolName: string, value: string): boolean;

    /** Get enum possible values */
    getEnumPossibleValues(symbolName: string): readonly string[] | null;
}

/**
 * Errors for symbol table operations
 */
export class SymbolTableError extends Error {
    constructor(
        message: string,
        public readonly symbolName?: string,
        public readonly executionContext?: ExecutionContext,
    ) {
        super(message);
        this.name = 'SymbolTableError';
    }
}

export class SymbolAlreadyExistsError extends SymbolTableError {
    constructor(symbolName: string, executionContext?: ExecutionContext) {
        super(
            `Symbol "${symbolName}" already exists in current scope`,
            symbolName,
            executionContext,
        );
        this.name = 'SymbolAlreadyExistsError';
    }
}

export class SymbolNotFoundError extends SymbolTableError {
    constructor(symbolName: string, executionContext?: ExecutionContext) {
        super(`Symbol "${symbolName}" not found`, symbolName, executionContext);
        this.name = 'SymbolNotFoundError';
    }
}

export class InvalidSymbolOperationError extends SymbolTableError {
    constructor(
        operation: string,
        symbolName: string,
        reason: string,
        executionContext?: ExecutionContext,
    ) {
        super(
            `Invalid ${operation} operation on symbol "${symbolName}": ${reason}`,
            symbolName,
            executionContext,
        );
        this.name = 'InvalidSymbolOperationError';
    }
}

export class AccessControlError extends SymbolTableError {
    constructor(symbolName: string, operation: string, executionContext?: ExecutionContext) {
        super(
            `Access denied: ${operation} operation on symbol "${symbolName}" not allowed in ${executionContext} context`,
            symbolName,
            executionContext,
        );
        this.name = 'AccessControlError';
    }
}

export class MemberAccessError extends SymbolTableError {
    constructor(
        objectName: string,
        propertyName: string,
        reason: string,
        executionContext?: ExecutionContext,
    ) {
        super(
            `Member access error: ${objectName}.${propertyName} - ${reason}`,
            `${objectName}.${propertyName}`,
            executionContext,
        );
        this.name = 'MemberAccessError';
    }
}

export class EnumValidationError extends SymbolTableError {
    constructor(
        symbolName: string,
        value: string,
        possibleValues: readonly string[],
        executionContext?: ExecutionContext,
    ) {
        super(
            `Invalid enum value "${value}" for symbol "${symbolName}". Valid values: ${possibleValues.join(', ')}`,
            symbolName,
            executionContext,
        );
        this.name = 'EnumValidationError';
    }
}

export class ScopeOperationError extends SymbolTableError {
    constructor(operation: string, reason: string, executionContext?: ExecutionContext) {
        super(`Scope ${operation} failed: ${reason}`, undefined, executionContext);
        this.name = 'ScopeOperationError';
    }
}
