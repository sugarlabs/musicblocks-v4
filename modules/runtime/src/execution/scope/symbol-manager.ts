/* eslint-disable @typescript-eslint/no-wrapper-object-types */
/**
 * Symbol Manager - Integrated Symbol Table and Memory Management
 *
 * This class provides a unified interface that coordinates symbol table operations
 * with memory management through ThreadContext, ensuring both systems stay in sync.
 */

import { SymbolTable } from './symbol-table';
import { SymbolResolver } from './symbol-resolver';
import {
    SymbolType,
    DataType,
    type ISymbolEntry,
    type SymbolMetadata,
    type SymbolLookupResult,
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
        } = {},
    ): ISymbolEntry {
        // Declare in symbol table
        const entry = this._symbolTable.declare(name, symbolType, dataType, options);

        // Set initial value if provided - use direct context setting to bypass mutability check during declaration
        if (initialValue !== undefined) {
            this._threadContext.setLocal(name as K, initialValue);
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
     * Set symbol value
     */
    setValue<K extends keyof T>(name: string, value: T[K]): void {
        const lookupResult = this._symbolTable.lookup(name);
        if (!lookupResult) {
            throw new Error(`Symbol "${name}" not found`);
        }

        const entry = lookupResult.entry;

        if (!entry.isMutable) {
            throw new Error(`Cannot modify immutable symbol "${name}"`);
        }
        this._threadContext.setLocal(name as K, value);
    }

    /**
     * Lookup symbol information
     */
    lookup(name: string): SymbolLookupResult | null {
        return this._symbolTable.lookup(name);
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
     * Reset both symbol table and memory to initial state
     */
    reset(): void {
        this._symbolTable.reset();
        // Note: We don't reset ThreadContext as it may have global state
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
    isSymbolAccessible(name: string): boolean {
        return this._symbolResolver.isSymbolAccessible(name);
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
