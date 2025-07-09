/**
 * Symbol Entry Implementation
 *
 * This file implements the SymbolEntry class which represents individual symbol
 * metadata entries in the symbol table. Each entry contains information about
 * a symbol (variable, function, etc.) but not its actual value.
 */

import { v4 as uuidv4 } from 'uuid';
import {
    SymbolType,
    ScopeType,
    DataType,
    type ISymbolEntry,
    type SymbolMetadata,
} from '../../@types/symbol-types';

/**
 * Immutable symbol entry implementation
 */
export class SymbolEntry implements ISymbolEntry {
    public readonly name: string;
    public readonly symbolType: SymbolType;
    public readonly scopeType: ScopeType;
    public readonly dataType: DataType;
    public readonly isUserDefined: boolean;
    public readonly isMutable: boolean;
    public readonly memoryLocation?: string;
    public readonly frameId?: string;
    public readonly metadata?: SymbolMetadata;
    public readonly id: string;

    /**
     * Creates a new symbol entry
     *
     * @param name - Symbol name/identifier
     * @param symbolType - Type of symbol (variable, function, etc.)
     * @param scopeType - Scope where symbol is defined
     * @param dataType - Data type of symbol value
     * @param options - Additional options for symbol creation
     */
    constructor(
        name: string,
        symbolType: SymbolType,
        scopeType: ScopeType,
        dataType: DataType,
        options: {
            isMutable?: boolean;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
            id?: string;
        } = {},
    ) {
        // Validate required parameters
        if (!name || typeof name !== 'string') {
            throw new Error('Symbol name must be a non-empty string');
        }

        if (!Object.values(SymbolType).includes(symbolType)) {
            throw new Error(`Invalid symbol type: ${symbolType}`);
        }

        if (!Object.values(ScopeType).includes(scopeType)) {
            throw new Error(`Invalid scope type: ${scopeType}`);
        }

        if (!Object.values(DataType).includes(dataType)) {
            throw new Error(`Invalid data type: ${dataType}`);
        }

        // Set readonly properties
        this.name = name;
        this.symbolType = symbolType;
        this.scopeType = scopeType;
        this.dataType = dataType;
        this.isMutable = options.isMutable ?? this._getDefaultMutability(symbolType);
        this.memoryLocation = options.memoryLocation;
        this.frameId = options.frameId;
        this.metadata = options.metadata ? this._deepFreezeMetadata(options.metadata) : undefined;
        this.id = options.id ?? uuidv4();

        // Determine if user-defined based on symbol type
        this.isUserDefined = this._isUserDefinedSymbol(symbolType);

        // Freeze the object to ensure immutability
        Object.freeze(this);
    }

    /**
     * Creates a new symbol entry with updated properties
     *
     * @param updates - Properties to update
     * @returns New SymbolEntry instance with updated properties
     */
    public withUpdates(updates: {
        memoryLocation?: string;
        frameId?: string;
        metadata?: SymbolMetadata;
    }): SymbolEntry {
        return new SymbolEntry(this.name, this.symbolType, this.scopeType, this.dataType, {
            isMutable: this.isMutable,
            memoryLocation: updates.memoryLocation ?? this.memoryLocation,
            frameId: updates.frameId ?? this.frameId,
            metadata: updates.metadata ?? this.metadata,
            id: this.id, // Keep same ID
        });
    }

    /**
     * Checks if this symbol can be shadowed by another symbol
     *
     * @returns true if symbol can be shadowed
     */
    public canBeShadowed(): boolean {
        // System symbols generally cannot be shadowed
        return this.isUserDefined;
    }

    /**
     * Checks if this symbol can be modified
     *
     * @returns true if symbol value can be modified
     */
    public canBeModified(): boolean {
        return this.isMutable;
    }

    /**
     * Checks if this symbol is a function
     *
     * @returns true if symbol represents a function
     */
    public isFunction(): boolean {
        return (
            this.symbolType === SymbolType.SYSTEM_FUNCTION ||
            this.symbolType === SymbolType.USER_FUNCTION
        );
    }

    /**
     * Checks if this symbol is a variable
     *
     * @returns true if symbol represents a variable
     */
    public isVariable(): boolean {
        return (
            this.symbolType === SymbolType.SYSTEM_VARIABLE ||
            this.symbolType === SymbolType.USER_VARIABLE ||
            this.symbolType === SymbolType.PARAMETER ||
            this.symbolType === SymbolType.ITERATOR
        );
    }

    /**
     * Gets the function metadata if this symbol is a function
     *
     * @returns Function metadata or null if not a function
     */
    public getFunctionMetadata(): SymbolMetadata['functionMetadata'] | null {
        if (!this.isFunction() || !this.metadata) {
            return null;
        }
        return this.metadata.functionMetadata ?? null;
    }

    /**
     * Gets the variable metadata if this symbol is a variable
     *
     * @returns Variable metadata or null if not a variable
     */
    public getVariableMetadata(): SymbolMetadata['variableMetadata'] | null {
        if (!this.isVariable() || !this.metadata) {
            return null;
        }
        return this.metadata.variableMetadata ?? null;
    }

    /**
     * Converts symbol entry to a plain object for serialization
     *
     * @returns Plain object representation
     */
    public toPlainObject(): Record<string, unknown> {
        return {
            id: this.id,
            name: this.name,
            symbolType: this.symbolType,
            scopeType: this.scopeType,
            dataType: this.dataType,
            isUserDefined: this.isUserDefined,
            isMutable: this.isMutable,
            memoryLocation: this.memoryLocation,
            frameId: this.frameId,
            metadata: this.metadata,
        };
    }

    /**
     * Creates a string representation of the symbol entry
     *
     * @returns String representation
     */
    public toString(): string {
        const parts = [
            `SymbolEntry(${this.name})`,
            `type=${this.symbolType}`,
            `scope=${this.scopeType}`,
            `dataType=${this.dataType}`,
            `userDefined=${this.isUserDefined}`,
            `mutable=${this.isMutable}`,
        ];

        if (this.memoryLocation) {
            parts.push(`memory=${this.memoryLocation}`);
        }

        if (this.frameId) {
            parts.push(`frame=${this.frameId}`);
        }

        return `{${parts.join(', ')}}`;
    }

    /**
     * Determines default mutability based on symbol type
     *
     * @param symbolType - The symbol type
     * @returns Default mutability setting
     */
    private _getDefaultMutability(symbolType: SymbolType): boolean {
        switch (symbolType) {
            case SymbolType.SYSTEM_FUNCTION:
            case SymbolType.USER_FUNCTION:
                // Functions are typically immutable
                return false;

            case SymbolType.SYSTEM_VARIABLE:
                // System variables are typically immutable
                return false;

            case SymbolType.USER_VARIABLE:
            case SymbolType.PARAMETER:
            case SymbolType.ITERATOR:
                // User variables and parameters are typically mutable
                return true;

            default:
                // Default to immutable for safety
                return false;
        }
    }

    /**
     * Determines if symbol is user-defined based on symbol type
     *
     * @param symbolType - The symbol type
     * @returns true if user-defined
     */
    private _isUserDefinedSymbol(symbolType: SymbolType): boolean {
        switch (symbolType) {
            case SymbolType.USER_VARIABLE:
            case SymbolType.USER_FUNCTION:
            case SymbolType.PARAMETER:
            case SymbolType.ITERATOR:
                return true;

            case SymbolType.SYSTEM_VARIABLE:
            case SymbolType.SYSTEM_FUNCTION:
                return false;

            default:
                return false;
        }
    }

    /**
     * Deep freezes metadata to ensure immutability
     *
     * @param metadata - Metadata to freeze
     * @returns Frozen metadata
     */
    private _deepFreezeMetadata(metadata: SymbolMetadata): SymbolMetadata {
        const frozen = { ...metadata };

        // Freeze nested objects
        if (frozen.sourceLocation) {
            frozen.sourceLocation = Object.freeze({ ...frozen.sourceLocation });
        }

        if (frozen.functionMetadata) {
            frozen.functionMetadata = Object.freeze({
                ...frozen.functionMetadata,
                parameterNames: Object.freeze([...frozen.functionMetadata.parameterNames]),
            });
        }

        if (frozen.variableMetadata) {
            frozen.variableMetadata = Object.freeze({ ...frozen.variableMetadata });
        }

        return Object.freeze(frozen);
    }
}

/**
 * Factory functions for creating common symbol types
 */
export class SymbolEntryFactory {
    /**
     * Creates a system variable symbol entry
     *
     * @param name - Variable name
     * @param dataType - Data type
     * @param options - Additional options
     * @returns SymbolEntry for system variable
     */
    public static createSystemVariable(
        name: string,
        dataType: DataType,
        options: {
            isMutable?: boolean;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        return new SymbolEntry(name, SymbolType.SYSTEM_VARIABLE, ScopeType.GLOBAL, dataType, {
            isMutable: false,
            ...options,
        });
    }

    /**
     * Creates a user variable symbol entry
     *
     * @param name - Variable name
     * @param dataType - Data type
     * @param scopeType - Scope type
     * @param options - Additional options
     * @returns SymbolEntry for user variable
     */
    public static createUserVariable(
        name: string,
        dataType: DataType,
        scopeType: ScopeType,
        options: {
            isMutable?: boolean;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        return new SymbolEntry(name, SymbolType.USER_VARIABLE, scopeType, dataType, {
            isMutable: true,
            ...options,
        });
    }

    /**
     * Creates a user function symbol entry
     *
     * @param name - Function name
     * @param scopeType - Scope type
     * @param parameterNames - Function parameter names
     * @param options - Additional options
     * @returns SymbolEntry for user function
     */
    public static createUserFunction(
        name: string,
        scopeType: ScopeType,
        parameterNames: readonly string[],
        options: {
            returnType?: DataType;
            isAsync?: boolean;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        const functionMetadata = {
            parameterCount: parameterNames.length,
            parameterNames,
            returnType: options.returnType,
            isAsync: options.isAsync ?? false,
        };

        const metadata: SymbolMetadata = {
            ...options.metadata,
            functionMetadata,
        };

        return new SymbolEntry(name, SymbolType.USER_FUNCTION, scopeType, DataType.FUNCTION, {
            isMutable: false,
            memoryLocation: options.memoryLocation,
            frameId: options.frameId,
            metadata,
        });
    }

    /**
     * Creates a parameter symbol entry
     *
     * @param name - Parameter name
     * @param dataType - Data type
     * @param options - Additional options
     * @returns SymbolEntry for parameter
     */
    public static createParameter(
        name: string,
        dataType: DataType,
        options: {
            defaultValue?: unknown;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        const variableMetadata = {
            isInitialized: options.defaultValue !== undefined,
            defaultValue: options.defaultValue,
        };

        const metadata: SymbolMetadata = {
            ...options.metadata,
            variableMetadata,
        };

        return new SymbolEntry(name, SymbolType.PARAMETER, ScopeType.PARAMETER, dataType, {
            isMutable: true,
            memoryLocation: options.memoryLocation,
            frameId: options.frameId,
            metadata,
        });
    }
}
