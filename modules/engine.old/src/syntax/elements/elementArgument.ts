import { ElementSyntax } from './elementSyntax';

// -- types ----------------------------------------------------------------------------------------

import type { TData, TDataName } from '../../@types/data';
import type { IElementArgument, IElementExpression, IElementData } from '../../@types/elements';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

/**
 * @virtual
 * @class
 * Generic class that defines a generic argument element.
 *
 * @classdesc
 * Argument elements return a value which is either stored (data element) or evaluated (expression
 * element) from the parameters passed. Every data element and expression element needs to extend
 * this class.
 */
export abstract class ElementArgument<T> extends ElementSyntax implements IElementArgument<T> {
    /** Stores the return type of the value returned by the argument element. */
    private _returnType: TDataName[];
    /** Stores the value this is returned by the argument element. */
    protected _value: T;

    /**
     * @param name name of the argument element
     * @param label display name of the instruction element
     * @param type type (`Data`, `Expression`) of the argument element
     * @param argMap an object describing the type specification of each argument as a
     *  `argName: type[]` pair
     * @param returnType return types of the value returned by the argument element
     * @param initialValue initial return value of the argument
     */
    constructor(
        name: string,
        label: string,
        type: 'Data' | 'Expression',
        argMap: { [key: string]: TDataName[] },
        returnType: TDataName[],
        initialValue: T,
    ) {
        super(name, label, 'Argument', type, argMap);

        this._returnType = returnType;
        this._value = initialValue;
    }

    public get returnType(): TDataName[] {
        return this._returnType;
    }

    public get value(): T {
        return this._value;
    }
}

/**
 * @virtual
 * @class
 * Generic class that defines a generic data element.
 *
 * @classdesc
 * Data elements return a stored value.
 */
export abstract class ElementData<T> extends ElementArgument<T> implements IElementData<T> {
    /**
     * @param name - name of the data element
     * @param label - display name of the instruction element
     * @param argMap - an object describing the type specification of each argument as a
     *  `argName: type[]` pair
     * @param returnType - return types of the value returned by the argument element
     * @param initialValue - initial return value of the argument
     */
    constructor(
        name: string,
        label: string,
        argMap: { [key: string]: TDataName[] },
        returnType: TDataName[],
        initialValue: T,
    ) {
        super(name, label, 'Data', argMap, returnType, initialValue);
    }

    public abstract evaluate(scope: {
        context: IContext<Record<string, unknown>>;
        symbolTable: ISymbolTable;
    }): void;
}

/**
 * @virtual
 * @class
 * Generic class that defines a generic expression element.
 *
 * @classdesc
 * Expression elements evalutate a value based on the provided passed whose shape is in accordance
 * with the shape of arguments it registers.
 */
export abstract class ElementExpression<T>
    extends ElementArgument<T>
    implements IElementExpression<T>
{
    /**
     * @param name name of the expression element
     * @param label display name of the instruction element
     * @param argMap an object describing the type specification of each argument as a
     *  `argName: type[]` pair
     * @param returnType return types of the value returned by the argument element
     * @param initialValue initial return value of the argument
     */
    constructor(
        name: string,
        label: string,
        argMap: { [key: string]: TDataName[] },
        returnType: TDataName[],
        initialValue: T,
    ) {
        super(name, label, 'Expression', argMap, returnType, initialValue);
    }

    public abstract evaluate(
        scope: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
}
