import { TPrimitiveName, TPrimitive } from './@types/primitiveTypes';
import * as TS from './@types/structureElements';
import { Context } from './context';

// ---- Syntax Element -----------------------------------------------------------------------------

/**
 * Super class for all syntax elements. Holds the element name.
 * Will be tied to the corresponding UI element.
 */
export abstract class SyntaxElement implements TS.ISyntaxElement {
    private _elementName: string;

    constructor(elementName: string) {
        this._elementName = elementName;
    }

    get elementName() {
        return this._elementName;
    }
}

// ---- Argument Map -------------------------------------------------------------------------------

/** ADT that handles the mapping and interfacing of arguments to expressions/instructions. */
class ArgumentMap implements TS.IArgumentMap {
    private _elementName: string;
    private _argMap: { [key: string]: ArgumentElement | null } = {};
    private _argTypeMap: { [key: string]: TPrimitiveName[] } | null = null;

    constructor(elementName: string, constraints: { [key: string]: TPrimitiveName[] } | null) {
        this._elementName = elementName;
        if (constraints === null) {
            return this;
        } else {
            this._argTypeMap = constraints;
            Object.keys(this._argTypeMap).forEach((argLabel) => (this._argMap[argLabel] = null));
        }
    }

    /**
     * Checks if and argument label exists for the corresponding instruction/expression.
     * @throws Error
     */
    private _validateArgLabel(argLabel: string): void {
        if (this._argTypeMap === null) {
            throw Error(`"${this._elementName}" does not take arguments.`);
        }
        if (Object.keys(this._argTypeMap).indexOf(argLabel) === -1) {
            throw Error(`"${argLabel}" does not exist for "${this._elementName}".`);
        }
    }

    /**
     * Type-checks the type of the argument element with the constraints of the argument label.
     * @throws Error
     */
    private _validateArg(argLabel: string, arg: ArgumentElement | null): void {
        this._validateArgLabel(argLabel);
        if (
            arg !== null &&
            this._argTypeMap !== null &&
            this._argTypeMap[argLabel].indexOf(arg.type) === -1
        ) {
            // Allow higher type casting.
            if (
                !(
                    (arg.type === 'TInt' && this._argTypeMap[argLabel].indexOf('TFloat') !== -1) ||
                    (arg.type === 'TChar' && this._argTypeMap[argLabel].indexOf('TString') !== -1)
                )
            ) {
                throw Error(`"${arg.type}" is not a valid type for "${argLabel}".`);
            }
        }
    }

    /** @throws Error */
    setArg(argLabel: string, arg: ArgumentElement | null): void {
        this._validateArg(argLabel, arg);
        this._argMap[argLabel] = arg;
    }

    /** @throws Error */
    getArg(argLabel: string): ArgumentElement | null {
        this._validateArgLabel(argLabel);
        return this._argMap[argLabel];
    }

    /** @throws Error */
    get argLabels(): string[] {
        if (this._argTypeMap === null) {
            throw Error(`"${this._elementName}" does not take arguments.`);
        }
        return Object.keys(this._argTypeMap);
    }
}

// ---- Argument Element ---------------------------------------------------------------------------

export abstract class ArgumentElement extends SyntaxElement implements TS.IArgumentElement {
    private _argType: 'data' | 'expression';
    private _type: TPrimitiveName;

    constructor(elementName: string, argType: 'data' | 'expression', type: TPrimitiveName) {
        super(elementName);
        this._argType = argType;
        this._type = type;
    }

    get argType() {
        return this._argType;
    }

    get type() {
        return this._type;
    }

    abstract getData(props: {
        context?: Context;
        args?: { [key: string]: TPrimitive };
    }): TPrimitive;
}

export abstract class ArgumentDataElement
    extends ArgumentElement
    implements TS.IArgumentDataElement {
    constructor(elementName: string, type: TPrimitiveName) {
        super(elementName, 'data', type);
    }
}

export abstract class ArgumentExpressionElement
    extends ArgumentElement
    implements TS.IArgumentExpressionElement {
    private _args: ArgumentMap;

    constructor(
        elementName: string,
        type: TPrimitiveName,
        // Certain argument expressions might not take arguments, instead could work on the context.
        constraints?: { [key: string]: TPrimitiveName[] }
    ) {
        super(elementName, 'expression', type);
        this._args = new ArgumentMap(elementName, !constraints ? null : constraints);
    }

    get args() {
        return this._args;
    }
}

// ---- Instruction Element ------------------------------------------------------------------------

export abstract class InstructionElement extends SyntaxElement implements TS.IInstructionElement {
    private _next: InstructionElement | null = null;
    private _args: ArgumentMap;

    constructor(
        elementName: string,
        // Certain instructions might not take arguments, instead could work on the context.
        constraints?: { [key: string]: TPrimitiveName[] }
    ) {
        super(elementName);
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

    /** Executes when element is encountered by MB program interpretor. */
    abstract onVisit(props: { context?: Context; args?: { [key: string]: TPrimitive } }): void;

    /** Whether current instruction is a dummy instruction. */
    get isDummy() {
        return this.elementName === 'dummy';
    }
}

/** To be treated as a terminating or non-existing instruction. */
export class DummyElement extends InstructionElement {
    constructor() {
        super('dummy');
    }

    onVisit() {}
}

export abstract class StatementElement extends InstructionElement implements TS.IStatementElement {
    constructor(elementName: string, constraints?: { [key: string]: TPrimitiveName[] }) {
        super(elementName, constraints);
    }
}

export abstract class BlockElement extends InstructionElement implements TS.IBlockElement {
    private _blocksCount: number;
    private _childHeads: (InstructionElement | null)[] = [];
    private _childHead: InstructionElement | null;

    /** @throws Error */
    constructor(
        elementName: string,
        blocksCount: number,
        constraints?: { [key: string]: TPrimitiveName[] }
    ) {
        super(elementName, constraints);
        if (blocksCount < 1) {
            throw Error('Number of inner blocks cannot be less than 1.');
        }
        this._blocksCount = blocksCount;
        for (let i = 0; i < blocksCount; i++) {
            this._childHeads.push(null);
        }
        this._childHead = this._childHeads[0];
    }

    /** @throws Error */
    setChildHead(index: number, childHead: InstructionElement | null) {
        if (index < 0 || index >= this._blocksCount) {
            throw Error(`Index must lie in [0, ${this._blocksCount - 1}].`);
        }
        this._childHeads[index] = childHead;
    }

    /** @throws Error */
    getChildHead(index: number) {
        if (index < 0 || index >= this._blocksCount) {
            throw Error(`Index must lie in [0, ${this._blocksCount - 1}].`);
        }
        return this._childHeads[index];
    }

    /** @param childHead must always be one of the values of `_childHeads`. */
    set childHead(childHead: InstructionElement | null) {
        this._childHead = childHead;
    }

    get childHead() {
        return this._childHead;
    }

    /** Executes after instructions inside the block have been executed. */
    abstract onExit(props: { context?: Context; args?: { [key: string]: TPrimitive } }): void;
}
