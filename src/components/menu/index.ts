import { getCrumbs, run } from '@sugarlabs/musicblocks-v4-lib';

import { getButtons, setup as setupView } from './view';

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
            });

            resolve();
        });
    });
}

export function mountHook(name: 'run', callback: CallableFunction): void;
export function mountHook(name: 'reset', callback: CallableFunction): void;
/**
 * Mounts a callback associated with a special hook name.
 * @param name name of the hook
 * @param callback callback function to associate with the hook
 */
export function mountHook(name: string, callback: CallableFunction): void {
    const buttons = getButtons();

    if (name === 'run') {
        buttons.run.addEventListener('click', () => callback());
    } else if (name === 'reset') {
        buttons.reset.addEventListener('click', () => callback());
    }
}
