import { TPrimitive, TPrimitiveName } from '../@types/primitiveTypes';
import { TBoolean, TFloat, TInt } from '../primitiveElements';
import { ArgumentElement, ArgumentExpressionElement } from '../structureElements';

type TArithOp = '+' | '-' | '*' | '/' | '%';
type TRelnOp = '==' | '>' | '<';
type TBoolOp = '||' | '&&';
type TArg = ArgumentElement | null;

export namespace OperationElement {
    abstract class BinaryOperationElement extends ArgumentExpressionElement {
        protected _operator: TArithOp | TRelnOp | TBoolOp;
        protected _operand_1: TArg = null;
        protected _operand_2: TArg = null;

        constructor(
            elementName: string,
            type: TPrimitiveName,
            operator: TArithOp | TRelnOp | TBoolOp,
            constraints: { operand_1: TPrimitiveName[]; operand_2: TPrimitiveName[] }
        ) {
            super(elementName, type, constraints);
            this._operator = operator;
        }

        set argOperand_1(operand_1: TArg) {
            this.args.setArg('operand_1', operand_1);
            this._operand_1 = operand_1;
        }

        get argOperand_1() {
            return this._operand_1;
        }

        set argOperand_2(operand_2: TArg) {
            this.args.setArg('operand_2', operand_2);
            this._operand_2 = operand_2;
        }

        get argOperand_2() {
            return this._operand_2;
        }

        abstract get data(): TPrimitive;
    }

    // -- Arithmetic Operators ---------------------------------------------------------------------

    abstract class ArithmeticOperationElement extends BinaryOperationElement {
        constructor(elementName: string, type: TPrimitiveName, operator: TArithOp) {
            super(elementName, type, operator, {
                operand_1: ['TFloat'],
                operand_2: ['TFloat']
            });
        }

        get data(): TPrimitive {
            if (this._operand_1 === null) {
                throw Error(`Invalid argument: "operand_1" cannot be null`);
            }
            if (this._operand_2 === null) {
                throw Error(`Invalid argument: "operand_2" cannot be null`);
            }
            if (!(this._operand_1.data instanceof TInt || this._operand_1.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_1" can only be of type TInt or TFloat`);
            }
            if (!(this._operand_2.data instanceof TInt || this._operand_2.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_2" can only be of type TInt or TFloat`);
            }
            switch (this._operator) {
                case '+':
                    return TFloat.add(this._operand_1.data, this._operand_2.data);
                case '-':
                    return TFloat.subtract(this._operand_1.data, this._operand_2.data);
                case '*':
                    return TFloat.multiply(this._operand_1.data, this._operand_2.data);
                case '/':
                    return TFloat.divide(this._operand_1.data, this._operand_2.data);
                case '%':
                    return TFloat.mod(this._operand_1.data, this._operand_2.data);
                default:
                    throw Error(`Invalid access: this should not be reachable`);
            }
        }
    }

    export class AddElement extends ArithmeticOperationElement {
        constructor() {
            super('add', 'TFloat', '+');
        }
    }

    export class SubtractElement extends ArithmeticOperationElement {
        constructor() {
            super('add', 'TFloat', '-');
        }
    }

    export class MultiplyElement extends ArithmeticOperationElement {
        constructor() {
            super('add', 'TFloat', '*');
        }
    }

    export class DivideElement extends ArithmeticOperationElement {
        constructor() {
            super('add', 'TFloat', '/');
        }
    }

    export class ModElement extends ArithmeticOperationElement {
        constructor() {
            super('add', 'TFloat', '%');
        }
    }

    // -- Relational Operators ---------------------------------------------------------------------

    abstract class RelationOperationElement extends BinaryOperationElement {
        constructor(elementName: string, operator: TRelnOp) {
            super(elementName, 'TBoolean', operator, {
                operand_1: ['TFloat'],
                operand_2: ['TFloat']
            });
        }

        get data(): TBoolean {
            if (this._operand_1 === null) {
                throw Error(`Invalid argument: "operand_1" cannot be null`);
            }
            if (this._operand_2 === null) {
                throw Error(`Invalid argument: "operand_2" cannot be null`);
            }
            if (!(this._operand_1.data instanceof TInt || this._operand_1.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_1" can only be of type TInt or TFloat`);
            }
            if (!(this._operand_2.data instanceof TInt || this._operand_2.data instanceof TFloat)) {
                throw Error(`Invalid argument: "operand_2" can only be of type TInt or TFloat`);
            }
            switch (this._operator) {
                case '==':
                    return TFloat.equals(this._operand_1.data, this._operand_2.data);
                case '>':
                    return TFloat.greaterThan(this._operand_1.data, this._operand_2.data);
                case '<':
                    return TFloat.lessThan(this._operand_1.data, this._operand_2.data);
                default:
                    throw Error(`Invalid access: this should not be reachable`);
            }
        }
    }

    export class EqualsElement extends RelationOperationElement {
        constructor() {
            super('equals', '==');
        }
    }

    export class GreaterThanElement extends RelationOperationElement {
        constructor() {
            super('equals', '>');
        }
    }

    export class LessThanElement extends RelationOperationElement {
        constructor() {
            super('equals', '<');
        }
    }

    // -- Boolean Operators ------------------------------------------------------------------------

    abstract class BooleanOperationElement extends BinaryOperationElement {
        constructor(elementName: string, operator: TBoolOp) {
            super(elementName, 'TBoolean', operator, {
                operand_1: ['TBoolean'],
                operand_2: ['TBoolean']
            });
        }

        get data(): TBoolean {
            if (this._operand_1 === null) {
                throw Error(`Invalid argument: "operand_1" cannot be null`);
            }
            if (this._operand_2 === null) {
                throw Error(`Invalid argument: "operand_2" cannot be null`);
            }
            if (!(this._operand_1.data instanceof TBoolean)) {
                throw Error(`Invalid argument: "operand_1" can only be of type TBoolean`);
            }
            if (!(this._operand_2.data instanceof TBoolean)) {
                throw Error(`Invalid argument: "operand_2" can only be of type TBoolean`);
            }
            switch (this._operator) {
                case '&&':
                    return TBoolean.and(this._operand_1.data, this._operand_2.data);
                case '||':
                    return TBoolean.or(this._operand_1.data, this._operand_2.data);
                default:
                    throw Error(`Invalid access: this should not be reachable`);
            }
        }
    }

    export class AndElement extends BooleanOperationElement {
        constructor() {
            super('and', '&&');
        }
    }

    export class OrElement extends BooleanOperationElement {
        constructor() {
            super('or', '||');
        }
    }
}
