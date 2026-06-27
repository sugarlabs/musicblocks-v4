import { ElementBlock } from '../../syntax/elements/elementInstruction';

// -- types ----------------------------------------------------------------------------------------

import type { TData } from '../../@types/data';
import type { IContext, ISymbolTable } from '../../@types/scope';

// -------------------------------------------------------------------------------------------------

export class ElementProcess extends ElementBlock {
    constructor(name: string, label: string) {
        super(name, label, {});
    }

    onVisit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onInnerVisit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onInnerExit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onExit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }
}

export class ElementRoutine extends ElementBlock {
    constructor(name: string, label: string) {
        super(name, label, { name: ['string'] });
    }

    onVisit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onInnerVisit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onInnerExit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }

    onExit(
        _: { context: IContext<Record<string, unknown>>; symbolTable: ISymbolTable },
        __: { [key: string]: TData },
    ): void {
        1;
    }
}
