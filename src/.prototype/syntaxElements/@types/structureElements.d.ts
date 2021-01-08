import { TPrimitive, TPrimitiveName } from './primitiveTypes';

/** An object whose class implements this will be tied to the corresponding UI element. */
export interface ISyntaxElement {
    identifier: string;
}

export interface IDataElement {
    data: TPrimitive;
}

export interface IExpressionElement {}

export interface IArgumentElement extends ISyntaxElement {
    type: 'data' | 'expression';
    returnType: TPrimitiveName;
    data: TPrimitive;
}

export interface IArgumentDataElement extends ISyntaxElement, IDataElement {}

export interface IArgumentExpressionElement extends ISyntaxElement, IExpressionElement {}

export interface IInstructionArgs {
    argNames: string[];
    setArg: Function;
    getArg: Function;
}

interface IInstructionElement extends ISyntaxElement {
    args: Object | null;
    next: Object | null;
}

export interface IStatementElement extends IInstructionElement {}

export interface IBlockElement extends IInstructionElement {
    childHeads: (IInstructionElement | null)[];
    childHead: IInstructionElement | null;
}
