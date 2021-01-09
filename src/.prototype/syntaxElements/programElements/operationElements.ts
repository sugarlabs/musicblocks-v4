import { TPrimitive, TPrimitiveName } from '../@types/primitiveTypes';
import { TFloat, TInt } from '../primitiveElements';
import { ArgumentElement, ArgumentExpressionElement } from '../structureElements';

type TOp = '+' | '-' | '*' | '/' | '%';
type TArg = ArgumentElement | null;

export namespace OperationElement {
    abstract class ArithmeticOperationElement extends ArgumentExpressionElement {
        private _operator: TOp;
        private operand_1: TArg;
        private operand_2: TArg;

        constructor(
            elementName: string,
            returnType: TPrimitiveName,
            operator: TOp,
            arg: {
                operand_1: TArg;
                operand_2: TArg;
            }
        ) {
            super(elementName, returnType, {
                operand_1: ['TFloat'],
                operand_2: ['TFloat']
            });
            this._operator = operator;

            this.args.setArg('operand_1', arg.operand_1);
            this.args.setArg('operand_2', arg.operand_2);

            this.operand_1 = arg.operand_1;
            this.operand_2 = arg.operand_2;
        }

        get data(): TPrimitive {
            if (this.operand_1 === null) {
                throw Error(`Invalid argument: "operand_1" cannot be null`);
            }
            if (this.operand_2 === null) {
                throw Error(`Invalid argument: "operand_2" cannot be null`);
            }
            if (!(this.operand_1.data instanceof TInt || this.operand_1.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_1" cannot be of type TInt or TFloat`);
            }
            if (!(this.operand_2.data instanceof TInt || this.operand_2.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_2" cannot be of type TInt or TFloat`);
            }
            switch (this._operator) {
                case '+':
                    return TFloat.add(this.operand_1.data, this.operand_2.data);
                case '-':
                    return TFloat.subtract(this.operand_1.data, this.operand_2.data);
                case '*':
                    return TFloat.multiply(this.operand_1.data, this.operand_2.data);
                case '/':
                    return TFloat.divide(this.operand_1.data, this.operand_2.data);
                case '%':
                    return TFloat.mod(this.operand_1.data, this.operand_2.data);
                default:
                    throw Error(`Invalid access: this should not be reachable`);
            }
        }
    }

    export class AddExpressionElement extends ArithmeticOperationElement {
        constructor(arg: { operand_1: TArg; operand_2: TArg }) {
            super('add', 'TFloat', '+', arg);
        }
    }

    export class SubtractExpressionElement extends ArithmeticOperationElement {
        constructor(arg: { operand_1: TArg; operand_2: TArg }) {
            super('add', 'TFloat', '-', arg);
        }
    }

    export class MultiplyExpressionElement extends ArithmeticOperationElement {
        constructor(arg: { operand_1: TArg; operand_2: TArg }) {
            super('add', 'TFloat', '*', arg);
        }
    }

    export class DivideExpressionElement extends ArithmeticOperationElement {
        constructor(arg: { operand_1: TArg; operand_2: TArg }) {
            super('add', 'TFloat', '/', arg);
        }
    }

    export class ModExpressionElement extends ArithmeticOperationElement {
        constructor(arg: { operand_1: TArg; operand_2: TArg }) {
            super('add', 'TFloat', '%', arg);
        }
    }
}
