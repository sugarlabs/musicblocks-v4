import { TData, TDataName } from './data';
import { TElementKind, TElementType } from './specification';
import { IContext, ISymbolTable } from './scope';

// -------------------------------------------------------------------------------------------------

/** Interface for the class that implements a syntax element. */
export interface IElementSyntax {
    /** Name of the syntax element. */
    name: string;
    /** Display name of the syntax element. */
    label: string;
    /** Kind (`Argument`, `Instruction`) of the syntax element. */
    kind: TElementKind;
    /** Type (`Data`, `Expression`, `Statement`, `Block`) of the syntax element. */
    type: TElementType;
    /** Number of arguments the syntax element registers. */
    argCount: number;
    /** Names of the arguments the syntax element registers. */
    argLabels: string[];
    /**
     * Returns the data type an argument accepts.
     * @param argName - name of the argument
     * @returns list of data types
     */
    getArgType(argName: string): TDataName[];
    /**
     * Updates the label of the syntax element.
     * @param value - new label value
     */
    updateLabel(value: string): void;
}

/** Generic interface for the class that implements an argument element. */
export interface IElementArgument<T> extends IElementSyntax {
    /** Return types of the value returned by the argument element. */
    returnType: TDataName[];
    /** Value returned by the argument element. */
    value: T;
}

/** Generic interface for the class that implements a data element. */
export interface IElementData<T> extends IElementArgument<T> {
    /**
     * Evalutates the logic of the data element (usually based on the label).
     * @param scope An object containing context and symbol table instances
     */
    evaluate(scope: { context: IContext; symbolTable: ISymbolTable }): void;
}

/** Generic interface for the class that implements an expression element. */
export interface IElementExpression<T> extends IElementArgument<T> {
    /**
     * Evalutates the logic of the expression using the supplied parameters and stores the value.
     * @param scope object containing context and symbol table instances
     * @param params object containing key-value pairs of each argument and it's value
     */
    evaluate(
        scope: { context: IContext; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
}

/** Interface for the class that implements an instruction element. */
export interface IElementInstruction extends IElementSyntax {
    /**
     * Executes the instruction using the supplied parameters.
     * @param scope object containing context and symbol table instances
     * @param params object containing key-value pairs of each argument and it's value
     */
    onVisit(
        scope: { context: IContext; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
}

/** Interface for the class that implements a statement element. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IElementStatement extends IElementInstruction {}

/** Interface for the class that implements a block element. */
export interface IElementBlock extends IElementInstruction {
    /**
     * Executes before each containing instruction is executed.
     * @param scope object containing context and symbol table instances
     */
    onInnerVisit(
        scope: { context: IContext; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
    /**
     * Executes after each containing instruction is executed.
     * @param scope object containing context and symbol table instances
     */
    onInnerExit(
        scope: { context: IContext; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
    /**
     * Executes after all containing instructions are executed.
     * @param scope object containing context and symbol table instances
     */
    onExit(
        scope: { context: IContext; symbolTable: ISymbolTable },
        params: { [key: string]: TData },
    ): void;
}
