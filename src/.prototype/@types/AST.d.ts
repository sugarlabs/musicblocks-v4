// ---- Argument Element ---------------------------------------------------------------------------

/** Whether argument element is simply a value or maps values to another, i.e. a function */
export type TArgType = "value" | "function";
/** Type of value returned by argument element in string */
export type TArgReturn = "string" | "number" | "boolean";
/** Type of value returned by argument element value */
export type TArgValue = string | number | boolean;

/** Argument element properties */
export interface IArgProps {
    /** What the argument element represents */
    argName: string;
    /** valid if argument element is of type "function" */
    args?: IArgElement[];
    /** valid if argument element is of type "value" */
    value?: string | number | boolean;
}

/** Argument element */
export interface IArgElement {
    argType: TArgType;
    returnType: TArgReturn;
    props: IArgProps;
}

// ---- Syntax Element - instruction ---------------------------------------------------------------

/** AST instruction category */
export type TInstructionType =
    | "start"
    | "action"
    | "flow"
    | "flow-no-args"
    | "clamp"
    | "clamp-no-args";

/** AST instruction properties */
export interface IInstructionProps {
    /** name of the instruction represented */
    instruction: string;
    /** list of arguments; valid if element takes arguments */
    args?: IArgElement[];
    /** linked-list of blocks; valid if element is a clamp (or action/start) type */
    childStack?: ISyntaxElement[];
}

/** AST syntax element - instruction */
export interface ISyntaxElement {
    type: TInstructionType;
    props: IInstructionProps;
}

// ---- Abstract Syntax Tree (AST) -----------------------------------------------------------------

export interface IStack {
    name: string;
    stack: ISyntaxElement[];
}

export interface IAST {
    startStacks: IStack[];
    actionStacks: IStack[];
}
