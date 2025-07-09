/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ISymbolTable,
    SymbolType,
    DataType,
    ScopeType,
    SymbolLookupResult,
    ISymbolEntry,
    SymbolTableError,
    SymbolAlreadyExistsError,
} from '../../@types/symbol-types';
import { SymbolEntry } from './symbol-entry';

/**
 * SymbolTable class manages symbol declarations, lookups, and scopes.
 */
export class SymbolTable implements ISymbolTable<object> {
    private readonly _scopes: Array<Map<string, ISymbolEntry>> = [new Map()];

    /** Declare a new symbol */
    declare(
        name: string,
        symbolType: SymbolType,
        dataType: DataType,
        options: { isMutable?: boolean; metadata?: Record<string, any>; frameId?: string } = {},
    ): ISymbolEntry {
        if (this.existsInCurrentScope(name)) {
            throw new SymbolAlreadyExistsError(name);
        }

        const newEntry = new SymbolEntry(name, symbolType, ScopeType.FUNCTION, dataType, options);
        this._scopes[this._currentScopeIndex()].set(name, newEntry);
        return newEntry;
    }

    /** Look up a symbol by name */
    lookup(name: string): SymbolLookupResult | null {
        for (let i = this._currentScopeIndex(); i >= 0; i--) {
            const entry = this._scopes[i].get(name);
            if (entry) {
                return { entry, scopeDepth: i, isInCurrentScope: i === this._currentScopeIndex() };
            }
        }

        return null;
    }

    /** Check if symbol exists in the current scope */
    existsInCurrentScope(name: string): boolean {
        return this._scopes[this._currentScopeIndex()].has(name);
    }

    /** Check if symbol exists in any accessible scope */
    existsInAnyScope(name: string): boolean {
        return !!this.lookup(name);
    }

    /** Get all symbols in the current scope */
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

    /** Exit the current scope */
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

    /** Validate symbol usage - placeholder */
    validateSymbolUsage(name: string, _context: string): boolean {
        return !!this.lookup(name);
    }

    /** Remove symbol from current scope */
    removeSymbol(name: string): boolean {
        return this._scopes[this._currentScopeIndex()].delete(name);
    }

    /** Clear all symbols in the current scope */
    clearCurrentScope(): void {
        this._scopes[this._currentScopeIndex()].clear();
    }

    /** Reset symbol table to initial state */
    reset(): void {
        this._scopes.length = 1;
        this.clearCurrentScope();
    }

    /** Internal method to get current scope index */
    private _currentScopeIndex(): number {
        return this._scopes.length - 1;
    }
}
