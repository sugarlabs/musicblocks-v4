/** Reresents a literal code argument. */
export type ICodeArgumentLiteral = boolean | number | string;

/** Represents the interface for a code argument snapshot object. */
export interface ICodeArgumentObj {
    [key: string]: ICodeArgumentLiteral | ICodeArgumentObj;
}

/** Represents the interface for a code argument element. */
export type ICodeArgument = ICodeArgumentLiteral | ICodeArgumentObj;

/** Represents the interface for a code instruction element object. */
export interface ICodeInstructionObj {
    [instruction: string]: ICodeArgument;
}

/** Represents the interface for a code instruction element. */
export type ICodeInstruction = string | ICodeInstructionObj;
