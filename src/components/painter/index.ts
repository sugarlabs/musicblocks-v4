import type { IComponentDefinitionPainter, TInjectedPainter } from '@/@types/components/painter';
import type { IComponentMenu } from '@/@types/components/menu';

import { getComponent } from '@/core/config';

import { mount as mountView, mountSketch } from './view';
import { sketch, run, reset } from './painter';
import {
    ElementMoveForward,
    ElementMoveBackward,
    ElementTurnLeft,
    ElementTurnRight,
    ElementSetXY,
    ElementSetHeading,
    ElementDrawArc,
    ElementSetColor,
    ElementSetThickness,
    ElementPenUp,
    ElementPenDown,
    ElementSetBackground,
    ElementClear,
} from './painter';

import { loadProject, saveProjectHTML, uploadFileInLocalStorage } from '../imp-exp/imp-exp';

import { exportDrawing, startRecording, stopRecording } from './core/sketchP5';

// == definition ===================================================================================

export const definition: IComponentDefinitionPainter = {
    dependencies: {
        optional: ['menu'],
        required: [],
    },
    flags: {},
    strings: {},
    assets: ['image.icon.mouse'],
    elements: {
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
        'set-heading': {
            label: 'set heading',
            type: 'Statement',
            category: 'Graphics',
            prototype: ElementSetHeading,
        },
        'draw-arc': {
            label: 'draw arc',
            type: 'Statement',
            category: 'Graphics',
            prototype: ElementDrawArc,
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
        'pen-up': {
            label: 'pen up',
            type: 'Statement',
            category: 'Pen',
            prototype: ElementPenUp,
        },
        'pen-down': {
            label: 'pen down',
            type: 'Statement',
            category: 'Pen',
            prototype: ElementPenDown,
        },
        'set-background': {
            label: 'set background',
            type: 'Statement',
            category: 'Pen',
            prototype: ElementSetBackground,
        },
        'clear': {
            label: 'clear',
            type: 'Statement',
            category: 'Pen',
            prototype: ElementClear,
        },
    },
};

export const injected: TInjectedPainter = {
    flags: undefined,
    i18n: undefined,
    // @ts-ignore
    assets: undefined,
};

export const strings = definition.strings;

export const specification = definition.elements;

// == public functions =============================================================================

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
            menu.mountHook('uploadFileInLocalStorage', uploadFileInLocalStorage);
            menu.mountHook('startRecording', startRecording);
            menu.mountHook('stopRecording', stopRecording);
            menu.mountHook('exportDrawing', exportDrawing);
            menu.mountHook('loadProject', loadProject);
            menu.mountHook('saveProject', saveProjectHTML);
            menu.mountHook('run', run);
            menu.mountHook('reset', reset);
        }

        reset();

        resolve();
    });
}
