import type { IElementSpecification } from '@sugarlabs/mb4-module-engine.old';
import type { TInjectedPainter } from '#/@types/components/painter';

import { hearEvent } from '@sugarlabs/mb4-events';
import { loadProject, saveProjectHTML, uploadFileInLocalStorage } from '@sugarlabs/mb4-transport';

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
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementMoveForward,
    },
    'move-backward': {
        label: 'backward',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementMoveBackward,
    },
    'turn-left': {
        label: 'left',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementTurnLeft,
    },
    'turn-right': {
        label: 'right',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementTurnRight,
    },
    'set-xy': {
        label: 'set xy',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementSetXY,
    },
    'set-heading': {
        label: 'set heading',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementSetHeading,
    },
    'draw-arc': {
        label: 'draw arc',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Graphics',
        },
        prototype: ElementDrawArc,
    },
    'set-color': {
        label: 'set color',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementSetColor,
    },
    'set-thickness': {
        label: 'set thickness',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementSetThickness,
    },
    'pen-up': {
        label: 'pen up',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementPenUp,
    },
    'pen-down': {
        label: 'pen down',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementPenDown,
    },
    'set-background': {
        label: 'set background',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementSetBackground,
    },
    'clear': {
        label: 'clear',
        type: 'Statement',
        classification: {
            group: 'Art',
            category: 'Pen',
        },
        prototype: ElementClear,
    },
};
