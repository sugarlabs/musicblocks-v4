import { IComponentMenu } from '../../@types/components/menu';

import { getComponent } from '../../config';

import { mount as mountView, mountSketch } from './view';
import { sketch, run, reset } from './painter';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Painter component.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await mountView();
            await mountSketch(sketch);
            resolve();
        })();
    });
}

/**
 * Initializes the Painter component; mounts the hooks.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        const menu = getComponent('menu') as IComponentMenu;
        if (menu) {
            menu.mountHook('run', run);
            menu.mountHook('reset', reset);
        }
        resolve();
    });
}

// == specification ================================================================================

import { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

import {
    ElementMoveForward,
    ElementMoveBackward,
    ElementTurnLeft,
    ElementTurnRight,
    ElementSetXY,
    ElementSetColor,
    ElementSetThickness,
} from './painter';

// -------------------------------------------------------------------------------------------------

/**
 * Syntax element specification object for the Painter component.
 */
export const specification: {
    [identifier: string]: IElementSpecification;
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
    'set-xy': {
        label: 'set xy',
        type: 'Statement',
        category: 'Graphics',
        prototype: ElementSetXY,
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
