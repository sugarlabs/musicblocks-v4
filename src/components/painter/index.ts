import type { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';
import type { TInjectedPainter } from '@/@types/components/painter';

import { hearEvent } from '@sugarlabs/mb4-events';
import { loadProject, saveProjectHTML, uploadFileInLocalStorage } from '../imp-exp/imp-exp';

import { mount as mountView, mountSketch } from './view';
import { exportDrawing, startRecording, stopRecording } from './core/sketchP5';
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

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Painter component.
 */
export async function mount(): Promise<void> {
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
export async function setup(): Promise<void> {
    hearEvent('menu.run', run);
    hearEvent('menu.reset', reset);

    hearEvent('menu.uploadFile', uploadFileInLocalStorage);
    hearEvent('menu.startRecording', startRecording);
    hearEvent('menu.stopRecording', stopRecording);
    hearEvent('menu.exportDrawing', exportDrawing);
    hearEvent('menu.loadProject', loadProject);
    hearEvent('menu.saveProject', saveProjectHTML);

    reset();
}
// -- public variables -----------------------------------------------------------------------------

export const injected: TInjectedPainter = {
    // @ts-ignore
    flags: undefined,
    // @ts-ignore
    i18n: undefined,
    // @ts-ignore
    assets: undefined,
};

export const elements: Record<string, IElementSpecification> = {
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
};
