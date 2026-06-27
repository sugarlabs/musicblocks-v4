import { ElementArgument, ElementData, ElementExpression } from './elementArgument';

import { registerContext, ScopeStack } from '../../execution/scope';

// -- types ----------------------------------------------------------------------------------------

import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

registerContext('dummy', {});
const scopeStack = new ScopeStack();

class DummyElementArgument<T> extends ElementArgument<T> {}

describe('class ElementArgument', () => {
    test('instantiate class of type number that extends ElementArgument and validate returnType', () => {
        const dummyElementArgument = new DummyElementArgument<number>(
            'dummy',
            'dummy',
            'Data',
            {},
            ['number'],
            0,
        );
        expect(dummyElementArgument.returnType).toEqual(['number']);
    });

    test('instantiate class of type string that extends ElementArgument and validate returnType', () => {
        const dummyElementArgument = new DummyElementArgument<string>(
            'dummy',
            'dummy',
            'Data',
            {},
            ['string'],
            'foo',
        );
        expect(dummyElementArgument.returnType).toEqual(['string']);
    });

    test('instantiate class of type boolean that extends ElementArgument and validate returnType', () => {
        const dummyElementArgument = new DummyElementArgument<boolean>(
            'dummy',
            'dummy',
            'Data',
            {},
            ['boolean'],
            true,
        );
        expect(dummyElementArgument.returnType).toEqual(['boolean']);
    });

    test('instantiate class of type number or string that extends ElementArgument and validate returnType', () => {
        const dummyElementArgument = new DummyElementArgument<string | number>(
            'dummy',
            'dummy',
            'Data',
            {},
            ['string', 'number'],
            0,
        );
        expect(dummyElementArgument.returnType).toEqual(['string', 'number']);
    });
});

class DummyElementData<T> extends ElementData<T> {
    public evaluate(): void {
        if (this.label === 'true' || this.label === 'false') {
            this._value = (this.label === 'true') as unknown as T;
        } else if (!isNaN(Number(this.label))) {
            this._value = Number(this.label) as unknown as T;
        } else {
            this._value = this.label as unknown as T;
        }
    }
}

describe('class ElementData', () => {
    describe('instantiation', () => {
        test('instantiate class of type number that extends ElementData and validate API', () => {
            const dummyElementDataNumber1 = new DummyElementData<number>(
                'dummy',
                'dummy',
                {},
                ['number'],
                0,
            );
            expect(dummyElementDataNumber1.value).toBe(0);
            const dummyElementDataNumber2 = new DummyElementData<number>(
                'dummy',
                'dummy',
                {},
                ['number'],
                5,
            );
            expect(dummyElementDataNumber2.value).toBe(5);
            const dummyElementDataNumber3 = new DummyElementData<number>(
                'dummy',
                'dummy',
                {},
                ['number'],
                -5,
            );
            expect(dummyElementDataNumber3.value).toBe(-5);
        });

        test('instantiate class of type string that extends ElementData and validate API', () => {
            const dummyElementDataString1 = new DummyElementData<string>(
                'dummy',
                'dummy',
                {},
                ['string'],
                'foo',
            );
            expect(dummyElementDataString1.value).toBe('foo');
            const dummyElementDataString2 = new DummyElementData<string>(
                'dummy',
                'dummy',
                {},
                ['string'],
                '',
            );
            expect(dummyElementDataString2.value).toBe('');
        });

        test('instantiate class of type boolean that extends ElementData and validate API', () => {
            const dummyElementDataBoolean1 = new DummyElementData<boolean>(
                'dummy',
                'dummy',
                {},
                ['boolean'],
                true,
            );
            expect(dummyElementDataBoolean1.value).toBe(true);
            const dummyElementDataBoolean2 = new DummyElementData<boolean>(
                'dummy',
                'dummy',
                {},
                ['boolean'],
                false,
            );
            expect(dummyElementDataBoolean2.value).toBe(false);
        });
    });

    describe('overwriting', () => {
        test('evaluate instance of class of type number that extends ElementData and validate', () => {
            const dummyElementDataNumber = new DummyElementData<number>(
                'dummy',
                'dummy',
                {},
                ['number'],
                0,
            );
            expect(dummyElementDataNumber.value).toBe(0);
            dummyElementDataNumber.updateLabel('5');
            expect(dummyElementDataNumber.label).toBe('5');
            dummyElementDataNumber.evaluate();
            expect(dummyElementDataNumber.value).toBe(5);
        });

        test('evaluate instance of class of type string that extends ElementData and validate', () => {
            const dummyElementDataString = new DummyElementData<string>(
                'dummy',
                'dummy',
                {},
                ['string'],
                '',
            );
            expect(dummyElementDataString.value).toBe('');
            dummyElementDataString.updateLabel('foo');
            expect(dummyElementDataString.label).toBe('foo');
            dummyElementDataString.evaluate();
            expect(dummyElementDataString.value).toBe('foo');
        });

        test('evaluate instance of class of type boolean that extends ElementData and validate', () => {
            const dummyElementDataBoolean = new DummyElementData<boolean>(
                'dummy',
                'dummy',
                {},
                ['boolean'],
                true,
            );
            expect(dummyElementDataBoolean.value).toBe(true);
            dummyElementDataBoolean.updateLabel('false');
            expect(dummyElementDataBoolean.label).toBe('false');
            dummyElementDataBoolean.evaluate();
            expect(dummyElementDataBoolean.value).toBe(false);
        });
    });
});

class DummyElementExpressionNumber extends ElementExpression<number> {
    evaluate(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        params: { foo: string; bar: number },
    ): void {
        this._value = params.foo.length * params.bar;
    }
}

class DummyElementExpressionString extends ElementExpression<string> {
    evaluate(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        params: { op1: string; op2: string },
    ): void {
        this._value = params.op1 + params.op2;
    }
}

class DummyElementExpressionBoolean extends ElementExpression<boolean> {
    evaluate(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        params: { op1: boolean; op2: boolean },
    ): void {
        const { op1, op2 } = params;
        this._value = (op1 && !op2) || (!op1 && op2);
    }
}

class DummyElementExpressionMixed extends ElementExpression<string | number> {
    evaluate(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        params: { op1: string; op2: number },
    ): void {
        const { op1, op2 } = params;
        this._value = op1.length > op2 ? op1 : op2;
    }
}

describe('class ElementExpression', () => {
    test('evaluate and validate instance of class that inherits ElementExpression and returns number', () => {
        const dummyElementExpressionNumber = new DummyElementExpressionNumber(
            'dummy',
            'dummy',
            {},
            ['number'],
            0,
        );
        dummyElementExpressionNumber.evaluate(
            { context: scopeStack.getContext('dummy'), symbolTable: scopeStack.getSymbolTable() },
            { foo: 'abc', bar: 5 },
        );
        expect(dummyElementExpressionNumber.value).toBe(15);
    });

    test('evaluate and validate instance of class that inherits ElementExpression and returns string', () => {
        const dummyElementExpressionString = new DummyElementExpressionString(
            'dummy',
            'dummy',
            {},
            ['string'],
            '',
        );
        dummyElementExpressionString.evaluate(
            { context: scopeStack.getContext('dummy'), symbolTable: scopeStack.getSymbolTable() },
            { op1: 'foo', op2: 'bar' },
        );
        expect(dummyElementExpressionString.value).toBe('foobar');
    });

    test('evaluate and validate instance of class that inherits ElementExpression and returns boolean', () => {
        const dummyElementExpressionNumberBoolean = new DummyElementExpressionBoolean(
            'dummy',
            'dummy',
            {},
            ['boolean'],
            true,
        );
        dummyElementExpressionNumberBoolean.evaluate(
            { context: scopeStack.getContext('dummy'), symbolTable: scopeStack.getSymbolTable() },
            { op1: true, op2: false },
        );
        expect(dummyElementExpressionNumberBoolean.value).toBe(true);
    });

    test('evaluate and validate instance of class that inherits ElementExpression and returns string or number', () => {
        const dummyElementExpressionNumberMixed1 = new DummyElementExpressionMixed(
            'dummy',
            'dummy',
            {},
            ['string', 'number'],
            0,
        );
        dummyElementExpressionNumberMixed1.evaluate(
            { context: scopeStack.getContext('dummy'), symbolTable: scopeStack.getSymbolTable() },
            { op1: 'foobar', op2: 5 },
        );
        expect(dummyElementExpressionNumberMixed1.value).toBe('foobar');
        const dummyElementExpressionNumberMixed2 = new DummyElementExpressionMixed(
            'dummy',
            'dummy',
            {},
            ['string', 'number'],
            0,
        );
        dummyElementExpressionNumberMixed2.evaluate(
            { context: scopeStack.getContext('dummy'), symbolTable: scopeStack.getSymbolTable() },
            { op1: 'foo', op2: 5 },
        );
        expect(dummyElementExpressionNumberMixed2.value).toBe(5);
    });
});
