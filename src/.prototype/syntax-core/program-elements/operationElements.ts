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

        abstract getData(props: {
            args: { operand_1: TPrimitive; operand_2: TPrimitive };
        }): TPrimitive;
    }

    // -- Arithmetic Operators ---------------------------------------------------------------------

    abstract class ArithmeticOperationElement extends BinaryOperationElement {
        constructor(elementName: string, type: TPrimitiveName, operator: TArithOp) {
            super(elementName, type, operator, {
                operand_1: ['TFloat'],
                operand_2: ['TFloat']
            });
        }

        getData(props: {
            args: {
                operand_1: TPrimitive;
                operand_2: TPrimitive;
            };
        }): TPrimitive {
            if (!(props.args.operand_1 instanceof TInt || props.args.operand_1 instanceof TFloat)) {
                throw Error(`"operand_1" can only be of type TInt or TFloat.`);
            }
            if (!(props.args.operand_2 instanceof TInt || props.args.operand_2 instanceof TFloat)) {
                throw Error(`"operand_2" can only be of type TInt or TFloat.`);
            }

            switch (this._operator) {
                case '+':
                    return TFloat.add(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '-':
                    return TFloat.subtract(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '*':
                    return TFloat.multiply(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '/':
                    return TFloat.divide(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '%':
                    return TFloat.mod(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                default:
                    throw Error(`Should not be reached.`);
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
            super('subtract', 'TFloat', '-');
        }
    }

    export class MultiplyElement extends ArithmeticOperationElement {
        constructor() {
            super('multiply', 'TFloat', '*');
        }
    }

    export class DivideElement extends ArithmeticOperationElement {
        constructor() {
            super('divide', 'TFloat', '/');
        }
    }

    export class ModElement extends ArithmeticOperationElement {
        constructor() {
            super('mod', 'TFloat', '%');
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

        getData(props: {
            args: {
                operand_1: TPrimitive;
                operand_2: TPrimitive;
            };
        }): TPrimitive {
            if (!(props.args.operand_1 instanceof TInt || props.args.operand_1 instanceof TFloat)) {
                throw Error(`"operand_1" can only be of type TInt or TFloat.`);
            }
            if (!(props.args.operand_2 instanceof TInt || props.args.operand_2 instanceof TFloat)) {
                throw Error(`"operand_2" can only be of type TInt or TFloat.`);
            }

            switch (this._operator) {
                case '==':
                    return TFloat.equals(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '>':
                    return TFloat.greaterThan(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                case '<':
                    return TFloat.lessThan(
                        props.args.operand_1 as TInt | TFloat,
                        props.args.operand_2 as TInt | TFloat
                    );
                default:
                    throw Error(`Should not be reached.`);
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
            super('greater-than', '>');
        }
    }

    export class LessThanElement extends RelationOperationElement {
        constructor() {
            super('less-than', '<');
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

        getData(props: {
            args: {
                operand_1: TPrimitive;
                operand_2: TPrimitive;
            };
        }): TPrimitive {
            if (!(props.args.operand_1 instanceof TBoolean)) {
                throw Error(`"operand_1" can only be of type TBoolean.`);
            }
            if (!(props.args.operand_2 instanceof TBoolean)) {
                throw Error(`"operand_2" can only be of type TBoolean.`);
            }

            switch (this._operator) {
                case '&&':
                    return TBoolean.and(
                        props.args.operand_1 as TBoolean,
                        props.args.operand_2 as TBoolean
                    );
                case '||':
                    return TBoolean.or(
                        props.args.operand_1 as TBoolean,
                        props.args.operand_2 as TBoolean
                    );
                default:
                    throw Error(`Should not be reached.`);
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
