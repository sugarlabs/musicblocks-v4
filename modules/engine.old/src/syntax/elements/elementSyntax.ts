import type { TDataName } from '../../@types/data';
import type { IElementSyntax } from '../../@types/elements';

// -------------------------------------------------------------------------------------------------

/**
 * @virtual
 * @class
 * Defines a generic syntax element and it's properties.
 *
 * @classdesc
 * Syntax elements define the building blocks of a Music Blocks program. Every building block
 * element need to inherit this class.
 */
export abstract class ElementSyntax implements IElementSyntax {
    /** Stores the name of the syntax element. */
    private _name: string;
    /** Stores the display name of the syntax element. */
    private _label: string;
    /** Stores the kind of the syntax element. */
    private _kind: 'Argument' | 'Instruction';
    /** Stores the type of the syntax element. */
    private _type: 'Data' | 'Expression' | 'Statement' | 'Block';
    /** Stores the number of arguments the syntax element registers. */
    private _argCount: number;
    /** Stores the names of the arguments the syntax element registers. */
    private _argLabels: string[];
    /** Stores an object describing the type specification of each argument. */
    private _argMap: { [key: string]: TDataName[] };

    /**
     *
     * @param name name of the syntax element
     * @param label display of the syntax element
     * @param kind kind (`Argument`, `Instruction`) of the syntax element
     * @param type type (`Data`, `Expression`, `Statement`, `Block`) of the syntax element
     * @param argMap an object describing the type specification of each argument as a
     *  `argName: type[]` pair
     */
    constructor(
        name: string,
        label: string,
        kind: 'Argument' | 'Instruction',
        type: 'Data' | 'Expression' | 'Statement' | 'Block',
        argMap: { [key: string]: TDataName[] },
    ) {
        this._name = name;
        this._label = label;
        this._kind = kind;
        this._type = type;
        this._argMap = argMap;
        this._argLabels = Object.keys(this._argMap);
        this._argCount = this.argLabels.length;
    }

    public get name(): string {
        return this._name;
    }

    public get label(): string {
        return this._label;
    }

    public get kind(): 'Argument' | 'Instruction' {
        return this._kind;
    }

    public get type(): 'Data' | 'Expression' | 'Statement' | 'Block' {
        return this._type;
    }

    public get argCount(): number {
        return this._argCount;
    }

    public get argLabels(): string[] {
        return this._argLabels;
    }

    public getArgType(argName: string): TDataName[] {
        return this._argMap[argName];
    }

    public updateLabel(value: string): void {
        this._label = value;
    }
}
