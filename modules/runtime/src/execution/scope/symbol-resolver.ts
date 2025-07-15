/**
 * Symbol Resolver Implementation
 *
 * This file implements the enhanced SymbolResolver class which provides symbol name
 * resolution with support for member expressions, enums, and access control.
 */

import {
    ISymbolResolver,
    ExecutionContext,
    DataType,
    type SymbolMetadata,
    SymbolNotFoundError,
    MemberAccessError,
    AccessControlError,
    EnumValidationError,
} from '../../@types/symbol-types';
import { SymbolTable } from './symbol-table';
import type { IThreadContext } from '../../@types/scope';

/**
 * SymbolResolver handles symbol name resolution and memory integration
 */
export class SymbolResolver<T extends object> implements ISymbolResolver<T> {
    private readonly _symbolTable: SymbolTable;
    private readonly _threadContext: IThreadContext<T>;

    constructor(symbolTable: SymbolTable, threadContext: IThreadContext<T>) {
        this._symbolTable = symbolTable;
        this._threadContext = threadContext;
    }

    /**
     * Resolve symbol name to memory location
     */
    resolveToMemoryLocation(name: string): string | null {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return null;
        }

        // Check if symbol has explicit memory location
        if (lookupResult.entry.memoryLocation) {
            return lookupResult.entry.memoryLocation;
        }

        // Generate memory location based on symbol metadata
        const metadata = lookupResult.entry.metadata;
        if (metadata?.memoryPointer) {
            return `${metadata.memoryPointer.threadId}:${metadata.memoryPointer.frameId}:${metadata.memoryPointer.variableName}`;
        }

        // Default: use symbol name as memory location
        return name;
    }

    /**
     * Resolve symbol name to frame ID
     */
    resolveToFrameId(name: string): string | null {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return null;
        }

        // Check if symbol has explicit frame ID
        if (lookupResult.entry.frameId) {
            return lookupResult.entry.frameId;
        }

        // Check memory pointer for frame ID
        const metadata = lookupResult.entry.metadata;
        if (metadata?.memoryPointer) {
            return metadata.memoryPointer.frameId;
        }

        return null;
    }

    /**
     * Resolve member expression to memory location
     */
    resolveMemberToMemoryLocation(objectName: string, propertyName: string): string | null {
        const memberResult = this._symbolTable.resolveMember(objectName, propertyName);
        if (!memberResult || !memberResult.exists) {
            return null;
        }

        // For enums, the memory location is the parent object + property
        if (memberResult.parentSymbol.isEnum()) {
            const parentLocation = this.resolveToMemoryLocation(objectName);
            return parentLocation ? `${parentLocation}.${propertyName}` : null;
        }

        // For dictionaries, the memory location includes the key
        if (memberResult.parentSymbol.isDictionary()) {
            const parentLocation = this.resolveToMemoryLocation(objectName);
            return parentLocation ? `${parentLocation}[${propertyName}]` : null;
        }

        // For general objects
        const parentLocation = this.resolveToMemoryLocation(objectName);
        return parentLocation ? `${parentLocation}.${propertyName}` : null;
    }

    /**
     * Get symbol metadata
     */
    getSymbolMetadata(name: string): SymbolMetadata | null {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return null;
        }

        return lookupResult.entry.metadata ?? null;
    }

    /**
     * Check if symbol is accessible from current context
     */
    isSymbolAccessible(name: string, executionContext?: ExecutionContext): boolean {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return false;
        }

        const effectiveContext = executionContext ?? this._symbolTable.getExecutionContext();

        // All symbols are readable, but write access has restrictions
        return this._symbolTable.validateSymbolUsage(name, 'read', effectiveContext);
    }

    /**
     * Check if member is accessible
     */
    isMemberAccessible(
        objectName: string,
        propertyName: string,
        executionContext?: ExecutionContext,
    ): boolean {
        const effectiveContext = executionContext ?? this._symbolTable.getExecutionContext();
        return this._symbolTable.validateMemberAccess(
            objectName,
            propertyName,
            false,
            effectiveContext,
        );
    }

    /**
     * Validate enum value
     */
    validateEnumValue(symbolName: string, value: string): boolean {
        return this._symbolTable.validateEnumValue(symbolName, value);
    }

    /**
     * Get enum possible values
     */
    getEnumPossibleValues(symbolName: string): readonly string[] | null {
        return this._symbolTable.getEnumPossibleValues(symbolName);
    }

    /**
     * Resolve symbol value through the memory system
     */
    resolveValue<K extends keyof T>(name: string): T[K] | undefined {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            throw new SymbolNotFoundError(name, this._symbolTable.getExecutionContext());
        }

        const localValue = this._threadContext.getLocal(name as K);
        if (localValue !== undefined) {
            return localValue;
        }

        return this._threadContext.getGlobal(name as K);
    }

    /**
     * Resolve member value through the memory system
     */
    resolveMemberValue<K extends keyof T>(
        objectName: string,
        propertyName: string,
    ): T[K] | string | undefined {
        const memberResult = this._symbolTable.resolveMember(objectName, propertyName);
        if (!memberResult || !memberResult.exists || !memberResult.isReadable) {
            throw new MemberAccessError(
                objectName,
                propertyName,
                'property not accessible',
                this._symbolTable.getExecutionContext(),
            );
        }

        // For enums, return the property name if it's a valid enum value
        if (memberResult.parentSymbol.isEnum()) {
            const enumMetadata = memberResult.parentSymbol.getEnumMetadata();
            if (enumMetadata && enumMetadata.possibleValues.includes(propertyName)) {
                return propertyName as T[K];
            }
        }

        // For dictionaries and objects, get the parent object and access the property
        if (
            memberResult.parentSymbol.isDictionary() ||
            memberResult.parentSymbol.dataType === DataType.OBJECT
        ) {
            // Get the parent object from memory
            const parentValue = this.resolveValue(objectName);
            if (parentValue && typeof parentValue === 'object' && parentValue !== null) {
                // Access the property from the object
                return (parentValue as Record<string, unknown>)[propertyName] as T[K];
            }
        }

        return undefined;
    }

    /**
     * Set symbol value through the memory system with access control
     */
    setValue<K extends keyof T>(
        name: string,
        value: T[K],
        executionContext?: ExecutionContext,
    ): void {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            throw new SymbolNotFoundError(name, executionContext);
        }

        const effectiveContext = executionContext ?? this._symbolTable.getExecutionContext();
        const entry = lookupResult.entry;

        // Validate access control
        if (!this._symbolTable.validateSymbolUsage(name, 'write', effectiveContext)) {
            throw new AccessControlError(name, 'write', effectiveContext);
        }

        // Validate enum values
        if (entry.isEnum() && typeof value === 'string') {
            if (!this.validateEnumValue(name, value)) {
                const possibleValues = this.getEnumPossibleValues(name) ?? [];
                throw new EnumValidationError(name, value, possibleValues, effectiveContext);
            }
        }

        // Set value in appropriate scope
        if (lookupResult.isInCurrentScope) {
            this._threadContext.setLocal(name as K, value);
        } else {
            this._threadContext.setGlobal(name as K, value);
        }
    }

    /**
     * Set member value through the memory system with access control
     */
    setMemberValue<K extends keyof T>(
        objectName: string,
        propertyName: string,
        value: T[K] | string,
        executionContext?: ExecutionContext,
    ): void {
        const effectiveContext = executionContext ?? this._symbolTable.getExecutionContext();

        if (
            !this._symbolTable.validateMemberAccess(
                objectName,
                propertyName,
                true,
                effectiveContext,
            )
        ) {
            throw new MemberAccessError(
                objectName,
                propertyName,
                'write access denied',
                effectiveContext,
            );
        }

        const memberResult = this._symbolTable.resolveMember(objectName, propertyName);
        if (!memberResult || !memberResult.isWritable) {
            throw new MemberAccessError(
                objectName,
                propertyName,
                'property not writable',
                effectiveContext,
            );
        }

        // Handle enum member assignment (not typically allowed)
        if (memberResult.parentSymbol.isEnum()) {
            throw new MemberAccessError(
                objectName,
                propertyName,
                'enum values are read-only',
                effectiveContext,
            );
        }

        // For dictionaries and objects, set through memory system
        const memberLocation = this.resolveMemberToMemoryLocation(objectName, propertyName);
        if (memberLocation) {
            // Simplified approach - in real implementation would handle nested object updates
            this._threadContext.setLocal(memberLocation as K, value as T[K]);
        }
    }

    /**
     * Get symbol entry information
     */
    getSymbolEntry(name: string): import('../../@types/symbol-types').ISymbolEntry | null {
        const lookupResult = this._symbolTable.lookup(name);
        return lookupResult?.entry ?? null;
    }

    /**
     * Check if symbol exists in any scope
     */
    symbolExists(name: string): boolean {
        return this._symbolTable.existsInAnyScope(name);
    }
}
