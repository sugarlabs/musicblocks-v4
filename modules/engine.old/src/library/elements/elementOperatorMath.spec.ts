import {
    ElementOperatorMathPlus,
    ElementOperatorMathMinus,
    ElementOperatorMathTimes,
    ElementOperatorMathDivide,
    ElementOperatorMathModulus,
} from './elementOperatorMath';

import { registerContext, ScopeStack } from '../../execution/scope';

// -------------------------------------------------------------------------------------------------

registerContext('dummy', {});
const scopeStack = new ScopeStack();

describe('Operator Elements', () => {
    describe('class ElementOperatorPlus', () => {
        const elementOperatorPlus = new ElementOperatorMathPlus('operator-math-plus', '+');

        test('verify label', () => {
            expect(elementOperatorPlus.label).toBe('+');
        });

        describe('evaluation', () => {
            test('pass two numbers as parameters to evaluate and verify result', () => {
                elementOperatorPlus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 5, operand2: 15 },
                );
                expect(elementOperatorPlus.value).toBe(20);
            });

            test('pass a number and a string as parameters to evaluate and verify result', () => {
                elementOperatorPlus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 5, operand2: 'foo' },
                );
                expect(elementOperatorPlus.value).toBe('5foo');
            });

            test('pass two strings as parameters to evaluate and verify result', () => {
                elementOperatorPlus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: '5', operand2: '15' },
                );
                expect(elementOperatorPlus.value).toBe('515');
            });
        });
    });

    describe('class ElementOperatorMinus', () => {
        const elementOperatorMinus = new ElementOperatorMathMinus('operator-math-minus', '-');

        test('verify label', () => {
            expect(elementOperatorMinus.label).toBe('-');
        });

        describe('evaluation', () => {
            test('pass two numbers as parameters to evaluate and verify result', () => {
                elementOperatorMinus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 15, operand2: 5 },
                );
                expect(elementOperatorMinus.value).toBe(10);
                elementOperatorMinus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 5, operand2: 15 },
                );
                expect(elementOperatorMinus.value).toBe(-10);
            });
        });
    });

    describe('class ElementOperatorTimes', () => {
        const elementOperatorTimes = new ElementOperatorMathTimes('operator-math-times', '*');

        describe('verify label', () => {
            expect(elementOperatorTimes.label).toBe('*');
        });

        describe('evaluation', () => {
            test('pass two numbers as parameters to evaluate and verify result', () => {
                elementOperatorTimes.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 15, operand2: 5 },
                );
                expect(elementOperatorTimes.value).toBe(75);
                elementOperatorTimes.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: -5, operand2: 15 },
                );
                expect(elementOperatorTimes.value).toBe(-75);
            });
        });
    });

    describe('class ElementOperatorDivide', () => {
        const elementOperatorDivide = new ElementOperatorMathDivide('operator-math-divide', '/');

        describe('verify label', () => {
            expect(elementOperatorDivide.label).toBe('/');
        });

        describe('evaluation', () => {
            test('pass two numbers as parameters to evaluate and verify result', () => {
                elementOperatorDivide.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 15, operand2: 5 },
                );
                expect(elementOperatorDivide.value).toBe(3);
                elementOperatorDivide.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: -5, operand2: 10 },
                );
                expect(elementOperatorDivide.value).toBe(-0.5);
            });
        });
    });

    describe('class ElementOperatorModulus', () => {
        const elementOperatorModulus = new ElementOperatorMathModulus('operator-math-modulus', '%');

        describe('verify label', () => {
            expect(elementOperatorModulus.label).toBe('%');
        });

        describe('evaluation', () => {
            test('pass two numbers as parameters to evaluate and verify result', () => {
                elementOperatorModulus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 15, operand2: 5 },
                );
                expect(elementOperatorModulus.value).toBe(0);
                elementOperatorModulus.evaluate(
                    {
                        context: scopeStack.getContext('dummy'),
                        symbolTable: scopeStack.getSymbolTable(),
                    },
                    { operand1: 15, operand2: 7 },
                );
                expect(elementOperatorModulus.value).toBe(1);
            });
        });
    });
});
