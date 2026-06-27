import { ElementBlock } from '../../syntax/elements/elementInstruction';

import { overrideProgramCounter } from '../../execution/interpreter';

// -- types ----------------------------------------------------------------------------------------

import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

/**
 * @class
 * Defines a repeat block element.
 * @classdesc
 * Repeats the scope as many times as the parameter provided.
 */
export class ElementRepeat extends ElementBlock {
    constructor(name: string, label: string) {
        super(name, label, { times: ['number'] });
    }

    private _counter = 0;

    onVisit(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { times: number },
    ): void {
        this._counter = params.times;
    }

    onInnerVisit(): void {
        // no use
    }

    onInnerExit(): void {
        // no use
    }

    onExit(): void {
        this._counter--;
        if (this._counter !== 0) {
            overrideProgramCounter('__goinnerfirst__');
        }
    }
}
