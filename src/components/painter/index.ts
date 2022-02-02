import { mount as mountView, mountSketch, setupAction } from './view';
import { sketch, run, reset } from './painter';

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the Painter component inside the DOM container.
 * @param container DOM container
 */
export function mount(container: HTMLElement): void {
    mountView(container);

    setTimeout(() => {
        mountSketch(sketch);

        setupAction('run', run);
        setupAction('reset', reset);
    });
}

// == specification ================================================================================

import {
    IElementSpecificationEntryBlock,
    IElementSpecificationEntryData,
    IElementSpecificationEntryExpression,
    IElementSpecificationEntryStatement,
} from '@sugarlabs/musicblocks-v4-lib/@types/specification';

import {
    ElementMoveForward,
    ElementMoveBackward,
    ElementTurnLeft,
    ElementTurnRight,
    ElementSetColor,
    ElementSetThickness,
} from './painter';

// -------------------------------------------------------------------------------------------------

/**
 * Syntax element specification object for the Painter component.
 */
export const specification: {
    [identifier: string]:
        | IElementSpecificationEntryData
        | IElementSpecificationEntryExpression
        | IElementSpecificationEntryStatement
        | IElementSpecificationEntryBlock;
} = {
    'move-forward': {
        label: 'forward',
        type: 'Statement',
        category: 'Graphics',
        prototype: ElementMoveForward,
    },
    'move-backward': {
        label: 'backward',
        type: 'Statement',
        category: 'Graphics',
        prototype: ElementMoveBackward,
    },
    'turn-left': {
        label: 'left',
        type: 'Statement',
        category: 'Graphics',
        prototype: ElementTurnLeft,
    },
    'turn-right': {
        label: 'right',
        type: 'Statement',
        category: 'Graphics',
        prototype: ElementTurnRight,
    },
    'set-color': {
        label: 'set color',
        type: 'Statement',
        category: 'Pen',
        prototype: ElementSetColor,
    },
    'set-thickness': {
        label: 'set thickness',
        type: 'Statement',
        category: 'Pen',
        prototype: ElementSetThickness,
    },
};
