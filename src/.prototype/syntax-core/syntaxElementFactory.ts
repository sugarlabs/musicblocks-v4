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

const syntaxElementMap = {
    'start': StartBlock,
    'action': ActionBlock,
    'int': ValueElement.IntElement,
    'float': ValueElement.FloatElement,
    'char': ValueElement.CharElement,
    'string': ValueElement.StringElement,
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

export function createSyntaxElement(
    elementName: string
): {
    element: SyntaxElement;
    type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
} {
    const element: SyntaxElement = new syntaxElementMap[elementName]();
    const type =
        element instanceof InstructionElement
            ? element instanceof StatementElement
                ? 'statement'
                : 'block'
            : element instanceof ArgumentDataElement
            ? 'arg-data'
            : 'arg-exp';
    return { element, type };
}
