/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Advanced Symbol Table Tests
 *
 * This test suite covers advanced and edge-case scenarios for SymbolTable,
 * including deep scope chains, shadowing, custom metadata, serialization,
 * error handling, and stress tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolTable } from '../execution/scope/symbol-table';
import {
    SymbolType,
    DataType,
    SymbolTableError,
    SymbolAlreadyExistsError,
} from '../@types/symbol-types';

describe('SymbolTable (Advanced)', () => {
    let symbolTable: SymbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('Deep Scope Chains & Shadowing', () => {
        it('should handle shadowing through multiple nested scopes', () => {
            symbolTable.declare('a', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('b', SymbolType.USER_VARIABLE, DataType.STRING);
            symbolTable.pushScope();
            symbolTable.declare('a', SymbolType.USER_VARIABLE, DataType.BOOLEAN);

            let result = symbolTable.lookup('a');
            expect(result!.entry.dataType).toBe(DataType.BOOLEAN);
            expect(result!.isInCurrentScope).toBe(true);

            symbolTable.popScope();
            result = symbolTable.lookup('a');
            expect(result!.entry.dataType).toBe(DataType.NUMBER);
            expect(result!.isInCurrentScope).toBe(false);

            result = symbolTable.lookup('b');
            expect(result!.entry.dataType).toBe(DataType.STRING);
            expect(result!.scopeDepth).toBe(1);
        });

        it('should remove only symbols in the current scope on pop', () => {
            symbolTable.declare('global', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('local', SymbolType.USER_VARIABLE, DataType.STRING);
            symbolTable.pushScope();
            symbolTable.declare('inner', SymbolType.USER_VARIABLE, DataType.BOOLEAN);

            symbolTable.popScope();
            expect(symbolTable.lookup('inner')).toBeNull();
            expect(symbolTable.lookup('local')).not.toBeNull();
            expect(symbolTable.lookup('global')).not.toBeNull();

            symbolTable.popScope();
            expect(symbolTable.lookup('local')).toBeNull();
            expect(symbolTable.lookup('global')).not.toBeNull();
        });
    });

    describe('Custom Metadata and Immutability', () => {
        it('should attach and retrieve custom metadata', () => {
            const metadata = {
                declaredAt: '2025-07-08T17:00:00Z',
                sourceLocation: { line: 10, column: 5, file: 'main.ts' },
                variableMetadata: { isInitialized: true, defaultValue: 123 },
                customField: 'extra',
            };
            const entry = symbolTable.declare('meta', SymbolType.USER_VARIABLE, DataType.NUMBER, {
                metadata,
            });
            expect(entry.metadata).toBeDefined();
            expect(entry.metadata!.declaredAt).toBe('2025-07-08T17:00:00Z');
            expect(entry.metadata!.customField).toBe('extra');
            // Check deep freeze: should throw if we try to mutate
            expect(() => {
                // @ts-expect-error
                entry.metadata.declaredAt = 'mutated';
            }).toThrow();
        });

        it('should deeply freeze nested metadata objects', () => {
            const metadata = {
                functionMetadata: {
                    parameterCount: 2,
                    parameterNames: ['x', 'y'],
                    isAsync: true,
                },
            };
            const entry = symbolTable.declare('f', SymbolType.USER_FUNCTION, DataType.FUNCTION, {
                metadata,
            });
            expect(Object.isFrozen(entry.metadata!.functionMetadata)).toBe(true);
            expect(Object.isFrozen(entry.metadata!.functionMetadata?.parameterNames)).toBe(true);
        });
    });

    describe('Serialization', () => {
        it('should serialize symbol entry to a plain object', () => {
            const meta = { variableMetadata: { isInitialized: true } };
            const entry = symbolTable.declare('foo', SymbolType.USER_VARIABLE, DataType.NUMBER, {
                metadata: meta,
            });
            const plainObj = entry.toPlainObject();
            expect(plainObj).toMatchObject({
                name: 'foo',
                symbolType: SymbolType.USER_VARIABLE,
                dataType: DataType.NUMBER,
                isUserDefined: true,
                isMutable: true,
                metadata: meta,
            });
        });

        it('should provide a readable string representation', () => {
            const entry = symbolTable.declare('bar', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(entry.toString()).toContain('SymbolEntry(bar)');
            expect(entry.toString()).toContain('type=user_variable');
        });
    });

    describe('Error Handling', () => {
        it('should throw SymbolAlreadyExistsError on redeclaration', () => {
            symbolTable.declare('dup', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(() =>
                symbolTable.declare('dup', SymbolType.USER_VARIABLE, DataType.STRING),
            ).toThrow(SymbolAlreadyExistsError);
        });

        it('should throw SymbolTableError if popping global scope', () => {
            expect(() => symbolTable.popScope()).toThrow(SymbolTableError);
        });

        it('should not throw when removing a non-existent symbol', () => {
            expect(() => symbolTable.removeSymbol('nope')).not.toThrow();
            expect(symbolTable.removeSymbol('nope')).toBe(false);
        });

        it('should throw error on invalid symbol declaration', () => {
            expect(() =>
                symbolTable.declare('', SymbolType.USER_VARIABLE, DataType.NUMBER),
            ).toThrow();
            expect(() =>
                // @ts-expect-error
                symbolTable.declare('x', 'not-a-type', DataType.NUMBER),
            ).toThrow();
        });
    });

    describe('Stress Tests', () => {
        it('should handle 1000+ symbol declarations and lookups', () => {
            for (let i = 0; i < 1000; i++) {
                symbolTable.declare(`var${i}`, SymbolType.USER_VARIABLE, DataType.NUMBER);
            }
            for (let i = 0; i < 1000; i++) {
                const res = symbolTable.lookup(`var${i}`);
                expect(res).not.toBeNull();
                expect(res!.entry.name).toBe(`var${i}`);
            }
        });

        it('should allow deep scope nesting (20 levels)', () => {
            for (let i = 0; i < 20; i++) {
                symbolTable.pushScope();
                symbolTable.declare(`a${i}`, SymbolType.USER_VARIABLE, DataType.NUMBER);
            }
            for (let i = 0; i < 20; i++) {
                const res = symbolTable.lookup(`a${i}`);
                expect(res).not.toBeNull();
            }
            for (let i = 0; i < 20; i++) {
                symbolTable.popScope();
            }
            for (let i = 0; i < 20; i++) {
                expect(symbolTable.lookup(`a${i}`)).toBeNull();
            }
        });
    });

    describe('Edge Cases', () => {
        it('should allow symbols with underscores, numbers, and unicode', () => {
            const names = ['_foo', 'bar123', '变量', '𝛼βγ'];
            for (const n of names) {
                symbolTable.declare(n, SymbolType.USER_VARIABLE, DataType.ANY);
            }
            for (const n of names) {
                const res = symbolTable.lookup(n);
                expect(res).not.toBeNull();
                expect(res!.entry.name).toBe(n);
            }
        });

        it('should clear all symbols in the current scope only', () => {
            symbolTable.declare('g', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.STRING);
            symbolTable.declare('y', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(symbolTable.getCurrentScopeSymbols().length).toBe(2);
            symbolTable.clearCurrentScope();
            expect(symbolTable.getCurrentScopeSymbols().length).toBe(0);
            expect(symbolTable.lookup('g')).not.toBeNull();
        });
    });

    describe('Factory Pattern and Mutation Flags', () => {
        it('should correctly set isMutable for system and user symbols', () => {
            const sys = symbolTable.declare('S', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);
            const user = symbolTable.declare('U', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(sys.isMutable).toBe(false);
            expect(user.isMutable).toBe(true);
        });
    });

    describe('Reset', () => {
        it('should reset the table to its initial state', () => {
            symbolTable.declare('foo', SymbolType.USER_VARIABLE, DataType.NUMBER);
            symbolTable.pushScope();
            symbolTable.declare('bar', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(symbolTable.getCurrentScopeDepth()).toBe(1);
            symbolTable.reset();
            expect(symbolTable.getCurrentScopeDepth()).toBe(0);
            expect(symbolTable.getCurrentScopeSymbols()).toHaveLength(0);
        });
    });
});
