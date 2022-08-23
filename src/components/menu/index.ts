import { getCrumbs, run } from '@sugarlabs/musicblocks-v4-lib';

import { getButtons, setup as setupView, updateState } from './view';

// -- public functions -----------------------------------------------------------------------------

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
            });
            buttons.stop.addEventListener('click', () => {
                updateState('running', false);
            });
            buttons.reset.addEventListener('click', () => {
                updateState('running', false);
            });

            resolve();
        });
    });
}

export function mountHook(name: 'startRecording', callback: CallableFunction): void;
export function mountHook(name: 'stopRecording', callback: CallableFunction): void;
export function mountHook(name: 'exportDrawing', callback: CallableFunction): void;
export function mountHook(name: 'loadProject', callback: CallableFunction): void;
export function mountHook(name: 'saveProject', callback: CallableFunction): void;
export function mountHook(name: 'run', callback: CallableFunction): void;
export function mountHook(name: 'reset', callback: CallableFunction): void;

/**
 * Mounts a callback associated with a special hook name.
 * @param name name of the hook
 * @param callback callback function to associate with the hook
 */
export function mountHook(name: string, callback: CallableFunction): void {
    const buttons = getButtons();
    if (name == 'startRecording') {
        buttons.startRecording.addEventListener('click', () => callback());
    } else if (name == 'stopRecording') {
        buttons.stopRecording.addEventListener('click', () => callback());
    } else if (name == 'exportDrawing') {
        buttons.exportDrawing.addEventListener('click', () => callback());
    } else if (name == 'loadProject') {
        buttons.loadProject.addEventListener('change', (event) => callback(event));
    } else if (name == 'saveProject') {
        buttons.saveProject.addEventListener('click', () => callback());
    } else if (name === 'run') {
        buttons.run.addEventListener('click', () => callback());
    } else if (name === 'reset') {
        buttons.reset.addEventListener('click', () => callback());
    }
}
