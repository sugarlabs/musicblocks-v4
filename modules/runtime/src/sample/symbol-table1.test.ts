/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Symbol Manager Tests
 *
 * Simple test suite for the symbol manager with
 * enum, array, dictionary support and access control.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolManager } from '../execution/scope/symbol-manager';
import {
    SymbolType,
    DataType,
    ExecutionContext,
    AccessControlError,
    EnumValidationError,
} from '../@types/symbol-types';
import { ThreadManager } from '../execution/scope/thread';

interface TestContext {
    testEnum: string;
    testArray: number[];
    testDict: { [key: string]: any };
    [key: string]: any;
}

describe('Enhanced Symbol Manager', () => {
    let threadManager: ThreadManager<TestContext>;
    let threadContext: any;
    let symbolManager: SymbolManager<TestContext>;

    beforeEach(() => {
        threadManager = new ThreadManager<TestContext>({
            testEnum: '',
            testArray: [],
            testDict: {},
        });
        threadContext = threadManager.createThread();
        symbolManager = new SymbolManager(threadContext);
    });

    describe('Execution Context Management', () => {
        it('should manage execution context', () => {
            expect(symbolManager.getExecutionContext()).toBe(ExecutionContext.USER_PROGRAM);

            symbolManager.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            expect(symbolManager.getExecutionContext()).toBe(ExecutionContext.MAIN_PROGRAM);
        });
    });

    describe('Enum Management', () => {
        it('should declare enum with values', () => {
            const entry = symbolManager.declareEnum(
                'color',
                'colorType',
                ['red', 'green', 'blue'],
                'red',
            );

            expect(entry.isEnum()).toBe(true);
            expect(symbolManager.getEnumPossibleValues('color')).toEqual(['red', 'green', 'blue']);
            expect(symbolManager.getValue('color')).toBe('red');
        });

        it('should validate enum values', () => {
            symbolManager.declareEnum('direction', 'directionType', [
                'north',
                'south',
                'east',
                'west',
            ]);

            expect(symbolManager.validateEnumValue('direction', 'north')).toBe(true);
            expect(symbolManager.validateEnumValue('direction', 'up')).toBe(false);
        });

        it('should set enum value with validation', () => {
            symbolManager.declareEnum('size', 'sizeType', ['small', 'medium', 'large']);

            symbolManager.setEnumValue('size', 'medium');
            expect(symbolManager.getValue('size')).toBe('medium');

            expect(() => {
                symbolManager.setEnumValue('size', 'huge');
            }).toThrow(EnumValidationError);
        });

        it('should prevent invalid initial enum value', () => {
            expect(() => {
                symbolManager.declareEnum(
                    'status',
                    'statusType',
                    ['active', 'inactive'],
                    'unknown',
                );
            }).toThrow(EnumValidationError);
        });
    });

    describe('Array Management', () => {
        it('should declare array with metadata', () => {
            const entry = symbolManager.declareArray('numbers', DataType.NUMBER, [1, 2, 3], {
                maxLength: 10,
                dimensions: 1,
            });

            expect(entry.isArray()).toBe(true);
            expect(symbolManager.getValue('numbers')).toEqual([1, 2, 3]);

            const metadata = entry.getArrayMetadata();
            expect(metadata?.elementType).toBe(DataType.NUMBER);
            expect(metadata?.maxLength).toBe(10);
        });

        it('should declare array without initial value', () => {
            const entry = symbolManager.declareArray('empty', DataType.STRING);

            expect(entry.isArray()).toBe(true);
            expect(symbolManager.getValue('empty')).toBeUndefined();
        });
    });

    describe('Dictionary Management', () => {
        it('should declare dictionary with metadata', () => {
            const entry = symbolManager.declareDictionary(
                'settings',
                DataType.STRING,
                DataType.NUMBER,
                { width: 800, height: 600 },
                { requiredKeys: ['width', 'height'], allowDynamicKeys: false },
            );

            expect(entry.isDictionary()).toBe(true);
            expect(symbolManager.getValue('settings')).toEqual({ width: 800, height: 600 });

            const metadata = entry.getDictionaryMetadata();
            expect(metadata?.keyType).toBe(DataType.STRING);
            expect(metadata?.valueType).toBe(DataType.NUMBER);
            expect(metadata?.requiredKeys).toEqual(['width', 'height']);
        });
    });

    describe('System Variable Management', () => {
        it('should declare system variables in main program context', () => {
            symbolManager.setExecutionContext(ExecutionContext.MAIN_PROGRAM);

            const systemVar = symbolManager.declareSystemVariable(
                'PI',
                DataType.NUMBER,
                3.14159 as any,
            );
            const configVar = symbolManager.declareSystemVariableConfigurable(
                'defaultSize',
                DataType.NUMBER,
                10 as any,
            );

            expect(systemVar.symbolType).toBe(SymbolType.SYSTEM_VARIABLE);
            expect(configVar.symbolType).toBe(SymbolType.SYSTEM_VARIABLE_CONFIGURABLE);
            expect(symbolManager.getValue('PI')).toBe(3.14159);
            expect(symbolManager.getValue('defaultSize')).toBe(10);
        });

        it('should prevent system variable declaration in user context', () => {
            symbolManager.setExecutionContext(ExecutionContext.USER_PROGRAM);

            expect(() => {
                symbolManager.declareSystemVariable('PI', DataType.NUMBER);
            }).toThrow(AccessControlError);

            expect(() => {
                symbolManager.declareSystemVariableConfigurable('config', DataType.STRING);
            }).toThrow(AccessControlError);
        });
    });

    describe('Member Expression Support', () => {
        beforeEach(() => {
            symbolManager.declareEnum('instrument', 'instrumentType', [
                'piano',
                'guitar',
                'violin',
            ]);
            symbolManager.declareDictionary('scores', DataType.STRING, DataType.NUMBER);
        });

        it('should get enum member value', () => {
            const value = symbolManager.getMemberValue('instrument', 'piano');
            expect(value).toBe('piano');
        });

        it('should check member existence', () => {
            expect(symbolManager.memberExists('instrument', 'piano')).toBe(true);
            expect(symbolManager.memberExists('instrument', 'drums')).toBe(false);
        });

        it('should validate member access', () => {
            expect(symbolManager.validateMemberAccess('instrument', 'piano', 'read')).toBe(true);
            expect(symbolManager.validateMemberAccess('instrument', 'piano', 'write')).toBe(false);
            expect(symbolManager.validateMemberAccess('scores', 'math', 'read')).toBe(true);
            expect(symbolManager.validateMemberAccess('scores', 'math', 'write')).toBe(true);
        });
    });

    describe('Symbol Queries', () => {
        beforeEach(() => {
            symbolManager.declare('userVar', SymbolType.USER_VARIABLE, DataType.STRING);
            symbolManager.declareEnum('color', 'colorType', ['red', 'blue']);
            symbolManager.declareArray('list', DataType.NUMBER);
            symbolManager.declareDictionary('map', DataType.STRING, DataType.STRING);
        });

        it('should get symbols by type', () => {
            const userVars = symbolManager.getSymbolsByType(SymbolType.USER_VARIABLE);
            expect(userVars.length).toBe(4);

            const systemVars = symbolManager.getSystemSymbols();
            expect(systemVars.length).toBe(0);
        });

        it('should get symbols by data type', () => {
            const enums = symbolManager.getAllEnums();
            expect(enums.length).toBe(1);
            expect(enums[0].name).toBe('color');

            const arrays = symbolManager.getAllArrays();
            expect(arrays.length).toBe(1);
            expect(arrays[0].name).toBe('list');

            const dicts = symbolManager.getAllDictionaries();
            expect(dicts.length).toBe(1);
            expect(dicts[0].name).toBe('map');
        });

        it('should get user modifiable symbols', () => {
            symbolManager.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            symbolManager.declareSystemVariable('constant', DataType.NUMBER);

            const modifiable = symbolManager.getUserModifiableSymbols();
            const modifiableNames = modifiable.map((s) => s.name);

            expect(modifiableNames).toContain('userVar');
            expect(modifiableNames).not.toContain('constant');
        });
    });

    describe('Access Control Validation', () => {
        beforeEach(() => {
            symbolManager.setExecutionContext(ExecutionContext.MAIN_PROGRAM);
            symbolManager.declareSystemVariable('readOnly', DataType.STRING, 'constant' as any);
            symbolManager.declareSystemVariableConfigurable(
                'configurable',
                DataType.NUMBER,
                42 as any,
            );
            symbolManager.setExecutionContext(ExecutionContext.USER_PROGRAM);
            symbolManager.declare(
                'userVar',
                SymbolType.USER_VARIABLE,
                DataType.STRING,
                'user' as any,
            );
        });

        it('should validate symbol access', () => {
            expect(symbolManager.validateSymbolAccess('readOnly', 'read')).toBe(true);
            expect(symbolManager.validateSymbolAccess('readOnly', 'write')).toBe(false);
            expect(symbolManager.validateSymbolAccess('userVar', 'write')).toBe(true);
        });

        it('should check symbol accessibility', () => {
            expect(symbolManager.isSymbolAccessible('readOnly')).toBe(true);
            expect(symbolManager.isSymbolAccessible('configurable')).toBe(true);
            expect(symbolManager.isSymbolAccessible('userVar')).toBe(true);
            expect(symbolManager.isSymbolAccessible('nonexistent')).toBe(false);
        });
    });

    describe('Scope Management', () => {
        it('should handle scope operations', () => {
            symbolManager.declare('global', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(symbolManager.getCurrentScopeDepth()).toBe(0);

            symbolManager.pushScope();
            symbolManager.declare('local', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(symbolManager.getCurrentScopeDepth()).toBe(1);
            expect(symbolManager.existsInCurrentScope('local')).toBe(true);
            expect(symbolManager.existsInCurrentScope('global')).toBe(false);

            symbolManager.popScope();
            expect(symbolManager.existsInAnyScope('local')).toBe(false);
            expect(symbolManager.existsInAnyScope('global')).toBe(true);
        });

        it('should remove symbols from current scope', () => {
            symbolManager.declare('temp', SymbolType.USER_VARIABLE, DataType.STRING);
            expect(symbolManager.existsInCurrentScope('temp')).toBe(true);

            symbolManager.removeSymbol('temp');
            expect(symbolManager.existsInCurrentScope('temp')).toBe(false);
        });

        it('should clear current scope', () => {
            symbolManager.declare('a', SymbolType.USER_VARIABLE, DataType.STRING);
            symbolManager.declare('b', SymbolType.USER_VARIABLE, DataType.NUMBER);
            expect(symbolManager.getCurrentScopeSymbols().length).toBe(2);

            symbolManager.clearCurrentScope();
            expect(symbolManager.getCurrentScopeSymbols().length).toBe(0);
        });
    });
});
