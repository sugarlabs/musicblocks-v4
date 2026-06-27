import {
    ElementBoxBoolean,
    ElementBoxNumber,
    ElementBoxString,
    ElementBoxGeneric,
} from './elementBox';

import { queryVariable } from '../../execution/interpreter';
import { registerContext, ScopeStack } from '../../execution/scope';

// -------------------------------------------------------------------------------------------------

registerContext('dummy', {});
const scopeStack = new ScopeStack();

describe('Box Elements', () => {
    test('instantiate and verify instance variables', () => {
        const elementBox = new ElementBoxGeneric('box-generic', 'Box');
        expect(elementBox.name).toBe('box-generic');
        expect(elementBox.label).toBe('Box');
        expect(elementBox.kind).toBe('Instruction');
        expect(elementBox.type).toBe('Statement');
        expect(elementBox.argCount).toBe(2);
        expect(elementBox.argLabels).toEqual(['name', 'value']);
    });

    describe('class ElementBoxBoolean', () => {
        test('execute with parameters and verify variable addition in symbol table', () => {
            const elementBoxBoolean = new ElementBoxBoolean('box-boolean', 'Box (boolean)');
            expect(elementBoxBoolean.label).toBe('Box (boolean)');
            elementBoxBoolean.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'booleanBox', value: true },
            );
            expect(queryVariable('booleanBox')).toEqual({
                dataType: 'boolean',
                value: true,
            });
        });
    });

    describe('class ElementBoxNumber', () => {
        test('execute with parameters and verify variable addition in symbol table', () => {
            const elementBoxNumber = new ElementBoxNumber('box-number', 'Box (number)');
            expect(elementBoxNumber.label).toBe('Box (number)');
            elementBoxNumber.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'numberBox', value: 5 },
            );
            expect(queryVariable('numberBox')).toEqual({
                dataType: 'number',
                value: 5,
            });
        });
    });

    describe('class ElementBoxString', () => {
        test('execute with parameters and verify variable addition in symbol table', () => {
            const elementBoxString = new ElementBoxString('box-string', 'Box (string)');
            expect(elementBoxString.label).toBe('Box (string)');
            elementBoxString.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'stringBox', value: 'foo' },
            );
            expect(queryVariable('stringBox')).toEqual({
                dataType: 'string',
                value: 'foo',
            });
        });
    });

    describe('class ElementBoxGeneric', () => {
        test('execute with boolean value parameter and verify variable addition in symbol table', () => {
            const elementBoxGeneric = new ElementBoxGeneric('box-generic', 'Box');
            elementBoxGeneric.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'genericBox', value: true },
            );
            expect(queryVariable('genericBox')).toEqual({
                dataType: 'boolean',
                value: true,
            });
        });

        test('execute with number value parameter and verify variable addition in symbol table', () => {
            const elementBoxGeneric = new ElementBoxGeneric('box-generic', 'Box');
            elementBoxGeneric.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'genericBox', value: 5 },
            );
            expect(queryVariable('genericBox')).toEqual({
                dataType: 'number',
                value: 5,
            });
        });

        test('execute with string value parameter and verify variable addition in symbol table', () => {
            const elementBoxGeneric = new ElementBoxGeneric('box-generic', 'Box');
            elementBoxGeneric.onVisit(
                {
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                },
                { name: 'genericBox', value: 'foo' },
            );
            expect(queryVariable('genericBox')).toEqual({
                dataType: 'string',
                value: 'foo',
            });
        });
    });
});
