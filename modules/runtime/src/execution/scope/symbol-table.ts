/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Table Implementation
 *
 * This file implements the SymbolTable class with support for member expressions,
 * enums, arrays, dictionaries, and system variable access control.
 */

import {
    ISymbolTable,
    SymbolType,
    DataType,
    ScopeType,
    ExecutionContext,
    SymbolLookupResult,
    MemberResolutionResult,
    ISymbolEntry,
    SymbolTableError,
    SymbolAlreadyExistsError,
    AccessControlError,
    EnumValidationError,
    type SymbolMetadata,
} from '../../@types/symbol-types';
import { SymbolEntry } from './symbol-entry';

/**
 * SymbolTable class manages symbol declarations, lookups, and scopes.
 */
export class SymbolTable implements ISymbolTable<object> {
    private readonly _scopes: Array<Map<string, ISymbolEntry>> = [new Map()];
    private _currentExecutionContext: ExecutionContext = ExecutionContext.USER_PROGRAM;

    /**
     * Set the current execution context for access control
     */
    public setExecutionContext(context: ExecutionContext): void {
        this._currentExecutionContext = context;
    }

    /**
     * Get the current execution context
     */
    public getExecutionContext(): ExecutionContext {
        return this._currentExecutionContext;
    }

    /** Declare a new symbol */
    declare(
        name: string,
        symbolType: SymbolType,
        dataType: DataType,
        options: {
            isMutable?: boolean;
            metadata?: SymbolMetadata;
            frameId?: string;
            executionContext?: ExecutionContext;
        } = {},
    ): ISymbolEntry {
        // Check if symbol already exists in current scope
        if (this.existsInCurrentScope(name)) {
            throw new SymbolAlreadyExistsError(name, options.executionContext);
        }

        // Validate access control for system symbols
        const effectiveContext = options.executionContext ?? this._currentExecutionContext;
        this._validateSymbolDeclaration(symbolType, effectiveContext);

        // Validate enum metadata if enum type
        if (dataType === DataType.ENUM && options.metadata?.enumMetadata) {
            this._validateEnumMetadata(name, options.metadata.enumMetadata);
        }

        // Validate required metadata for enhanced data types
        this._validateRequiredMetadata(name, dataType, options.metadata);

        // Create new symbol entry
        const scopeType = this._getCurrentScopeType();
        const newEntry = new SymbolEntry(name, symbolType, scopeType, dataType, options);

        // Add to current scope
        this._scopes[this._currentScopeIndex()].set(name, newEntry);
        return newEntry;
    }

    /** Look up a symbol by name */
    lookup(name: string): SymbolLookupResult | null {
        for (let i = this._currentScopeIndex(); i >= 0; i--) {
            const entry = this._scopes[i].get(name);
            if (entry) {
                return {
                    entry,
                    scopeDepth: this._currentScopeIndex() - i,
                    isInCurrentScope: i === this._currentScopeIndex(),
                };
            }
        }

        return null;
    }

    /** Resolve member expression (a.b) */
    resolveMember(objectName: string, propertyName: string): MemberResolutionResult | null {
        // Look up the parent object
        const objectLookup = this.lookup(objectName);
        if (!objectLookup) {
            return null;
        }

        const parentSymbol = objectLookup.entry;

        // Handle enum member access
        if (parentSymbol.isEnum()) {
            const enumMetadata = parentSymbol.getEnumMetadata();
            if (enumMetadata) {
                const exists = enumMetadata.possibleValues.includes(propertyName);
                return {
                    parentSymbol,
                    propertyName,
                    propertyType: DataType.STRING,
                    exists,
                    isReadable: exists,
                    isWritable: false,
                };
            }
        }

        // Handle dictionary member access
        if (parentSymbol.isDictionary()) {
            const dictMetadata = parentSymbol.getDictionaryMetadata();
            if (dictMetadata) {
                const isRequired = dictMetadata.requiredKeys?.includes(propertyName) ?? false;
                const exists = isRequired || dictMetadata.allowDynamicKeys;
                return {
                    parentSymbol,
                    propertyName,
                    propertyType: dictMetadata.valueType,
                    exists,
                    isReadable: exists,
                    isWritable: exists && parentSymbol.canBeModified(),
                };
            }
        }

        // Handle object member access
        if (parentSymbol.dataType === DataType.OBJECT) {
            return {
                parentSymbol,
                propertyName,
                propertyType: DataType.ANY,
                exists: true,
                isReadable: true,
                isWritable: parentSymbol.canBeModified(),
            };
        }

        return null;
    }

    /** Check if symbol exists in current scope */
    existsInCurrentScope(name: string): boolean {
        return this._scopes[this._currentScopeIndex()].has(name);
    }

    /** Check if symbol exists in any accessible scope */
    existsInAnyScope(name: string): boolean {
        return !!this.lookup(name);
    }

    /** Get all symbols in current scope */
    getCurrentScopeSymbols(): readonly ISymbolEntry[] {
        return Array.from(this._scopes[this._currentScopeIndex()].values());
    }

    /** Get all symbols in all accessible scopes */
    getAllAccessibleSymbols(): readonly ISymbolEntry[] {
        return this._scopes.flatMap((scope) => Array.from(scope.values()));
    }

    /** Enter a new scope */
    pushScope(): void {
        this._scopes.push(new Map());
    }

    /** Exit current scope */
    popScope(): void {
        if (this._scopes.length === 1) {
            throw new SymbolTableError('Cannot pop the global scope');
        }
        this._scopes.pop();
    }

    /** Get current scope depth */
    getCurrentScopeDepth(): number {
        return this._currentScopeIndex();
    }

    /** Validate symbol usage with access control */
    validateSymbolUsage(
        name: string,
        context: string,
        executionContext?: ExecutionContext,
    ): boolean {
        const lookupResult = this.lookup(name);
        if (!lookupResult) {
            return false;
        }

        const effectiveContext = executionContext ?? this._currentExecutionContext;
        const entry = lookupResult.entry;

        // Check access control for system symbols
        if (context === 'write' || context === 'modify') {
            return this._canModifySymbol(entry, effectiveContext);
        }

        return true;
    }

    /** Validate member access */
    validateMemberAccess(
        objectName: string,
        propertyName: string,
        isWrite: boolean,
        executionContext?: ExecutionContext,
    ): boolean {
        const memberResult = this.resolveMember(objectName, propertyName);
        if (!memberResult) {
            return false;
        }

        if (!memberResult.exists) {
            return false;
        }

        if (isWrite && !memberResult.isWritable) {
            return false;
        }

        // Check access control for the parent object
        const effectiveContext = executionContext ?? this._currentExecutionContext;
        if (isWrite) {
            return this._canModifySymbol(memberResult.parentSymbol, effectiveContext);
        }

        return true;
    }

    /** Remove symbol from current scope */
    removeSymbol(name: string): boolean {
        return this._scopes[this._currentScopeIndex()].delete(name);
    }

    /** Clear all symbols in current scope */
    clearCurrentScope(): void {
        this._scopes[this._currentScopeIndex()].clear();
    }

    /** Reset symbol table to initial state */
    reset(): void {
        this._scopes.length = 1;
        this.clearCurrentScope();
        this._currentExecutionContext = ExecutionContext.USER_PROGRAM;
    }

    /** Validate enum value against symbol's possible values */
    public validateEnumValue(symbolName: string, value: string): boolean {
        const lookupResult = this.lookup(symbolName);
        if (!lookupResult || !lookupResult.entry.isEnum()) {
            return false;
        }

        const enumMetadata = lookupResult.entry.getEnumMetadata();
        if (!enumMetadata) {
            return false;
        }

        return enumMetadata.possibleValues.includes(value);
    }

    /** Get enum possible values */
    public getEnumPossibleValues(symbolName: string): readonly string[] | null {
        const lookupResult = this.lookup(symbolName);
        if (!lookupResult || !lookupResult.entry.isEnum()) {
            return null;
        }

        const enumMetadata = lookupResult.entry.getEnumMetadata();
        return enumMetadata?.possibleValues ?? null;
    }

    /** Internal method to get current scope index */
    private _currentScopeIndex(): number {
        return this._scopes.length - 1;
    }

    /** Internal method to determine current scope type */
    private _getCurrentScopeType(): ScopeType {
        const depth = this._currentScopeIndex();
        if (depth === 0) {
            return ScopeType.GLOBAL;
        } else if (depth === 1) {
            return ScopeType.FUNCTION;
        } else {
            return ScopeType.BLOCK;
        }
    }

    /** Validate symbol declaration based on execution context */
    private _validateSymbolDeclaration(
        symbolType: SymbolType,
        executionContext: ExecutionContext,
    ): void {
        // System symbols can only be declared by main program
        if (
            (symbolType === SymbolType.SYSTEM_VARIABLE ||
                symbolType === SymbolType.SYSTEM_VARIABLE_CONFIGURABLE ||
                symbolType === SymbolType.SYSTEM_FUNCTION) &&
            executionContext === ExecutionContext.USER_PROGRAM
        ) {
            throw new AccessControlError('system symbol', 'declaration', executionContext);
        }
    }

    /** Check if symbol can be modified based on execution context */
    private _canModifySymbol(entry: ISymbolEntry, executionContext: ExecutionContext): boolean {
        // System variables cannot be modified by user programs
        if (
            entry.symbolType === SymbolType.SYSTEM_VARIABLE &&
            executionContext === ExecutionContext.USER_PROGRAM
        ) {
            return false;
        }

        // Configurable system variables can only be modified by main program
        if (
            entry.symbolType === SymbolType.SYSTEM_VARIABLE_CONFIGURABLE &&
            executionContext === ExecutionContext.USER_PROGRAM
        ) {
            return false;
        }

        // Functions are generally immutable
        if (entry.isFunction()) {
            return false;
        }

        return entry.canBeModified();
    }

    /** Validate enum metadata */
    private _validateEnumMetadata(symbolName: string, enumMetadata: any): void {
        if (!enumMetadata.possibleValues || !Array.isArray(enumMetadata.possibleValues)) {
            throw new EnumValidationError(symbolName, 'invalid', [], this._currentExecutionContext);
        }

        if (enumMetadata.possibleValues.length === 0) {
            throw new EnumValidationError(symbolName, 'empty', [], this._currentExecutionContext);
        }

        if (
            enumMetadata.currentValue &&
            !enumMetadata.possibleValues.includes(enumMetadata.currentValue)
        ) {
            throw new EnumValidationError(
                symbolName,
                enumMetadata.currentValue,
                enumMetadata.possibleValues,
                this._currentExecutionContext,
            );
        }
    }

    /** Validate required metadata for enhanced data types */
    private _validateRequiredMetadata(
        symbolName: string,
        dataType: DataType,
        metadata?: SymbolMetadata,
    ): void {
        switch (dataType) {
            case DataType.ENUM:
                if (!metadata?.enumMetadata) {
                    throw new Error(`Enum symbol "${symbolName}" must have enumMetadata`);
                }
                break;
            case DataType.ARRAY:
                if (!metadata?.arrayMetadata) {
                    throw new Error(`Array symbol "${symbolName}" must have arrayMetadata`);
                }
                break;
            case DataType.DICTIONARY:
                if (!metadata?.dictionaryMetadata) {
                    throw new Error(
                        `Dictionary symbol "${symbolName}" must have dictionaryMetadata`,
                    );
                }
                break;
            default:
                // No special metadata requirements for other types
                break;
        }
    }
}
