import {
    ElementValueBoolean,
    ElementValueNumber,
    ElementValueString,
} from './elements/elementValue';
import {
    ElementBoxGeneric,
    ElementBoxBoolean,
    ElementBoxNumber,
    ElementBoxString,
} from './elements/elementBox';
import {
    ElementBoxIdentifierGeneric,
    ElementBoxIdentifierBoolean,
    ElementBoxIdentifierNumber,
    ElementBoxIdentifierString,
} from './elements/elementBoxIdentifier';
import {
    ElementOperatorMathPlus,
    ElementOperatorMathMinus,
    ElementOperatorMathTimes,
    ElementOperatorMathDivide,
    ElementOperatorMathModulus,
} from './elements/elementOperatorMath';
import { ElementRepeat } from './elements/elementLoop';
import { ElementIf } from './elements/elementConditional';
import { ElementProcess, ElementRoutine } from './elements/elementProgram';
import { ElementPrint } from './elements/elementPrint';

// -- types ----------------------------------------------------------------------------------------

import type { IElementSpecificationEntries } from '../@types/specification';

// -------------------------------------------------------------------------------------------------

/** Stores element specification data entries for factory list of syntax elements. */
const _elementSpecificationEntries: IElementSpecificationEntries = {
    programming: {
        entries: {
            // -- value elements -------------------------------------------------------------------
            'value-boolean': {
                category: 'value',
                label: 'true',
                type: 'Data',
                prototype: ElementValueBoolean,
                values: {
                    types: ['boolean'],
                },
            },
            'value-number': {
                category: 'value',
                label: '0',
                type: 'Data',
                prototype: ElementValueNumber,
                values: {
                    types: ['number'],
                },
            },
            'value-string': {
                category: 'value',
                label: 'string',
                type: 'Data',
                prototype: ElementValueString,
            },
            // -- box elements ---------------------------------------------------------------------
            'box-generic': {
                category: 'box',
                label: 'Box',
                type: 'Statement',
                prototype: ElementBoxGeneric,
            },
            'box-boolean': {
                category: 'box',
                label: 'Box (boolean)',
                type: 'Statement',
                prototype: ElementBoxBoolean,
            },
            'box-number': {
                category: 'box',
                label: 'Box (number)',
                type: 'Statement',
                prototype: ElementBoxNumber,
            },
            'box-string': {
                category: 'box',
                label: 'Box (string)',
                type: 'Statement',
                prototype: ElementBoxString,
            },
            // -- box identifier elements ----------------------------------------------------------
            'boxidentifier-generic': {
                category: 'boxidentifier',
                label: 'Box 1',
                type: 'Data',
                prototype: ElementBoxIdentifierGeneric,
            },
            'boxidentifier-boolean': {
                category: 'boxidentifier',
                label: 'Box 1',
                type: 'Data',
                prototype: ElementBoxIdentifierBoolean,
            },
            'boxidentifier-number': {
                category: 'boxidentifier',
                label: 'Box 1',
                type: 'Data',
                prototype: ElementBoxIdentifierNumber,
            },
            'boxidentifier-string': {
                category: 'boxidentifier',
                label: 'Box 1',
                type: 'Data',
                prototype: ElementBoxIdentifierString,
            },
            // -- math operator elements -----------------------------------------------------------
            'operator-math-plus': {
                category: 'operator-math',
                label: '+',
                type: 'Expression',
                prototype: ElementOperatorMathPlus,
            },
            'operator-math-minus': {
                category: 'operator-math',
                label: '-',
                type: 'Expression',
                prototype: ElementOperatorMathMinus,
            },
            'operator-math-times': {
                category: 'operator-math',
                label: '\u00d7',
                type: 'Expression',
                prototype: ElementOperatorMathTimes,
            },
            'operator-math-divide': {
                category: 'operator-math',
                label: '\u00f7',
                type: 'Expression',
                prototype: ElementOperatorMathDivide,
            },
            'operator-math-modulus': {
                category: 'operator-math',
                label: '%',
                type: 'Expression',
                prototype: ElementOperatorMathModulus,
            },
            // -- loop elements --------------------------------------------------------------------
            'repeat': {
                category: 'loop',
                label: 'repeat',
                type: 'Block',
                prototype: ElementRepeat,
            },
            // -- conditional elements -------------------------------------------------------------
            'if': {
                category: 'conditional',
                label: 'if',
                type: 'Block',
                prototype: ElementIf,
            },
            // -- program elements -----------------------------------------------------------------
            'process': {
                category: 'program',
                label: 'start',
                type: 'Block',
                prototype: ElementProcess,
                allowAbove: false,
                allowBelow: false,
            },
            'routine': {
                category: 'program',
                label: 'action',
                type: 'Block',
                prototype: ElementRoutine,
                allowAbove: false,
                allowBelow: false,
            },
            // -- print element --------------------------------------------------------------------
            'print': {
                category: 'misc',
                label: 'print',
                type: 'Statement',
                prototype: ElementPrint,
            },
        },
    },
};

export default _elementSpecificationEntries;
