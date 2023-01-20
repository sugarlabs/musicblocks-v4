import type { IComponentDefinition } from '@/@types/components';
import type { TInjectedMenu } from '@/@types/components/menu';

import { getCrumbs, run } from '@sugarlabs/musicblocks-v4-lib';
import { emitEvent } from '@/core/events';

import { getButtons, setup as setupView, updateState } from './view';

// == definition ===================================================================================

export const definition: IComponentDefinition = {
    dependencies: {
        optional: [],
        required: [],
    },
    flags: {
        uploadFile: 'boolean',
        recording: 'boolean',
        exportDrawing: 'boolean',
        loadProject: 'boolean',
        saveProject: 'boolean',
    },
    strings: {
        'menu.run': 'run button - to start the program execution',
        'menu.stop': 'stop button - to stop the program execution',
        'menu.reset': 'reset button - clear program states',
    },
    assets: [
        'image.icon.run',
        'image.icon.stop',
        'image.icon.reset',
        'image.icon.saveProjectHTML',
        'image.icon.exportDrawing',
        'image.icon.startRecording',
        'image.icon.stopRecording',
    ],
};

export const injected: TInjectedMenu = {
    // @ts-ignore
    flags: undefined,
    // @ts-ignore
    i18n: undefined,
    // @ts-ignore
    assets: undefined,
};

// == public functions =============================================================================

/**
 * Mounts the Menu component.
 */
export function mount(): Promise<void> {
    return setupView();
}

/**
 * Initializes the Menu component.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            const buttons = getButtons();
            buttons.run.addEventListener('click', () => {
                const crumbs = getCrumbs();
                if (crumbs.length !== 0) run(getCrumbs()[0].nodeID);
                updateState('running', true);
                setTimeout(() => updateState('running', false));
                emitEvent('menu.run');
            });
            buttons.stop.addEventListener('click', () => {
                updateState('running', false);
                emitEvent('menu.stop');
            });
            buttons.reset.addEventListener('click', () => {
                updateState('running', false);
                emitEvent('menu.reset');
            });

            resolve();
        });
    });
}
