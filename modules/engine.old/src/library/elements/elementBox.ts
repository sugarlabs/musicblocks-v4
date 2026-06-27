import { ElementStatement } from '../../syntax/elements/elementInstruction';

import { declareVariable } from '../../execution/interpreter';

// -- types ----------------------------------------------------------------------------------------

import type { TData, TDataName } from '../../@types/data';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

/**
 * @virtual
 * @class
 * Generic class that defines a literally generic box element.
 *
 * @classdesc
 * Box elements add (declare) variables to the symbol table.
 */
abstract class ElementBox extends ElementStatement {
    constructor(name: string, label: string, types: TDataName[]) {
        super(name, label, {
            name: ['string'],
            value: types,
        });
    }

    /** @override */
    public onVisit(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { name: string; value: TData },
    ): void {
        switch (typeof params.value) {
            case 'boolean':
                declareVariable(params.name, 'boolean', params.value);
                break;
            case 'number':
                declareVariable(params.name, 'number', params.value);
                break;
            case 'string':
                declareVariable(params.name, 'string', params.value);
                break;
            default:
                throw Error('Trespassing access: This should never be reached');
        }
    }
}

/**
 * @class
 * Defines a box element that declares a variable of any data type.
 */
export class ElementBoxGeneric extends ElementBox {
    constructor(name: string, label: string) {
        super(name, label, ['boolean', 'number', 'string']);
    }

    /** @override */
    onVisit(
        scope: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { name: string; value: TData },
    ): void {
        super.onVisit(scope, params);
    }
}

/**
 * @class
 * Defines a box element that declares a variable of boolean type.
 */
export class ElementBoxBoolean extends ElementBox {
    constructor(name: string, label: string) {
        super(name, label, ['boolean']);
    }

    /** @override */
    onVisit(
        scope: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { name: string; value: boolean },
    ): void {
        super.onVisit(scope, params);
    }
}

/**
 * @class
 * Defines a box element that declares a variable of number type.
 */
export class ElementBoxNumber extends ElementBox {
    constructor(name: string, label: string) {
        super(name, label, ['number']);
    }

    /** @override */
    onVisit(
        scope: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { name: string; value: number },
    ): void {
        super.onVisit(scope, params);
    }
}

/**
 * @class
 * Defines a box element that declares a variable of string type.
 */
export class ElementBoxString extends ElementBox {
    constructor(name: string, label: string) {
        super(name, label, ['string']);
    }

    /** @override */
    onVisit(
        scope: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { name: string; value: string },
    ): void {
        super.onVisit(scope, params);
    }
}
