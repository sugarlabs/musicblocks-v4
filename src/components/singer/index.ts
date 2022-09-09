import { setup as setupComponent } from './singer';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Singer component.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        resolve();
    });
}

/**
 * Initializes the Singer component.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await setupComponent();

            resolve();
        })();
    });
}
