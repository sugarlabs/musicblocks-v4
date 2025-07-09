/**
 * Symbol Resolver Implementation
 *
 * This file implements the SymbolResolver class which provides symbol name
 * resolution to memory locations and integrates with the existing memory module.
 */

import {
    ISymbolResolver,
    type SymbolMetadata,
    SymbolNotFoundError,
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
     *
     * @param name - Symbol name to resolve
     * @returns Memory location string or null if not found
     */
    resolveToMemoryLocation(name: string): string | null {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return null;
        }

        return lookupResult.entry.memoryLocation ?? null;
    }

    /**
     * Resolve symbol name to frame ID
     *
     * @param name - Symbol name to resolve
     * @returns Frame ID string or null if not found
     */
    resolveToFrameId(name: string): string | null {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            return null;
        }

        return lookupResult.entry.frameId ?? null;
    }

    /**
     * Get symbol metadata
     *
     * @param name - Symbol name
     * @returns Symbol metadata or null if not found
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
     *
     * @param name - Symbol name
     * @returns true if symbol is accessible
     */
    isSymbolAccessible(name: string): boolean {
        const lookupResult = this._symbolTable.lookup(name);
        return lookupResult !== null;
    }

    /**
     * Resolve symbol value through the memory system
     *
     * @param name - Symbol name
     * @returns Symbol value or throws error if not found
     */
    resolveValue<K extends keyof T>(name: string): T[K] | undefined {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            throw new SymbolNotFoundError(name);
        }

        const localValue = this._threadContext.getLocal(name as K);
        if (localValue !== undefined) {
            return localValue;
        }

        return this._threadContext.getGlobal(name as K);
    }

    /**
     * Set symbol value through the memory system
     *
     * @param name - Symbol name
     * @param value - Value to set
     */
    setValue<K extends keyof T>(name: string, value: T[K]): void {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            throw new SymbolNotFoundError(name);
        }

        const entry = lookupResult.entry;

        if (!entry.isMutable) {
            throw new Error(`Cannot modify immutable symbol "${name}"`);
        }

        if (lookupResult.isInCurrentScope) {
            this._threadContext.setLocal(name as K, value);
        } else {
            this._threadContext.setGlobal(name as K, value);
        }
    }

    /**
     * Get symbol entry information
     *
     * @param name - Symbol name
     * @returns Symbol entry or null if not found
     */
    getSymbolEntry(name: string): import('../../@types/symbol-types').ISymbolEntry | null {
        const lookupResult = this._symbolTable.lookup(name);
        return lookupResult?.entry ?? null;
    }

    /**
     * Check if symbol exists in any scope
     *
     * @param name - Symbol name
     * @returns true if symbol exists
     */
    symbolExists(name: string): boolean {
        return this._symbolTable.existsInAnyScope(name);
    }
}
