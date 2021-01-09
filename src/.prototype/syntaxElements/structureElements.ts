import { TPrimitiveName, TPrimitive } from './@types/primitiveTypes';
import * as TS from './@types/structureElements';

// ---- Syntax Element -----------------------------------------------------------------------------

abstract class SyntaxElement implements TS.ISyntaxElement {
    private _elementName: string;

    constructor(elementName: string) {
        this._elementName = elementName;
    }

    get elementName() {
        return this._elementName;
    }
}

// ---- Argument Element ---------------------------------------------------------------------------

export abstract class ArgumentElement extends SyntaxElement implements TS.IArgumentElement {
    private _type: 'data' | 'expression';
    private _returnType: TPrimitiveName;

    constructor(elementName: string, type: 'data' | 'expression', returnType: TPrimitiveName) {
        super(elementName);
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

export abstract class ArgumentDataElement
    extends ArgumentElement
    implements TS.IArgumentDataElement {
    private _dataElement: TPrimitive;

    constructor(elementName: string, dataElement: TPrimitive) {
        super(elementName, 'data', dataElement.type);
        this._dataElement = dataElement;
    }

    get data() {
        return this._dataElement;
    }
}

export abstract class ArgumentExpressionElement
    extends ArgumentElement
    implements TS.IArgumentExpressionElement {
    private _args: ArgumentMap;

    constructor(
        elementName: string,
        type: TPrimitiveName,
        constraints?: { [key: string]: TPrimitiveName[] }
    ) {
        super(elementName, 'expression', type);
        this._args = new ArgumentMap(elementName, !constraints ? null : constraints);
    }

    get args() {
        return this._args;
    }

    abstract get data(): TPrimitive;
}

// ---- Argument Map -------------------------------------------------------------------------------

class ArgumentMap implements TS.IArgumentMap {
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
        if (
            arg !== null &&
            this._argTypeMap !== null &&
            this._argTypeMap[argName].indexOf(arg.returnType) === -1
        ) {
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

// ---- Instruction Element ------------------------------------------------------------------------

export abstract class InstructionElement extends SyntaxElement implements TS.IInstructionElement {
    private _next: InstructionElement | null;
    private _args: ArgumentMap;

    constructor(elementName: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(elementName);
        this._next = null;
        this._args = new ArgumentMap(elementName, !constraints ? null : constraints);
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
    constructor(elementName: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(elementName, constraints);
    }
}

export abstract class BlockElement extends InstructionElement implements TS.IBlockElement {
    private _childHeads: (InstructionElement | null)[] = [null];
    private _childHead: InstructionElement | null = null;

    constructor(elementName: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(elementName, constraints);
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
