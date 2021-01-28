import { TPrimitiveName, TPrimitive } from './@types/primitiveTypes';
import * as TS from './@types/structureElements';

// ---- Syntax Element -----------------------------------------------------------------------------

/**
 * Super class for all syntax elements. Holds the element name.
 * Will be tied to the corresponding UI element.
 */
abstract class SyntaxElement implements TS.ISyntaxElement {
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

    /**
     * Checks if and argument label exists for the corresponding instruction/expression.
     * @throws Invalid argument, Invalid access
     */
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

    /**
     * Type-checks the type of the argument element with the constraints of the argument label.
     * @throws Invalid argument, Invalid access
     */
    private _validateArg(argName: string, arg: ArgumentElement | null): void {
        this._validateArgName(argName);
        if (
            arg !== null &&
            this._argTypeMap !== null &&
            this._argTypeMap[argName].indexOf(arg.type) === -1
        ) {
            // Allow higher type casting.
            if (
                !(
                    (arg.type === 'TInt' && this._argTypeMap[argName].indexOf('TFloat') !== -1) ||
                    (arg.type === 'TChar' && this._argTypeMap[argName].indexOf('TString') !== -1)
                )
            ) {
                throw Error(`Invalid argument: "${arg.type}" is not a valid type for "${argName}"`);
            }
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

    abstract get data(): TPrimitive;
}

export abstract class ArgumentDataElement
    extends ArgumentElement
    implements TS.IArgumentDataElement {
    constructor(elementName: string, type: TPrimitiveName) {
        super(elementName, 'data', type);
    }

    abstract get data(): TPrimitive;
}

export abstract class ArgumentExpressionElement
    extends ArgumentElement
    implements TS.IArgumentExpressionElement {
    private _args: ArgumentMap;

    constructor(
        elementName: string,
        type: TPrimitiveName,
        /**
         * Certain argument expressions might not take arguments, instead could work on state
         * objects exposed to the framework.
         */
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

    /** Executes when element is encountered by MB program interpretor. */
    abstract onVisit(): void;
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

    /** @throws Invalid argument */
    constructor(
        elementName: string,
        blocksCount: number,
        constraints?: { [key: string]: TPrimitiveName[] }
    ) {
        super(elementName, constraints);
        if (blocksCount < 1) {
            throw Error('Invalid argument: number of inner blocks cannot be less than 1');
        }
        this._blocksCount = blocksCount;
        for (let i = 0; i < blocksCount; i++) {
            this._childHeads.push(null);
        }
        this._childHead = this._childHeads[0];
    }

    /** @throws Invalid argument */
    setChildHead(index: number, childHead: InstructionElement | null) {
        if (index < 0 || index >= this._blocksCount) {
            throw Error(`Invalid argument: index must lie in [0, ${this._blocksCount - 1}]`);
        }
        this._childHeads[index] = childHead;
    }

    /** @throws Invalid argument */
    getChildHead(index: number) {
        if (index < 0 || index >= this._blocksCount) {
            throw Error(`Invalid argument: index must lie in [0, ${this._blocksCount - 1}]`);
        }
        return this._childHeads[index];
    }

    set childHead(childHead: InstructionElement | null) {
        this._childHead = childHead;
    }

    get childHead() {
        return this._childHead;
    }

    /** Executes after instructions inside the block have been executed. */
    abstract onExit(): void;
}
