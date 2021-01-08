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

export abstract class ArgumentElement extends SyntaxElement implements TS.IArgumentElement {
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
    private _argMap: { [key: string]: ArgumentElement | null } = {};
    private _argTypeMap: { [key: string]: TPrimitiveName[] } | null = null;

    constructor(instruction: string, constraints: { [key: string]: TPrimitiveName[] } | null) {
        this._instruction = instruction;
        if (constraints === null) {
            return this;
        } else {
            this._argTypeMap = constraints;
            Object.keys(this._argTypeMap).forEach((argName) => (this._argMap[argName] = null));
        }
    }

    /** @throws Invalid argument, Invalid access */
    private _validateArgName(argName: string): void {
        if (this._argTypeMap === null) {
            throw Error(
                `Invalid access: instruction "${this._instruction}" does not take arguments`
            );
        }
        if (Object.keys(this._argTypeMap).indexOf(argName) === -1) {
            throw Error(
                `Invalid argument: "${argName}" does not exist for instruction "${this._instruction}"`
            );
        }
    }

    /** @throws Invalid argument, Invalid access */
    private _validateArg(argName: string, arg: ArgumentElement | null): void {
        this._validateArgName(argName);
        if (arg !== null && this._argTypeMap[argName].indexOf(arg.returnType) === -1) {
            throw Error(
                `Invalid argument: "${arg.returnType}" is not a valid type for "${argName}"`
            );
        }
    }

    /** @throws Invalid argument, Invalid access */
    setArg(argName: string, argElement: ArgumentElement | null): void {
        this._validateArg(argName, argElement);
        this._argMap[argName] = argElement;
    }

    /** @throws Invalid argument, Invalid access */
    getArg(argName: string): ArgumentElement | null {
        this._validateArgName(argName);
        return this._argMap[argName];
    }

    /** @throws Invalid argument, Invalid access */
    get argNames(): string[] {
        if (this._argTypeMap === null) {
            throw Error(
                `Invalid access: instruction "${this._instruction}" does not take arguments`
            );
        }
        return Object.keys(this._argTypeMap);
    }
}

export abstract class InstructionElement extends SyntaxElement implements TS.IInstructionElement {
    private _next: InstructionElement | null;
    private _args: InstructionArgs;

    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier);
        this._next = null;
        this._args = new InstructionArgs(identifier, !constraints ? null : constraints);
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

    abstract onVisit(): void;
}

export abstract class StatementElement extends InstructionElement implements TS.IStatementElement {
    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier, constraints);
    }
}

export abstract class BlockElement extends InstructionElement implements TS.IBlockElement {
    private _childHeads: (InstructionElement | null)[] = [null];
    private _childHead: InstructionElement | null = null;

    constructor(identifier: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(identifier, constraints);
    }

    set childHeads(innerHeads: (InstructionElement | null)[]) {
        this._childHeads = innerHeads;
    }

    get childHeads() {
        return this._childHeads;
    }

    set childHead(childHead: InstructionElement | null) {
        this._childHead = childHead;
    }

    get childHead() {
        return this._childHead;
    }

    abstract onExit(): void;
}
