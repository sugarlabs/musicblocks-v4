import {
    ElementBoxIdentifierGeneric,
    ElementBoxIdentifierBoolean,
    ElementBoxIdentifierNumber,
    ElementBoxIdentifierString,
} from './elementBoxIdentifier';

import { registerContext, ScopeStack } from '../../execution/scope';
import { declareVariable } from '../../execution/interpreter';

// -------------------------------------------------------------------------------------------------

registerContext('dummy', {});
const scopeStack = new ScopeStack();

declareVariable('myVar1', 'boolean', true);
declareVariable('myVar2', 'number', 5);
declareVariable('myVar3', 'string', 'foo');

describe('Box Identifier Elements', () => {
    describe('class ElementBoxIdentifierGeneric', () => {
        const elementBoxIdentifierGeneric = new ElementBoxIdentifierGeneric(
            'boxidentifier-generic',
            'Box 1',
        );

        test('update label to name with boolean variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierGeneric.updateLabel('myVar1');
            elementBoxIdentifierGeneric.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierGeneric.value).toBe(true);
        });

        test('update label to name with number variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierGeneric.updateLabel('myVar2');
            elementBoxIdentifierGeneric.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierGeneric.value).toBe(5);
        });

        test('update label to name with string variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierGeneric.updateLabel('myVar3');
            elementBoxIdentifierGeneric.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierGeneric.value).toBe('foo');
        });

        test('update label to name with no variable in symbol table and expect error', () => {
            elementBoxIdentifierGeneric.updateLabel('myVar');
            expect(() =>
                elementBoxIdentifierGeneric.evaluate({
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                }),
            ).toThrowError('ItemNotFoundError: box "myVar" does not exist');
        });
    });

    describe('class ElementBoxIdentifierBoolean', () => {
        const elementBoxIdentifierBoolean = new ElementBoxIdentifierBoolean(
            'boxidentifier-boolean',
            'Box 2',
        );

        test('update label to name with boolean variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierBoolean.updateLabel('myVar1');
            elementBoxIdentifierBoolean.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierBoolean.value).toBe(true);
        });

        test('update label to name with boolean variable not in symbol table and expect error', () => {
            elementBoxIdentifierBoolean.updateLabel('myVar2');
            expect(() =>
                elementBoxIdentifierBoolean.evaluate({
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                }),
            ).toThrowError('ItemNotFoundError: box "myVar2" of type "boolean" does not exist');
        });
    });

    describe('class ElementBoxIdentifierNumber', () => {
        const elementBoxIdentifierNumber = new ElementBoxIdentifierNumber(
            'boxidentifier-number',
            'Box 3',
        );

        test('update label to name with number variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierNumber.updateLabel('myVar2');
            elementBoxIdentifierNumber.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierNumber.value).toBe(5);
        });

        test('update label to name with number variable not in symbol table and expect error', () => {
            elementBoxIdentifierNumber.updateLabel('myVar1');
            expect(() =>
                elementBoxIdentifierNumber.evaluate({
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                }),
            ).toThrowError('ItemNotFoundError: box "myVar1" of type "number" does not exist');
        });
    });

    describe('class ElementBoxIdentifierString', () => {
        const elementBoxIdentifierString = new ElementBoxIdentifierString(
            'boxidentifier-string',
            'Box 4',
        );

        test('update label to name with string variable in symbol table and verify evaluation', () => {
            elementBoxIdentifierString.updateLabel('myVar3');
            elementBoxIdentifierString.evaluate({
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
            expect(elementBoxIdentifierString.value).toBe('foo');
        });

        test('update label to name with string variable not in symbol table and expect error', () => {
            elementBoxIdentifierString.updateLabel('myVar1');
            expect(() =>
                elementBoxIdentifierString.evaluate({
                    context: scopeStack.getContext('dummy'),
                    symbolTable: scopeStack.getSymbolTable(),
                }),
            ).toThrowError('ItemNotFoundError: box "myVar1" of type "string" does not exist');
        });
    });
});
