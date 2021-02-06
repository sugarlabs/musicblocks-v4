import {
    ArgumentDataElement,
    InstructionElement,
    StatementElement,
    SyntaxElement
} from './structureElements';

import { ActionBlock, StartBlock } from './AST';
import { ValueElement } from './program-elements/valueElements';
import { DataElement } from './program-elements/dataElements';
import { OperationElement } from './program-elements/operationElements';
import { ConditionalElement } from './program-elements/conditionalElements';
import { LoopElement } from './program-elements/loopElements';
import { MiscellaneousElement } from './program-elements/miscellaneousElements';

export const syntaxElementMap = {
    'start': StartBlock,
    'action': ActionBlock,
    // 'int': ValueElement.IntElement,
    // 'float': ValueElement.FloatElement,
    // 'char': ValueElement.CharElement,
    // 'string': ValueElement.StringElement,
    'true': ValueElement.TrueElement,
    'false': ValueElement.FalseElement,
    // 'data-value-int': ValueElement.IntDataValueElement,
    // 'data-value-float': ValueElement.FloatDataValueElement,
    // 'data-value-char': ValueElement.CharDataValueElement,
    // 'data-value-string': ValueElement.StringDataValueElement,
    // 'data-value-boolean': ValueElement.BooleanDataValueElement,
    'data-int': DataElement.IntDataElement,
    'data-float': DataElement.FloatDataElement,
    'data-char': DataElement.CharDataElement,
    'data-string': DataElement.StringDataElement,
    'data-boolean': DataElement.BooleanDataElement,
    'update-data-int': DataElement.UpdateIntDataElement,
    'update-data-float': DataElement.UpdateFloatDataElement,
    'update-data-char': DataElement.UpdateCharDataElement,
    'update-data-string': DataElement.UpdateStringDataElement,
    'update-data-boolean': DataElement.UpdateBooleanDataElement,
    'add': OperationElement.AddElement,
    'subtract': OperationElement.SubtractElement,
    'multiply': OperationElement.MultiplyElement,
    'divide': OperationElement.DivideElement,
    'mod': OperationElement.ModElement,
    'equals': OperationElement.EqualsElement,
    'greater-than': OperationElement.GreaterThanElement,
    'less-than': OperationElement.LessThanElement,
    'and': OperationElement.AndElement,
    'or': OperationElement.OrElement,
    'if': ConditionalElement.IfThenElement,
    'if-else': ConditionalElement.IfElseElement,
    'repeat': LoopElement.RepeatLoopElement,
    'print': MiscellaneousElement.PrintElement
};

type TValueElementName = 'int' | 'float' | 'char' | 'string';
export type TSyntaxElementName = keyof typeof syntaxElementMap | TValueElementName;

/**
 * Instantiates a syntax element and returns the object along with its super-class type.
 * @param elementName - name of the supported element.
 * @param arg - parameter for instantiation (value elements require one).
 */
export function createSyntaxElement(
    elementName: TSyntaxElementName,
    arg?: unknown
): {
    element: SyntaxElement;
    type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
} {
    try {
        let element: SyntaxElement;
        switch (elementName) {
            case 'int':
                if (typeof arg !== 'number') throw Error();
                element = new ValueElement.IntElement(arg as number);
                break;
            case 'float':
                if (typeof arg !== 'number') throw Error();
                element = new ValueElement.FloatElement(arg as number);
                break;
            case 'char':
                if (typeof arg !== 'number' && typeof arg !== 'string') throw Error();
                element = new ValueElement.CharElement(arg as number | string);
                break;
            case 'string':
                if (typeof arg !== 'string') throw Error();
                element = new ValueElement.StringElement(arg as string);
                break;
            default:
                element = new syntaxElementMap[elementName]();
        }
        const type =
            element instanceof InstructionElement
                ? element instanceof StatementElement
                    ? 'statement'
                    : 'block'
                : element instanceof ArgumentDataElement
                ? 'arg-data'
                : 'arg-exp';
        return { element, type };
    } catch (e) {
        throw Error(
            `Instantiation failed: invalid argument supplied for element "${elementName}".`
        );
    }
}
