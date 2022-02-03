import { getButtons, setup as setupView } from './view';

/**
 * Mounts the Menu component.
 */
export function mount(): void {
    setupView();
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

/**
 * Initializes the Menu component.
 */
export function setup(): void {
    const buttons = getButtons();
    buttons.run.addEventListener('click', () => window.dispatchEvent(new Event('runprogram')));
}
