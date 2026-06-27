import { ElementExpression } from '../../syntax/elements/elementArgument';

// -- types ----------------------------------------------------------------------------------------

import type { TData, TDataName } from '../../@types/data';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

/** Type definition for the operator symbols */
type TOperator = '+' | '-' | '*' | '/' | '%';

/**
 * @virtual
 * @class
 * Generic class that defines a generic math operator element.
 *
 * @classdesc
 * Math operator elements are expression elements that take two arguments (operands) and return the
 * result of operation on those arguments.
 */
abstract class ElementOperatorMath<T> extends ElementExpression<T> {
    private _operator: TOperator;

    constructor(
        name: string,
        label: string,
        returnType: TDataName[],
        operator: TOperator,
        initialValue: T,
    ) {
        super(name, '', { operand1: returnType, operand2: returnType }, returnType, initialValue);
        this._operator = operator;
        this.updateLabel(this._operator);
    }

    public evaluate(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { operand1: number; operand2: number },
    ): void;
    public evaluate(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { operand1: number | string; operand2: number | string },
    ): void;
    public evaluate(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { operand1: TData; operand2: TData },
    ): void {
        const { operand1, operand2 } = params;

        switch (this._operator) {
            case '+':
                this._value = (typeof operand1 === 'string' || typeof operand2 === 'string'
                    ? `${operand1}${operand2}`
                    : (operand1 as number) + (operand2 as number)) as unknown as T;
                break;
            case '-':
                this._value = ((operand1 as number) - (operand2 as number)) as unknown as T;
                break;
            case '*':
                this._value = ((operand1 as number) * (operand2 as number)) as unknown as T;
                break;
            case '/':
                this._value = ((operand1 as number) / (operand2 as number)) as unknown as T;
                break;
            case '%':
                this._value = ((operand1 as number) % (operand2 as number)) as unknown as T;
                break;
        }
    }
}

/**
 * @class
 * Defines a plus math-operator element.
 *
 * @classdesc
 * Performs addition on numbers and concatenation on strings.
 */
export class ElementOperatorMathPlus extends ElementOperatorMath<number | string> {
    constructor(name: string, label: string) {
        super(name, label, ['number', 'string'], '+', 0);
    }
}

/**
 * @class
 * Defines a minus math-operator element.
 *
 * @classdesc
 * Performs subtraction on numbers.
 */
export class ElementOperatorMathMinus extends ElementOperatorMath<number> {
    constructor(name: string, label: string) {
        super(name, label, ['number'], '-', 0);
    }
}

/**
 * @class
 * Defines a times math-operator element.
 *
 * @classdesc
 * Performs multiplication on numbers.
 */
export class ElementOperatorMathTimes extends ElementOperatorMath<number> {
    constructor(name: string, label: string) {
        super(name, label, ['number'], '*', 0);
    }
}

/**
 * @class
 * Defines a divide math-operator element.
 *
 * @classdesc
 * Performs division on numbers.
 */
export class ElementOperatorMathDivide extends ElementOperatorMath<number> {
    constructor(name: string, label: string) {
        super(name, label, ['number'], '/', 0);
    }
}

/**
 * @class
 * Defines a modulus math-operator element.
 *
 * @classdesc
 * Performs modulus operation on numbers.
 */
export class ElementOperatorMathModulus extends ElementOperatorMath<number> {
    constructor(name: string, label: string) {
        super(name, label, ['number'], '%', 0);
    }
}
