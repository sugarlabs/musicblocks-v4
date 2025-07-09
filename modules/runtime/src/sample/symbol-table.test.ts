/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Table and Symbol Resolver Tests
 *
 * Comprehensive test suite for the symbol table system including
 * symbol declarations, lookups, scope management, and memory integration.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolTable } from '../execution/scope/symbol-table';
import { SymbolResolver } from '../execution/scope/symbol-resolver';
import {
    SymbolType,
    DataType,
    SymbolAlreadyExistsError,
    SymbolNotFoundError,
} from '../@types/symbol-types';
import { ThreadManager } from '../execution/scope/thread';

interface TestKeyMap {
    x: number;
    y: string;
    z: boolean;
    [key: string]: any;
}

describe('SymbolTable', () => {
    let symbolTable: SymbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('Symbol Declaration', () => {
        it('should declare a simple user variable', () => {
            const entry = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);

            expect(entry.name).toBe('x');
            expect(entry.symbolType).toBe(SymbolType.USER_VARIABLE);
            expect(entry.dataType).toBe(DataType.NUMBER);
            expect(entry.isUserDefined).toBe(true);
            expect(entry.isMutable).toBe(true);
        });

        it('should declare a system variable as immutable', () => {
            const entry = symbolTable.declare('PI', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);

            expect(entry.name).toBe('PI');
            expect(entry.symbolType).toBe(SymbolType.SYSTEM_VARIABLE);
            expect(entry.isMutable).toBe(false);
            expect(entry.isUserDefined).toBe(false);
        });

        it('should declare a user function', () => {
            const entry = symbolTable.declare(
                'myFunc',
                SymbolType.USER_FUNCTION,
                DataType.FUNCTION,
                {
                    metadata: {
                        functionMetadata: {
                            parameterCount: 2,
                            parameterNames: ['a', 'b'],
                            returnType: DataType.NUMBER,
                        },
                    },
                },
            );

            expect(entry.name).toBe('myFunc');
            expect(entry.symbolType).toBe(SymbolType.USER_FUNCTION);
            expect(entry.dataType).toBe(DataType.FUNCTION);
            expect(entry.isFunction()).toBe(true);
            expect(entry.getFunctionMetadata()).toEqual({
                parameterCount: 2,
                parameterNames: ['a', 'b'],
                returnType: DataType.NUMBER,
            });
        });

        it('should prevent duplicate symbol declaration in same scope', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);

            expect(() => {
                symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.STRING);
            }).toThrow(SymbolAlreadyExistsError);
        });

        it('should allow declaring symbol with same name in different scope', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();

            const entry = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(entry.dataType).toBe(DataType.STRING);
        });
    });

    describe('Symbol Lookup', () => {
        it('should find symbol in current scope', () => {
            const declared = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            const result = symbolTable.lookup('x');

            expect(result).not.toBeNull();
            expect(result!.entry).toBe(declared);
            expect(result!.isInCurrentScope).toBe(true);
            expect(result!.scopeDepth).toBe(0);
        });

        it('should find symbol in parent scope', () => {
            const declared = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();

            const result = symbolTable.lookup('x');
            expect(result).not.toBeNull();
            expect(result!.entry).toBe(declared);
            expect(result!.isInCurrentScope).toBe(false);
            expect(result!.scopeDepth).toBe(0);
        });

        it('should return null for non-existent symbol', () => {
            const result = symbolTable.lookup('nonexistent');
            expect(result).toBeNull();
        });

        it('should find closest scope symbol (shadowing)', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            const shadowing = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.STRING);

            const result = symbolTable.lookup('x');
            expect(result!.entry).toBe(shadowing);
            expect(result!.entry.dataType).toBe(DataType.STRING);
        });
    });

    describe('Scope Management', () => {
        it('should start with depth 0', () => {
            expect(symbolTable.getCurrentScopeDepth()).toBe(0);
        });

        it('should increase depth when pushing scope', () => {
            symbolTable.pushScope();
            expect(symbolTable.getCurrentScopeDepth()).toBe(1);

            symbolTable.pushScope();
            expect(symbolTable.getCurrentScopeDepth()).toBe(2);
        });

        it('should decrease depth when popping scope', () => {
            symbolTable.pushScope();
            symbolTable.pushScope();
            expect(symbolTable.getCurrentScopeDepth()).toBe(2);

            symbolTable.popScope();
            expect(symbolTable.getCurrentScopeDepth()).toBe(1);
        });

        it('should not allow popping global scope', () => {
            expect(() => symbolTable.popScope()).toThrow('Cannot pop the global scope');
        });

        it('should remove symbols when popping scope', () => {
            symbolTable.declare('global', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('local', SymbolType.USER_VARIABLE, DataType.STRING);

            expect(symbolTable.existsInAnyScope('local')).toBe(true);
            symbolTable.popScope();
            expect(symbolTable.existsInAnyScope('local')).toBe(false);
            expect(symbolTable.existsInAnyScope('global')).toBe(true);
        });
    });

    describe('Symbol Queries', () => {
        beforeEach(() => {
            symbolTable.declare('global1', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.declare('global2', SymbolType.SYSTEM_VARIABLE, DataType.STRING);
            symbolTable.pushScope();
            symbolTable.declare('local1', SymbolType.USER_VARIABLE, DataType.BOOLEAN);
        });

        it('should check existence in current scope', () => {
            expect(symbolTable.existsInCurrentScope('local1')).toBe(true);
            expect(symbolTable.existsInCurrentScope('global1')).toBe(false);
        });

        it('should check existence in any scope', () => {
            expect(symbolTable.existsInAnyScope('local1')).toBe(true);
            expect(symbolTable.existsInAnyScope('global1')).toBe(true);
            expect(symbolTable.existsInAnyScope('nonexistent')).toBe(false);
        });

        it('should get current scope symbols', () => {
            const symbols = symbolTable.getCurrentScopeSymbols();
            expect(symbols).toHaveLength(1);
            expect(symbols[0].name).toBe('local1');
        });

        it('should get all accessible symbols', () => {
            const symbols = symbolTable.getAllAccessibleSymbols();
            expect(symbols).toHaveLength(3);

            const names = symbols.map((s) => s.name);
            expect(names).toContain('global1');
            expect(names).toContain('global2');
            expect(names).toContain('local1');
        });
    });

    describe('Symbol Management', () => {
        it('should remove symbol from current scope', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(symbolTable.existsInCurrentScope('x')).toBe(true);

            const removed = symbolTable.removeSymbol('x');
            expect(removed).toBe(true);
            expect(symbolTable.existsInCurrentScope('x')).toBe(false);
        });

        it('should return false when removing non-existent symbol', () => {
            const removed = symbolTable.removeSymbol('nonexistent');
            expect(removed).toBe(false);
        });

        it('should clear current scope', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.declare('y', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(symbolTable.getCurrentScopeSymbols()).toHaveLength(2);

            symbolTable.clearCurrentScope();
            expect(symbolTable.getCurrentScopeSymbols()).toHaveLength(0);
        });

        it('should reset to initial state', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('y', SymbolType.USER_VARIABLE, DataType.STRING);

            symbolTable.reset();
            expect(symbolTable.getCurrentScopeDepth()).toBe(0);
            expect(symbolTable.getCurrentScopeSymbols()).toHaveLength(0);
        });
    });
});

describe('SymbolResolver', () => {
    let symbolTable: SymbolTable;
    let symbolResolver: SymbolResolver<TestKeyMap>;
    let threadManager: ThreadManager<TestKeyMap>;
    let threadContext: any;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        threadManager = new ThreadManager<TestKeyMap>({ x: 0, y: '', z: false });
        threadContext = threadManager.createThread();
        symbolResolver = new SymbolResolver(symbolTable, threadContext);
    });

    describe('Symbol Resolution', () => {
        it('should return null for non-existent symbol memory location', () => {
            const location = symbolResolver.resolveToMemoryLocation('nonexistent');
            expect(location).toBeNull();
        });

        it('should resolve frame ID for symbol', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER, {
                frameId: 'frame_456',
            });

            const frameId = symbolResolver.resolveToFrameId('x');
            expect(frameId).toBe('frame_456');
        });

        it('should get symbol metadata', () => {
            const metadata = {
                variableMetadata: {
                    isInitialized: true,
                    defaultValue: 42,
                },
            };

            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER, { metadata });

            const resolvedMetadata = symbolResolver.getSymbolMetadata('x');
            expect(resolvedMetadata).toEqual(metadata);
        });
    });

    describe('Symbol Accessibility', () => {
        it('should check if symbol is accessible', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);

            expect(symbolResolver.isSymbolAccessible('x')).toBe(true);
            expect(symbolResolver.isSymbolAccessible('nonexistent')).toBe(false);
        });

        it('should check symbol existence', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);

            expect(symbolResolver.symbolExists('x')).toBe(true);
            expect(symbolResolver.symbolExists('nonexistent')).toBe(false);
        });
    });

    describe('Value Resolution and Setting', () => {
        it('should resolve symbol value from local context', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            threadContext.setLocal('x', 42);

            const value = symbolResolver.resolveValue('x');
            expect(value).toBe(42);
        });

        it('should resolve symbol value from global context', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            threadContext.setGlobal('x', 100);
            symbolTable.pushScope();

            const value = symbolResolver.resolveValue('x');
            expect(value).toBe(100);
        });

        it('should throw error when resolving non-existent symbol', () => {
            expect(() => {
                symbolResolver.resolveValue('nonexistent');
            }).toThrow(SymbolNotFoundError);
        });

        it('should set mutable symbol value', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER, {
                isMutable: true,
            });

            symbolResolver.setValue('x', 42);
            const value = symbolResolver.resolveValue('x');
            expect(value).toBe(42);
        });

        it('should prevent setting immutable symbol value', () => {
            symbolTable.declare('PI', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER, {
                isMutable: false,
            });

            expect(() => {
                symbolResolver.setValue('PI', 3.14159);
            }).toThrow('Cannot modify immutable symbol "PI"');
        });

        it('should throw error when setting non-existent symbol', () => {
            expect(() => {
                symbolResolver.setValue('nonexistent', 42);
            }).toThrow(SymbolNotFoundError);
        });
    });

    describe('Symbol Entry Access', () => {
        it('should get symbol entry', () => {
            const declared = symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER);
            const entry = symbolResolver.getSymbolEntry('x');

            expect(entry).toBe(declared);
        });

        it('should return null for non-existent symbol entry', () => {
            const entry = symbolResolver.getSymbolEntry('nonexistent');
            expect(entry).toBeNull();
        });
    });
});
