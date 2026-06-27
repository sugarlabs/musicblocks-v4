import { TData, TDataName } from './data';
import {
    IElementData,
    IElementExpression,
    IElementStatement,
    IElementBlock,
    IElementSyntax,
} from './elements';

// -------------------------------------------------------------------------------------------------

/** Kind (`Argument`, `Instruction`) of the syntax element. */
export type TElementKind = 'Argument' | 'Instruction';
/** Type (`Data`, `Expression`, `Statement`, `Block`) of the syntax element. */
export type TElementType = 'Data' | 'Expression' | 'Statement' | 'Block';
/** Classification (logical grouping) of the syntax element. */
export type TElementClassification = {
    /** Identifier for related syntax element categories. */
    group: string;
    /** Identifier for related syntax elements. */
    category: string;
};

/** Type for the specification object for data elements. */
export interface IElementSpecificationData {
    classification: TElementClassification;
    label: string;
    type: 'Data';
    prototype: (name: string, label: string) => IElementData<TData>;
    values?:
        | string[]
        | {
              types: TDataName[];
          };
}

/** Type for the specification entry object for data elements. */
export interface IElementSpecificationEntryData extends Omit<
    IElementSpecificationData,
    'classification'
> {
    category: string;
    label: string;
    type: 'Data';
    prototype: typeof IElementData;
}

/** Type for the specification object for expression elements. */
export interface IElementSpecificationExpression {
    classification: TElementClassification;
    label: string;
    type: 'Expression';
    prototype: (name: string, label: string) => IElementExpression<TData>;
}

/** Type for the specification object for expression elements. */
export interface IElementSpecificationEntryExpression extends Omit<
    IElementSpecificationEntryExpression,
    'classification'
> {
    category: string;
    label: string;
    type: 'Expression';
    prototype: typeof IElementExpression;
}

/** Type for the specification object for instruction elements. */
interface IElementSpecificationInstruction {
    allowAbove?: string[] | boolean;
    allowBelow?: string[] | boolean;
    forbidAbove?: string[];
    forbidBelow?: string[];
    allowedNestLevel?: number[] | 'any';
    allowedNestInside?: string[] | boolean;
    forbiddenNestInside?: string[];
}

/** Type for the specification object for statement elements. */
export type IElementSpecificationStatement = IElementSpecificationInstruction & {
    classification: TElementClassification;
    label: string;
    type: 'Statement';
    prototype: (name: string, label: string) => IElementStatement;
};

/** Type for the specification object for statement elements. */
export type IElementSpecificationEntryStatement = Omit<
    IElementSpecificationStatement,
    'classification'
> & {
    category: string;
    label: string;
    type: 'Statement';
    prototype: typeof IElementStatement;
};

/** Type for the specification object for block elements. */
export type IElementSpecificationBlock = IElementSpecificationInstruction & {
    classification: TElementClassification;
    label: string;
    type: 'Block';
    prototype: (name: string, label: string) => IElementBlock;
    allowNestInside?: string[] | boolean;
    forbidNestInside?: string[];
};

/** Type for the specification entry object for block elements. */
export type IElementSpecificationEntryBlock = Omit<IElementSpecificationBlock, 'classification'> & {
    category: string;
    label: string;
    type: 'Block';
    prototype: typeof IElementBlock;
    allowNestInside?: string[] | boolean;
    forbidNestInside?: string[];
};

/** Type for the specification object for an element. */
export interface IElementSpecification {
    classification: TElementClassification;
    label: string;
    type: TElementType;
    prototype: new (name: string, label: string) => IElementSyntax;
    allowAbove?: string[] | boolean;
    allowBelow?: string[] | boolean;
    forbidAbove?: string[];
    forbidBelow?: string[];
    allowedNestLevel?: number[] | 'any';
    allowedNestInside?: string[] | boolean;
    forbiddenNestInside?: string[];
    allowNestInside?: string[] | boolean;
    forbidNestInside?: string[] | boolean;
    values?:
        | string[]
        | {
              types: TDataName[];
          };
}

/** Type for the snapshot of an element's specification. */
export interface IElementSpecificationSnapshot extends Omit<IElementSpecification, 'prototype'> {
    prototypeName: string;
}

/** Type definition for a table of element specification entries. */
export type IElementSpecificationEntries = {
    /** Element group name. */
    [group: string]: {
        /** Element specification entries by element name/identifier. */
        entries: {
            [identifier: string]:
                | IElementSpecificationEntryData
                | IElementSpecificationEntryExpression
                | IElementSpecificationEntryStatement
                | IElementSpecificationEntryBlock;
        };
        /** Element group context key-value dictionary. */
        context?: Record<string, unknown>;
    };
};
