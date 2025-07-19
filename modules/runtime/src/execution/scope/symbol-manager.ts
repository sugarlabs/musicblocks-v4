/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/**
 * Symbol Manager - Integrated Symbol Table and Memory Management
 *
 * This class provides a unified interface with support for member expressions,
 * enums, arrays, dictionaries, and system variable access control.
 */

import { SymbolTable } from './symbol-table';
import { SymbolResolver } from './symbol-resolver';
import {
    SymbolType,
    DataType,
    ExecutionContext,
    type ISymbolEntry,
    type SymbolMetadata,
    type SymbolLookupResult,
    type MemberResolutionResult,
    type EnumMetadata,
    type ArrayMetadata,
    type DictionaryMetadata,
    AccessControlError,
    EnumValidationError,
} from '../../@types/symbol-types';
import type { IThreadContext } from '../../@types/scope';

/**
 * Unified symbol and memory management
 */
export class SymbolManager<T extends Object> {
    private readonly _symbolTable: SymbolTable;
    private readonly _symbolResolver: SymbolResolver<T>;
    private readonly _threadContext: IThreadContext<T>;

    constructor(threadContext: IThreadContext<T>) {
        this._threadContext = threadContext;
        this._symbolTable = new SymbolTable();
        this._symbolResolver = new SymbolResolver(this._symbolTable, threadContext);
    }

    /**
     * Set the execution context for access control
     */
    setExecutionContext(context: ExecutionContext): void {
        this._symbolTable.setExecutionContext(context);
    }

    /**
     * Get the current execution context
     */
    getExecutionContext(): ExecutionContext {
        return this._symbolTable.getExecutionContext();
    }

    /**
     * Enter a new scope in both symbol table and memory system
     */
    pushScope(): void {
        this._symbolTable.pushScope();
        this._threadContext.pushScope();
    }

    /**
     * Exit current scope in both symbol table and memory system
     */
    popScope(): void {
        this._symbolTable.popScope();
        this._threadContext.popScope();
    }

    /**
     * Declare a symbol and optionally set its initial value
     */
    declare<K extends keyof T>(
        name: string,
        symbolType: SymbolType,
        dataType: DataType,
        initialValue?: T[K],
        options: {
            isMutable?: boolean;
            metadata?: SymbolMetadata;
            frameId?: string;
            executionContext?: ExecutionContext;
        } = {},
    ): ISymbolEntry {
        // Declare in symbol table with access control
        const entry = this._symbolTable.declare(name, symbolType, dataType, options);

        // Set initial value if provided
        if (initialValue !== undefined) {
            this._threadContext.setLocal(name as K, initialValue);
        }

        return entry;
    }

    /**
     * Declare an enum symbol with dynamic values
     */
    declareEnum(
        name: string,
        enumType: string,
        possibleValues: readonly string[],
        initialValue?: string,
        options: {
            scopeType?: 'global' | 'function' | 'block';
            executionContext?: ExecutionContext;
        } = {},
    ): ISymbolEntry {
        const enumMetadata: EnumMetadata = {
            possibleValues,
            currentValue: initialValue,
            enumType,
        };

        const metadata: SymbolMetadata = {
            enumMetadata,
        };

        // Declare in symbol table
        const entry = this._symbolTable.declare(name, SymbolType.USER_VARIABLE, DataType.ENUM, {
            metadata,
            executionContext: options.executionContext,
        });

        // Set initial value if provided
        if (initialValue !== undefined) {
            if (!possibleValues.includes(initialValue)) {
                throw new EnumValidationError(
                    name,
                    initialValue,
                    possibleValues,
                    options.executionContext,
                );
            }
            this._threadContext.setLocal(name as keyof T, initialValue as T[keyof T]);
        }

        return entry;
    }

    /**
     * Declare an array symbol
     */
    declareArray<K extends keyof T>(
        name: string,
        elementType: DataType,
        initialValue?: T[K],
        options: {
            dimensions?: number;
            maxLength?: number;
            minLength?: number;
            executionContext?: ExecutionContext;
        } = {},
    ): ISymbolEntry {
        const arrayMetadata: ArrayMetadata = {
            elementType,
            dimensions: options.dimensions,
            maxLength: options.maxLength,
            minLength: options.minLength,
        };

        const metadata: SymbolMetadata = {
            arrayMetadata,
        };

        // Declare in symbol table
        const entry = this._symbolTable.declare(name, SymbolType.USER_VARIABLE, DataType.ARRAY, {
            metadata,
            executionContext: options.executionContext,
        });

        // Set initial value if provided
        if (initialValue !== undefined) {
            this._threadContext.setLocal(name as K, initialValue);
        }

        return entry;
    }

    /**
     * Declare a dictionary symbol
     */
    declareDictionary<K extends keyof T>(
        name: string,
        keyType: DataType,
        valueType: DataType,
        initialValue?: T[K],
        options: {
            requiredKeys?: readonly string[];
            allowDynamicKeys?: boolean;
            maxSize?: number;
            executionContext?: ExecutionContext;
        } = {},
    ): ISymbolEntry {
        const dictionaryMetadata: DictionaryMetadata = {
            keyType,
            valueType,
            requiredKeys: options.requiredKeys,
            allowDynamicKeys: options.allowDynamicKeys ?? true,
            maxSize: options.maxSize,
        };

        const metadata: SymbolMetadata = {
            dictionaryMetadata,
        };

        // Declare in symbol table
        const entry = this._symbolTable.declare(
            name,
            SymbolType.USER_VARIABLE,
            DataType.DICTIONARY,
            {
                metadata,
                executionContext: options.executionContext,
            },
        );

        // Set initial value if provided
        if (initialValue !== undefined) {
            this._threadContext.setLocal(name as K, initialValue);
        }

        return entry;
    }

    /**
     * Declare a system variable (immutable by user programs)
     */
    declareSystemVariable<K extends keyof T>(
        name: string,
        dataType: DataType,
        initialValue?: T[K],
        options: {
            metadata?: SymbolMetadata;
        } = {},
    ): ISymbolEntry {
        // Only main program can declare system variables
        if (this.getExecutionContext() === ExecutionContext.USER_PROGRAM) {
            throw new AccessControlError(
                name,
                'system variable declaration',
                ExecutionContext.USER_PROGRAM,
            );
        }

        const entry = this._symbolTable.declare(name, SymbolType.SYSTEM_VARIABLE, dataType, {
            metadata: options.metadata,
            executionContext: ExecutionContext.MAIN_PROGRAM,
        });

        // Set initial value if provided
        if (initialValue !== undefined) {
            this._threadContext.setGlobal(name as K, initialValue);
        }

        return entry;
    }

    /**
     * Declare a configurable system variable (modifiable by main program only)
     */
    declareSystemVariableConfigurable<K extends keyof T>(
        name: string,
        dataType: DataType,
        initialValue?: T[K],
        options: {
            metadata?: SymbolMetadata;
        } = {},
    ): ISymbolEntry {
        // Only main program can declare configurable system variables
        if (this.getExecutionContext() === ExecutionContext.USER_PROGRAM) {
            throw new AccessControlError(
                name,
                'configurable system variable declaration',
                ExecutionContext.USER_PROGRAM,
            );
        }

        const entry = this._symbolTable.declare(
            name,
            SymbolType.SYSTEM_VARIABLE_CONFIGURABLE,
            dataType,
            {
                metadata: options.metadata,
                executionContext: ExecutionContext.MAIN_PROGRAM,
            },
        );

        // Set initial value if provided
        if (initialValue !== undefined) {
            this._threadContext.setGlobal(name as K, initialValue);
        }

        return entry;
    }

    /**
     * Get symbol value
     */
    getValue<K extends keyof T>(name: string): T[K] | undefined {
        return this._symbolResolver.resolveValue<K>(name);
    }

    /**
     * Set symbol value with access control
     */
    setValue<K extends keyof T>(
        name: string,
        value: T[K],
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): void {
        this._symbolResolver.setValue(name, value, options.executionContext);
    }

    /**
     * Get member value (for member expressions like a.b)
     */
    getMemberValue<K extends keyof T>(
        objectName: string,
        propertyName: string,
    ): T[K] | string | undefined {
        return this._symbolResolver.resolveMemberValue<K>(objectName, propertyName);
    }

    /**
     * Set member value (for member expressions like a.b)
     */
    setMemberValue<K extends keyof T>(
        objectName: string,
        propertyName: string,
        value: T[K] | string,
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): void {
        this._symbolResolver.setMemberValue<K>(
            objectName,
            propertyName,
            value,
            options.executionContext,
        );
    }

    /**
     * Validate enum value
     */
    validateEnumValue(symbolName: string, value: string): boolean {
        return this._symbolResolver.validateEnumValue(symbolName, value);
    }

    /**
     * Get enum possible values
     */
    getEnumPossibleValues(symbolName: string): readonly string[] | null {
        return this._symbolResolver.getEnumPossibleValues(symbolName);
    }

    /**
     * Set enum value with validation
     */
    setEnumValue<K extends keyof T>(
        name: string,
        value: string,
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): void {
        if (!this.validateEnumValue(name, value)) {
            const possibleValues = this.getEnumPossibleValues(name) ?? [];
            throw new EnumValidationError(name, value, possibleValues, options.executionContext);
        }

        this.setValue(name, value as T[K], options);
    }

    /**
     * Lookup symbol information
     */
    lookup(name: string): SymbolLookupResult | null {
        return this._symbolTable.lookup(name);
    }

    /**
     * Resolve member expression information
     */
    resolveMember(objectName: string, propertyName: string): MemberResolutionResult | null {
        return this._symbolTable.resolveMember(objectName, propertyName);
    }

    /**
     * Check if symbol exists in current scope
     */
    existsInCurrentScope(name: string): boolean {
        return this._symbolTable.existsInCurrentScope(name);
    }

    /**
     * Check if symbol exists in any accessible scope
     */
    existsInAnyScope(name: string): boolean {
        return this._symbolTable.existsInAnyScope(name);
    }

    /**
     * Check if member expression is valid
     */
    memberExists(objectName: string, propertyName: string): boolean {
        const result = this.resolveMember(objectName, propertyName);
        return result?.exists ?? false;
    }

    /**
     * Get all symbols in current scope
     */
    getCurrentScopeSymbols(): readonly ISymbolEntry[] {
        return this._symbolTable.getCurrentScopeSymbols();
    }

    /**
     * Get all accessible symbols
     */
    getAllAccessibleSymbols(): readonly ISymbolEntry[] {
        return this._symbolTable.getAllAccessibleSymbols();
    }

    /**
     * Get current scope depth
     */
    getCurrentScopeDepth(): number {
        return this._symbolTable.getCurrentScopeDepth();
    }

    /**
     * Validate symbol access with execution context
     */
    validateSymbolAccess(
        name: string,
        operation: 'read' | 'write',
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): boolean {
        return this._symbolTable.validateSymbolUsage(name, operation, options.executionContext);
    }

    /**
     * Validate member access with execution context
     */
    validateMemberAccess(
        objectName: string,
        propertyName: string,
        operation: 'read' | 'write',
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): boolean {
        return this._symbolTable.validateMemberAccess(
            objectName,
            propertyName,
            operation === 'write',
            options.executionContext,
        );
    }

    /**
     * Reset both symbol table and memory to initial state
     */
    reset(): void {
        this._symbolTable.reset();
    }

    /**
     * Get symbol entry
     */
    getSymbolEntry(name: string): ISymbolEntry | null {
        return this._symbolResolver.getSymbolEntry(name);
    }

    /**
     * Get symbol metadata
     */
    getSymbolMetadata(name: string): SymbolMetadata | null {
        return this._symbolResolver.getSymbolMetadata(name);
    }

    /**
     * Check if symbol is accessible
     */
    isSymbolAccessible(
        name: string,
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): boolean {
        return this._symbolResolver.isSymbolAccessible(name, options.executionContext);
    }

    /**
     * Check if member is accessible
     */
    isMemberAccessible(
        objectName: string,
        propertyName: string,
        options: {
            executionContext?: ExecutionContext;
        } = {},
    ): boolean {
        return this._symbolResolver.isMemberAccessible(
            objectName,
            propertyName,
            options.executionContext,
        );
    }

    /**
     * Remove symbol from current scope
     */
    removeSymbol(name: string): boolean {
        const removed = this._symbolTable.removeSymbol(name);
        if (removed) {
            try {
                this._threadContext.deleteLocal(name as keyof T);
            } catch {
                // Ignore if not found in local context
            }
        }
        return removed;
    }

    /**
     * Clear all symbols in current scope
     */
    clearCurrentScope(): void {
        this._symbolTable.clearCurrentScope();
    }

    /**
     * Get symbols by type
     */
    getSymbolsByType(symbolType: SymbolType): readonly ISymbolEntry[] {
        return this.getAllAccessibleSymbols().filter((symbol) => symbol.symbolType === symbolType);
    }

    /**
     * Get symbols by data type
     */
    getSymbolsByDataType(dataType: DataType): readonly ISymbolEntry[] {
        return this.getAllAccessibleSymbols().filter((symbol) => symbol.dataType === dataType);
    }

    /**
     * Get all enum symbols
     */
    getAllEnums(): readonly ISymbolEntry[] {
        return this.getSymbolsByDataType(DataType.ENUM);
    }

    /**
     * Get all array symbols
     */
    getAllArrays(): readonly ISymbolEntry[] {
        return this.getSymbolsByDataType(DataType.ARRAY);
    }

    /**
     * Get all dictionary symbols
     */
    getAllDictionaries(): readonly ISymbolEntry[] {
        return this.getSymbolsByDataType(DataType.DICTIONARY);
    }

    /**
     * Get all user-modifiable symbols
     */
    getUserModifiableSymbols(): readonly ISymbolEntry[] {
        return this.getAllAccessibleSymbols().filter((symbol) => symbol.isUserModifiable);
    }

    /**
     * Get all system symbols
     */
    getSystemSymbols(): readonly ISymbolEntry[] {
        return this.getAllAccessibleSymbols().filter((symbol) => !symbol.isUserDefined);
    }

    /**
     * Access to underlying symbol table (for advanced operations)
     */
    get symbolTable(): SymbolTable {
        return this._symbolTable;
    }

    /**
     * Access to underlying symbol resolver (for advanced operations)
     */
    get symbolResolver(): SymbolResolver<T> {
        return this._symbolResolver;
    }

    /**
     * Access to underlying thread context (for advanced operations)
     */
    get threadContext(): IThreadContext<T> {
        return this._threadContext;
    }
}
