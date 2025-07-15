/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Table Basic Tests
 *
 * Simple test suite for symbol table features including
 * enums, arrays, dictionaries, and member expressions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolTable } from '../execution/scope/symbol-table';
import { SymbolType, DataType, ExecutionContext, AccessControlError } from '../@types/symbol-types';

describe('Enhanced Symbol Table - Basic Features', () => {
    let symbolTable: SymbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('Execution Context', () => {
        it('should set and get execution context', () => {
            expect(symbolTable.getExecutionContext()).toBe(ExecutionContext.USER_PROGRAM);

            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            expect(symbolTable.getExecutionContext()).toBe(ExecutionContext.MAIN_PROGRAM);
        });
    });

    describe('System Variable Types', () => {
        it('should declare system variable (immutable)', () => {
            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            const entry = symbolTable.declare('PI', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);

            expect(entry.symbolType).toBe(SymbolType.SYSTEM_VARIABLE);
            expect(entry.isMutable).toBe(false);
            expect(entry.isUserModifiable).toBe(false);
        });

        it('should declare configurable system variable', () => {
            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            const entry = symbolTable.declare(
                'config',
                SymbolType.SYSTEM_VARIABLE_CONFIGURABLE,
                DataType.STRING,
            );

            expect(entry.symbolType).toBe(SymbolType.SYSTEM_VARIABLE_CONFIGURABLE);
            expect(entry.isMutable).toBe(true);
            expect(entry.isUserModifiable).toBe(false);
        });

        it('should prevent user program from declaring system variables', () => {
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);

            expect(() => {
                symbolTable.declare('PI', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);
            }).toThrow(AccessControlError);
        });
    });

    describe('Enum Declaration', () => {
        it('should declare enum with metadata', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['red', 'green', 'blue'],
                    enumType: 'color',
                    currentValue: 'red',
                },
            };

            const entry = symbolTable.declare('color', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            expect(entry.dataType).toBe(DataType.ENUM);
            expect(entry.isEnum()).toBe(true);
            expect(entry.getEnumMetadata()).toEqual(enumMetadata.enumMetadata);
        });

        it('should validate enum values', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['do', 're', 'mi'],
                    enumType: 'note',
                },
            };

            symbolTable.declare('note', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            expect(symbolTable.validateEnumValue('note', 'do')).toBe(true);
            expect(symbolTable.validateEnumValue('note', 'fa')).toBe(false);
        });

        it('should get enum possible values', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['piano', 'guitar', 'violin'],
                    enumType: 'instrument',
                },
            };

            symbolTable.declare('instrument', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            const values = symbolTable.getEnumPossibleValues('instrument');
            expect(values).toEqual(['piano', 'guitar', 'violin']);
        });
    });

    describe('Array Declaration', () => {
        it('should declare array with metadata', () => {
            const arrayMetadata = {
                arrayMetadata: {
                    elementType: DataType.NUMBER,
                    maxLength: 10,
                    dimensions: 1,
                },
            };

            const entry = symbolTable.declare('numbers', SymbolType.USER_VARIABLE, DataType.ARRAY, {
                metadata: arrayMetadata,
            });

            expect(entry.dataType).toBe(DataType.ARRAY);
            expect(entry.isArray()).toBe(true);
            expect(entry.getArrayMetadata()).toEqual(arrayMetadata.arrayMetadata);
        });
    });

    describe('Dictionary Declaration', () => {
        it('should declare dictionary with metadata', () => {
            const dictMetadata = {
                dictionaryMetadata: {
                    keyType: DataType.STRING,
                    valueType: DataType.NUMBER,
                    allowDynamicKeys: true,
                    requiredKeys: ['x', 'y'],
                },
            };

            const entry = symbolTable.declare(
                'point',
                SymbolType.USER_VARIABLE,
                DataType.DICTIONARY,
                {
                    metadata: dictMetadata,
                },
            );

            expect(entry.dataType).toBe(DataType.DICTIONARY);
            expect(entry.isDictionary()).toBe(true);
            expect(entry.getDictionaryMetadata()).toEqual(dictMetadata.dictionaryMetadata);
        });
    });

    describe('Member Expression Resolution', () => {
        beforeEach(() => {
            // Declare an enum for testing member access
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['do', 're', 'mi', 'fa', 'sol'],
                    enumType: 'solfege',
                },
            };
            symbolTable.declare('solfege', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            const dictMetadata = {
                dictionaryMetadata: {
                    keyType: DataType.STRING,
                    valueType: DataType.NUMBER,
                    allowDynamicKeys: true,
                },
            };
            symbolTable.declare('scores', SymbolType.USER_VARIABLE, DataType.DICTIONARY, {
                metadata: dictMetadata,
            });
        });

        it('should resolve enum member access', () => {
            const result = symbolTable.resolveMember('solfege', 'do');

            expect(result).not.toBeNull();
            expect(result!.exists).toBe(true);
            expect(result!.isReadable).toBe(true);
            expect(result!.isWritable).toBe(false);
            expect(result!.propertyType).toBe(DataType.STRING);
        });

        it('should reject invalid enum member', () => {
            const result = symbolTable.resolveMember('solfege', 'invalid');

            expect(result).not.toBeNull();
            expect(result!.exists).toBe(false);
        });

        it('should resolve dictionary member access', () => {
            const result = symbolTable.resolveMember('scores', 'math');

            expect(result).not.toBeNull();
            expect(result!.exists).toBe(true);
            expect(result!.isReadable).toBe(true);
            expect(result!.isWritable).toBe(true);
            expect(result!.propertyType).toBe(DataType.NUMBER);
        });

        it('should return null for non-object member access', () => {
            symbolTable.declare('number', SymbolType.USER_VARIABLE, DataType.NUMBER);
            const result = symbolTable.resolveMember('number', 'property');

            expect(result).toBeNull();
        });
    });

    describe('Access Control Validation', () => {
        beforeEach(() => {
            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            symbolTable.declare('systemVar', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);
            symbolTable.declare(
                'configVar',
                SymbolType.SYSTEM_VARIABLE_CONFIGURABLE,
                DataType.NUMBER,
            );
            symbolTable.declare('userVar', SymbolType.USER_VARIABLE, DataType.NUMBER);
        });

        it('should validate symbol usage for read operations', () => {
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);

            expect(symbolTable.validateSymbolUsage('systemVar', 'read')).toBe(true);
            expect(symbolTable.validateSymbolUsage('configVar', 'read')).toBe(true);
            expect(symbolTable.validateSymbolUsage('userVar', 'read')).toBe(true);
        });

        it('should validate symbol usage for write operations', () => {
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);

            expect(symbolTable.validateSymbolUsage('systemVar', 'write')).toBe(false);
            expect(symbolTable.validateSymbolUsage('configVar', 'write')).toBe(false);
            expect(symbolTable.validateSymbolUsage('userVar', 'write')).toBe(true);
        });

        it('should validate member access', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['option1', 'option2'],
                    enumType: 'test',
                },
            };
            symbolTable.declare('testEnum', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            expect(symbolTable.validateMemberAccess('testEnum', 'option1', false)).toBe(true); // read
            expect(symbolTable.validateMemberAccess('testEnum', 'option1', true)).toBe(false); // write
        });
    });
});
