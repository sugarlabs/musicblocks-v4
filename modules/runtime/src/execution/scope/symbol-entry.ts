/**
 * Symbol Entry Implementation
 *
 * This file implements the enhanced SymbolEntry class which represents individual symbol
 * metadata entries with support for member expressions, enums, arrays, and dictionaries.
 */

import { v4 as uuidv4 } from 'uuid';
import {
    SymbolType,
    ScopeType,
    DataType,
    type ISymbolEntry,
    type SymbolMetadata,
    type EnumMetadata,
    type ArrayMetadata,
    type DictionaryMetadata,
    type ObjectPropertyMetadata,
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
    public readonly isUserModifiable: boolean;
    public readonly memoryLocation?: string;
    public readonly frameId?: string;
    public readonly metadata?: SymbolMetadata;
    public readonly id: string;

    /**
     * Creates a new enhanced symbol entry
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
        this.isUserModifiable = this._getDefaultUserModifiability(symbolType);
        this.memoryLocation = options.memoryLocation;
        this.frameId = options.frameId;
        this.metadata = options.metadata ? this._deepFreezeMetadata(options.metadata) : undefined;
        this.id = options.id ?? uuidv4();

        // Determine if user-defined based on symbol type
        this.isUserDefined = this._isUserDefinedSymbol(symbolType);

        // Validate metadata consistency with data type
        this._validateMetadataConsistency();

        // Freeze the object to ensure immutability
        Object.freeze(this);
    }

    /**
     * Creates a new symbol entry with updated properties
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
     */
    public canBeShadowed(): boolean {
        // System symbols generally cannot be shadowed
        return this.isUserDefined;
    }

    /**
     * Checks if this symbol can be modified
     */
    public canBeModified(): boolean {
        return this.isMutable;
    }

    /**
     * Checks if this symbol can be modified by user programs
     */
    public canBeModifiedByUser(): boolean {
        return this.isUserModifiable && this.isMutable;
    }

    /**
     * Checks if this symbol is a function
     */
    public isFunction(): boolean {
        return (
            this.symbolType === SymbolType.SYSTEM_FUNCTION ||
            this.symbolType === SymbolType.USER_FUNCTION
        );
    }

    /**
     * Checks if this symbol is a variable
     */
    public isVariable(): boolean {
        return (
            this.symbolType === SymbolType.SYSTEM_VARIABLE ||
            this.symbolType === SymbolType.SYSTEM_VARIABLE_CONFIGURABLE ||
            this.symbolType === SymbolType.USER_VARIABLE ||
            this.symbolType === SymbolType.PARAMETER ||
            this.symbolType === SymbolType.ITERATOR
        );
    }

    /**
     * Checks if this symbol is an enum
     */
    public isEnum(): boolean {
        return this.dataType === DataType.ENUM;
    }

    /**
     * Checks if this symbol is an array
     */
    public isArray(): boolean {
        return this.dataType === DataType.ARRAY;
    }

    /**
     * Checks if this symbol is a dictionary
     */
    public isDictionary(): boolean {
        return this.dataType === DataType.DICTIONARY;
    }

    /**
     * Checks if this symbol is a member reference (part of member expression)
     */
    public isMemberReference(): boolean {
        return this.metadata?.objectPropertyMetadata !== undefined;
    }

    /**
     * Gets the function metadata if this symbol is a function
     */
    public getFunctionMetadata(): SymbolMetadata['functionMetadata'] | null {
        if (!this.isFunction() || !this.metadata) {
            return null;
        }
        return this.metadata.functionMetadata ?? null;
    }

    /**
     * Gets the variable metadata if this symbol is a variable
     */
    public getVariableMetadata(): SymbolMetadata['variableMetadata'] | null {
        if (!this.isVariable() || !this.metadata) {
            return null;
        }
        return this.metadata.variableMetadata ?? null;
    }

    /**
     * Gets the enum metadata if this symbol is an enum
     */
    public getEnumMetadata(): EnumMetadata | null {
        if (!this.isEnum() || !this.metadata) {
            return null;
        }
        return this.metadata.enumMetadata ?? null;
    }

    /**
     * Gets the array metadata if this symbol is an array
     */
    public getArrayMetadata(): ArrayMetadata | null {
        if (!this.isArray() || !this.metadata) {
            return null;
        }
        return this.metadata.arrayMetadata ?? null;
    }

    /**
     * Gets the dictionary metadata if this symbol is a dictionary
     */
    public getDictionaryMetadata(): DictionaryMetadata | null {
        if (!this.isDictionary() || !this.metadata) {
            return null;
        }
        return this.metadata.dictionaryMetadata ?? null;
    }

    /**
     * Gets the object property metadata if this symbol is a member reference
     */
    public getObjectPropertyMetadata(): ObjectPropertyMetadata | null {
        if (!this.metadata) {
            return null;
        }
        return this.metadata.objectPropertyMetadata ?? null;
    }

    /**
     * Converts symbol entry to a plain object for serialization
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
            isUserModifiable: this.isUserModifiable,
            memoryLocation: this.memoryLocation,
            frameId: this.frameId,
            metadata: this.metadata,
        };
    }

    /**
     * Creates a string representation of the symbol entry
     */
    public toString(): string {
        const parts = [
            `SymbolEntry(${this.name})`,
            `type=${this.symbolType}`,
            `scope=${this.scopeType}`,
            `dataType=${this.dataType}`,
            `userDefined=${this.isUserDefined}`,
            `mutable=${this.isMutable}`,
            `userModifiable=${this.isUserModifiable}`,
        ];

        if (this.memoryLocation) {
            parts.push(`memory=${this.memoryLocation}`);
        }

        if (this.frameId) {
            parts.push(`frame=${this.frameId}`);
        }

        if (this.isEnum() && this.metadata?.enumMetadata) {
            parts.push(`enumType=${this.metadata.enumMetadata.enumType}`);
        }

        return `{${parts.join(', ')}}`;
    }

    /**
     * Determines default mutability based on symbol type
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

            case SymbolType.SYSTEM_VARIABLE_CONFIGURABLE:
            case SymbolType.USER_VARIABLE:
            case SymbolType.PARAMETER:
            case SymbolType.ITERATOR:
                // These are typically mutable
                return true;

            default:
                // Default to immutable for safety
                return false;
        }
    }

    /**
     * Determines default user modifiability based on symbol type
     */
    private _getDefaultUserModifiability(symbolType: SymbolType): boolean {
        switch (symbolType) {
            case SymbolType.SYSTEM_VARIABLE:
            case SymbolType.SYSTEM_FUNCTION:
                // System symbols cannot be modified by user programs
                return false;

            case SymbolType.SYSTEM_VARIABLE_CONFIGURABLE:
                // Configurable system variables can only be modified by main program
                return false;

            case SymbolType.USER_VARIABLE:
            case SymbolType.USER_FUNCTION:
            case SymbolType.PARAMETER:
            case SymbolType.ITERATOR:
                // User symbols can be modified by user programs
                return true;

            default:
                return false;
        }
    }

    /**
     * Determines if symbol is user-defined based on symbol type
     */
    private _isUserDefinedSymbol(symbolType: SymbolType): boolean {
        switch (symbolType) {
            case SymbolType.USER_VARIABLE:
            case SymbolType.USER_FUNCTION:
            case SymbolType.PARAMETER:
            case SymbolType.ITERATOR:
                return true;

            case SymbolType.SYSTEM_VARIABLE:
            case SymbolType.SYSTEM_VARIABLE_CONFIGURABLE:
            case SymbolType.SYSTEM_FUNCTION:
                return false;

            default:
                return false;
        }
    }

    /**
     * Validates metadata consistency with data type
     */
    private _validateMetadataConsistency(): void {
        if (!this.metadata) {
            return;
        }

        // Validate enum metadata
        if (this.dataType === DataType.ENUM) {
            if (!this.metadata.enumMetadata) {
                throw new Error(`Enum symbol "${this.name}" must have enumMetadata`);
            }
            if (
                !this.metadata.enumMetadata.possibleValues ||
                this.metadata.enumMetadata.possibleValues.length === 0
            ) {
                throw new Error(`Enum symbol "${this.name}" must have non-empty possibleValues`);
            }
        }

        // Validate array metadata
        if (this.dataType === DataType.ARRAY) {
            if (!this.metadata.arrayMetadata) {
                throw new Error(`Array symbol "${this.name}" must have arrayMetadata`);
            }
        }

        // Validate dictionary metadata
        if (this.dataType === DataType.DICTIONARY) {
            if (!this.metadata.dictionaryMetadata) {
                throw new Error(`Dictionary symbol "${this.name}" must have dictionaryMetadata`);
            }
        }
    }

    /**
     * Deep freezes metadata to ensure immutability
     */
    private _deepFreezeMetadata(metadata: SymbolMetadata): SymbolMetadata {
        const frozen = { ...metadata };

        // Freeze nested objects
        if (frozen.sourceLocation) {
            frozen.sourceLocation = Object.freeze({ ...frozen.sourceLocation });
        }

        if (frozen.memoryPointer) {
            frozen.memoryPointer = Object.freeze({ ...frozen.memoryPointer });
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

        if (frozen.enumMetadata) {
            frozen.enumMetadata = Object.freeze({
                ...frozen.enumMetadata,
                possibleValues: Object.freeze([...frozen.enumMetadata.possibleValues]),
            });
        }

        if (frozen.arrayMetadata) {
            frozen.arrayMetadata = Object.freeze({ ...frozen.arrayMetadata });
        }

        if (frozen.dictionaryMetadata) {
            frozen.dictionaryMetadata = Object.freeze({
                ...frozen.dictionaryMetadata,
                requiredKeys: frozen.dictionaryMetadata.requiredKeys
                    ? Object.freeze([...frozen.dictionaryMetadata.requiredKeys])
                    : undefined,
            });
        }

        if (frozen.objectPropertyMetadata) {
            frozen.objectPropertyMetadata = Object.freeze({ ...frozen.objectPropertyMetadata });
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
     * Creates a configurable system variable symbol entry
     */
    public static createSystemVariableConfigurable(
        name: string,
        dataType: DataType,
        options: {
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        return new SymbolEntry(
            name,
            SymbolType.SYSTEM_VARIABLE_CONFIGURABLE,
            ScopeType.GLOBAL,
            dataType,
            {
                isMutable: true,
                ...options,
            },
        );
    }

    /**
     * Creates a user variable symbol entry
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
     * Creates an enum symbol entry
     */
    public static createEnum(
        name: string,
        enumType: string,
        possibleValues: readonly string[],
        scopeType: ScopeType = ScopeType.GLOBAL,
        options: {
            currentValue?: string;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        const enumMetadata: EnumMetadata = {
            possibleValues,
            currentValue: options.currentValue,
            enumType,
        };

        const metadata: SymbolMetadata = {
            ...options.metadata,
            enumMetadata,
        };

        return new SymbolEntry(name, SymbolType.USER_VARIABLE, scopeType, DataType.ENUM, {
            isMutable: true,
            memoryLocation: options.memoryLocation,
            frameId: options.frameId,
            metadata,
        });
    }

    /**
     * Creates an array symbol entry
     */
    public static createArray(
        name: string,
        elementType: DataType,
        scopeType: ScopeType,
        options: {
            dimensions?: number;
            maxLength?: number;
            minLength?: number;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        const arrayMetadata: ArrayMetadata = {
            elementType,
            dimensions: options.dimensions,
            maxLength: options.maxLength,
            minLength: options.minLength,
        };

        const metadata: SymbolMetadata = {
            ...options.metadata,
            arrayMetadata,
        };

        return new SymbolEntry(name, SymbolType.USER_VARIABLE, scopeType, DataType.ARRAY, {
            isMutable: true,
            memoryLocation: options.memoryLocation,
            frameId: options.frameId,
            metadata,
        });
    }

    /**
     * Creates a dictionary symbol entry
     */
    public static createDictionary(
        name: string,
        keyType: DataType,
        valueType: DataType,
        scopeType: ScopeType,
        options: {
            requiredKeys?: readonly string[];
            allowDynamicKeys?: boolean;
            maxSize?: number;
            memoryLocation?: string;
            frameId?: string;
            metadata?: SymbolMetadata;
        } = {},
    ): SymbolEntry {
        const dictionaryMetadata: DictionaryMetadata = {
            keyType,
            valueType,
            requiredKeys: options.requiredKeys,
            allowDynamicKeys: options.allowDynamicKeys ?? true,
            maxSize: options.maxSize,
        };

        const metadata: SymbolMetadata = {
            ...options.metadata,
            dictionaryMetadata,
        };

        return new SymbolEntry(name, SymbolType.USER_VARIABLE, scopeType, DataType.DICTIONARY, {
            isMutable: true,
            memoryLocation: options.memoryLocation,
            frameId: options.frameId,
            metadata,
        });
    }

    /**
     * Creates a user function symbol entry
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
