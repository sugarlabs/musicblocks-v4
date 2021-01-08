import { TPrimitiveName, TPrimitive } from './@types/primitiveTypes';
import * as TS from './@types/structureElements';

// ---- Syntax Element -----------------------------------------------------------------------------

abstract class SyntaxElement implements TS.ISyntaxElement {
    private _identifier: string;

    constructor(identifier: string) {
        this._identifier = identifier;
    }

    get identifier() {
        return this._identifier;
    }
}

// ---- Argument Element ---------------------------------------------------------------------------

abstract class ArgumentElement extends SyntaxElement implements TS.IArgumentElement {
    private _type: 'data' | 'expression';
    private _returnType: TPrimitiveName;

    constructor(identifier: string, type: 'data' | 'expression', returnType: TPrimitiveName) {
        super(identifier);
        this._type = type;
        this._returnType = returnType;
    }

    get type() {
        return this._type;
    }

    get returnType() {
        return this._returnType;
    }

    abstract get data(): TPrimitive;
}

/** @todo: This should be an abstract class. Currently, not abstract as sub-classes not created. */
export abstract class ArgumentDataElement
    extends ArgumentElement
    implements TS.IArgumentDataElement {
    private _dataElement: TPrimitive;

    constructor(identifier: string, dataElement: TPrimitive) {
        super(identifier, 'data', dataElement.type);
        this._dataElement = dataElement;
    }

    get data() {
        return this._dataElement;
    }
}

/** @todo: This should be an abstract class. Currently, not abstract as sub-classes not created. */
export abstract class ArgumentExpressionElement
    extends ArgumentElement
    implements TS.IArgumentExpressionElement {
    constructor(identifier: string, type: TPrimitiveName) {
        super(identifier, 'expression', type);
    }

    abstract get data(): TPrimitive;
}

// ---- Instruction Element ------------------------------------------------------------------------

class InstructionArgs implements TS.IInstructionArgs {
    private _instruction: string;
    private _argMap: { [key: string]: ArgumentElement | null };
    private _argTypeMap: { [key: string]: TPrimitiveName[] };

    constructor(instruction: string, constraints: { [key: string]: TPrimitiveName[] }) {
        this._instruction = instruction;
        this._argTypeMap = constraints;
        this._argMap = {};
        Object.keys(this._argTypeMap).forEach((argName) => (this._argMap[argName] = null));
    }

    private _validateArgName(argName: string): void {
        if (Object.keys(this._argTypeMap).indexOf(argName) === -1) {
            throw Error(
                `Invalid argument: "${argName}" does not exist for instruction "${this._instruction}"`
            );
        }
    }

    private _validateArg(argName: string, arg: ArgumentElement | null): void {
        try {
            this._validateArgName(argName);
            if (arg !== null && this._argTypeMap[argName].indexOf(arg.returnType) === -1) {
                throw Error(
                    `Invalid argument: "${arg.returnType}" is not a valid type for "${argName}"`
                );
            }
        } catch (e) {
            throw e;
        }
    }

    setArg(argName: string, argElement: ArgumentElement | null): void {
        try {
            this._validateArg(argName, argElement);
        } catch (e) {
            throw e;
        }
        this._argMap[argName] = argElement;
    }

    getArg(argName: string): ArgumentElement | null {
        try {
            this._validateArgName(argName);
        } catch (e) {
            throw e;
        }
        return this._argMap[argName];
    }

    get argNames(): string[] {
        return Object.keys(this._argTypeMap);
    }
}

abstract class InstructionElement extends SyntaxElement implements TS.IInstructionElement {
    private _next: InstructionElement | null;
    private _args: InstructionArgs | null;

    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier);
        this._next = null;
        this._args = !constraints ? null : new InstructionArgs(identifier, constraints);
    }

    set next(next: InstructionElement | null) {
        this._next = next;
    }

    get next() {
        return this._next;
    }

    get args() {
        return this._args;
    }
}

export abstract class StatementElement extends InstructionElement implements TS.IStatementElement {
    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier, constraints);
    }
}

export abstract class BlockElement extends InstructionElement implements TS.IBlockElement {
    private _childHeadFirst: InstructionElement | null;
    private _childHeadSecond: InstructionElement | null;

    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier, constraints);
    }

    set childHeadFirst(childHeadFirst: InstructionElement | null) {
        this._childHeadFirst = childHeadFirst;
    }

    get childHeadFirst() {
        return this._childHeadFirst;
    }

    set childHeadSecond(childHeadSecond: InstructionElement | null) {
        this._childHeadSecond = childHeadSecond;
    }

    get childHeadSecond() {
        return this._childHeadSecond;
    }
}
