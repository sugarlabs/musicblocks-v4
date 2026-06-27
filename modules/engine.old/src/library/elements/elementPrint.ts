import { ElementStatement } from '../../syntax/elements/elementInstruction';

// -- types ----------------------------------------------------------------------------------------

import type { TData } from '../../@types/data';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

export class ElementPrint extends ElementStatement {
    constructor(name: string, label: string) {
        super(name, label, { value: ['boolean', 'number', 'string'] });
    }

    onVisit(
        _: {
            context: IContext<Record<string, unknown>>;
            symbolTable: ISymbolTable;
        },
        params: { value: TData },
    ): void {
        // eslint-disable-next-line no-console
        console.log(params.value);
    }
}
