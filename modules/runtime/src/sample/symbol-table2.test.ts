/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Resolver Tests
 *
 * Simple test suite for symbol resolver with
 * member expression resolution and access control.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolTable } from '../execution/scope/symbol-table';
import { SymbolResolver } from '../execution/scope/symbol-resolver';
import {
    SymbolType,
    DataType,
    ExecutionContext,
    SymbolNotFoundError,
    MemberAccessError,
    AccessControlError,
    EnumValidationError,
} from '../@types/symbol-types';
import { ThreadManager } from '../execution/scope/thread';

interface TestContext {
    solfege: string;
    point: { [key: string]: number };
    [key: string]: any;
}

describe('Enhanced Symbol Resolver', () => {
    let symbolTable: SymbolTable;
    let symbolResolver: SymbolResolver<TestContext>;
    let threadManager: ThreadManager<TestContext>;
    let threadContext: any;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        threadManager = new ThreadManager<TestContext>({
            solfege: '',
            point: {},
        });
        threadContext = threadManager.createThread();
        symbolResolver = new SymbolResolver(symbolTable, threadContext);
    });

    describe('Memory Pointer Resolution', () => {
        it('should resolve memory location for symbol', () => {
            symbolTable.declare('x', SymbolType.USER_VARIABLE, DataType.NUMBER, {
                metadata: {
                    memoryPointer: {
                        threadId: 'thread_1',
                        frameId: 'frame_1',
                        variableName: 'memory_123',
                    },
                },
            });
        });

        it('should resolve frame ID for symbol', () => {
            symbolTable.declare('y', SymbolType.USER_VARIABLE, DataType.STRING, {
                frameId: 'frame_456',
            });

            const frameId = symbolResolver.resolveToFrameId('y');
            expect(frameId).toBe('frame_456');
        });

        it('should use memory pointer for location resolution', () => {
            const metadata = {
                memoryPointer: {
                    threadId: 'thread_1',
                    frameId: 'frame_2',
                    variableName: 'var_3',
                },
            };

            symbolTable.declare('z', SymbolType.USER_VARIABLE, DataType.BOOLEAN, { metadata });

            const location = symbolResolver.resolveToMemoryLocation('z');
            expect(location).toBe('thread_1:frame_2:var_3');
        });

        it('should return null for non-existent symbol', () => {
            const location = symbolResolver.resolveToMemoryLocation('nonexistent');
            expect(location).toBeNull();

            const frameId = symbolResolver.resolveToFrameId('nonexistent');
            expect(frameId).toBeNull();
        });
    });

    describe('Member Expression Resolution', () => {
        beforeEach(() => {
            // Declare enum for testing
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['do', 're', 'mi', 'fa', 'sol'],
                    enumType: 'solfege',
                },
            };
            symbolTable.declare('solfege', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            // Declare dictionary for testing
            const dictMetadata = {
                dictionaryMetadata: {
                    keyType: DataType.STRING,
                    valueType: DataType.NUMBER,
                    allowDynamicKeys: true,
                },
            };
            symbolTable.declare('point', SymbolType.USER_VARIABLE, DataType.DICTIONARY, {
                metadata: dictMetadata,
            });
        });

        it('should resolve member memory location for enum', () => {
            const location = symbolResolver.resolveMemberToMemoryLocation('solfege', 'do');
            expect(location).toBe('solfege.do');
        });

        it('should resolve member memory location for dictionary', () => {
            const location = symbolResolver.resolveMemberToMemoryLocation('point', 'x');
            expect(location).toBe('point[x]');
        });

        it('should return null for invalid member resolution', () => {
            const location = symbolResolver.resolveMemberToMemoryLocation('nonexistent', 'prop');
            expect(location).toBeNull();
        });
    });

    describe('Enum Value Validation', () => {
        beforeEach(() => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['red', 'green', 'blue'],
                    enumType: 'color',
                },
            };
            symbolTable.declare('color', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });
        });

        it('should validate enum values', () => {
            expect(symbolResolver.validateEnumValue('color', 'red')).toBe(true);
            expect(symbolResolver.validateEnumValue('color', 'yellow')).toBe(false);
            expect(symbolResolver.validateEnumValue('nonexistent', 'red')).toBe(false);
        });

        it('should get enum possible values', () => {
            const values = symbolResolver.getEnumPossibleValues('color');
            expect(values).toEqual(['red', 'green', 'blue']);

            const nonValues = symbolResolver.getEnumPossibleValues('nonexistent');
            expect(nonValues).toBeNull();
        });
    });

    describe('Access Control', () => {
        beforeEach(() => {
            // Set to main program context to declare system variables
            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            symbolTable.declare('systemVar', SymbolType.SYSTEM_VARIABLE, DataType.NUMBER);
            symbolTable.declare(
                'configVar',
                SymbolType.SYSTEM_VARIABLE_CONFIGURABLE,
                DataType.STRING,
            );
            // Switch to user context and declare user variable
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);
            symbolTable.declare('userVar', SymbolType.USER_VARIABLE, DataType.BOOLEAN);
        });

        it('should check symbol accessibility', () => {
            expect(symbolResolver.isSymbolAccessible('systemVar')).toBe(true);
            expect(symbolResolver.isSymbolAccessible('userVar')).toBe(true);
            expect(symbolResolver.isSymbolAccessible('nonexistent')).toBe(false);
        });

        it('should check member accessibility', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['option1', 'option2'],
                    enumType: 'test',
                },
            };
            symbolTable.declare('testEnum', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            expect(symbolResolver.isMemberAccessible('testEnum', 'option1')).toBe(true);
            expect(symbolResolver.isMemberAccessible('testEnum', 'invalid')).toBe(false);
        });
    });

    describe('Value Resolution with Access Control', () => {
        beforeEach(() => {
            // Declare variables with proper context
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);
            symbolTable.declare('mutableVar', SymbolType.USER_VARIABLE, DataType.NUMBER);

            symbolTable.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            symbolTable.declare('immutableVar', SymbolType.SYSTEM_VARIABLE, DataType.STRING);

            // Set values in memory
            threadContext.setLocal('mutableVar', 42);
            threadContext.setGlobal('immutableVar', 'constant');

            // Reset to user context for testing
            symbolTable.setExecutionContext(ExecutionContext.USER_PROGRAM);
        });

        it('should resolve values from memory', () => {
            const value1 = symbolResolver.resolveValue('mutableVar');
            expect(value1).toBe(42);

            const value2 = symbolResolver.resolveValue('immutableVar');
            expect(value2).toBe('constant');
        });

        it('should throw error for non-existent symbol resolution', () => {
            expect(() => {
                symbolResolver.resolveValue('nonexistent');
            }).toThrow(SymbolNotFoundError);
        });

        it('should set mutable symbol values', () => {
            symbolResolver.setValue('mutableVar', 100);
            expect(symbolResolver.resolveValue('mutableVar')).toBe(100);
        });

        it('should prevent setting immutable symbol values', () => {
            expect(() => {
                symbolResolver.setValue('immutableVar', 'modified');
            }).toThrow(AccessControlError);
        });

        it('should validate enum values when setting', () => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['small', 'large'],
                    enumType: 'size',
                },
            };
            symbolTable.declare('size', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });

            symbolResolver.setValue('size', 'small');
            expect(symbolResolver.resolveValue('size')).toBe('small');

            expect(() => {
                symbolResolver.setValue('size', 'medium');
            }).toThrow(EnumValidationError);
        });
    });

    describe('Member Value Operations', () => {
        beforeEach(() => {
            const enumMetadata = {
                enumMetadata: {
                    possibleValues: ['piano', 'guitar'],
                    enumType: 'instrument',
                },
            };
            symbolTable.declare('instrument', SymbolType.USER_VARIABLE, DataType.ENUM, {
                metadata: enumMetadata,
            });
        });

        it('should resolve enum member values', () => {
            const value = symbolResolver.resolveMemberValue('instrument', 'piano');
            expect(value).toBe('piano');
        });

        it('should throw error for invalid member access', () => {
            expect(() => {
                symbolResolver.resolveMemberValue('instrument', 'drums');
            }).toThrow(MemberAccessError);
        });

        it('should prevent setting enum member values', () => {
            expect(() => {
                symbolResolver.setMemberValue('instrument', 'piano', 'violin');
            }).toThrow(MemberAccessError);
        });
    });
});
