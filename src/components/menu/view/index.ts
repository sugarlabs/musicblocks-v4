import { createItem } from '@/view';

import { setup as setupComponent } from './components';

// import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _btnRun: HTMLButtonElement;
let _btnStop: HTMLButtonElement;
let _btnReset: HTMLButtonElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the DOM.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        const menu = createItem({
            location: 'toolbar',
            type: 'container',
            position: 'cluster-b',
        });
        menu.id = 'menu';

        setupComponent(menu, {
            labels: {
                run: 'run',
                stop: 'stop',
                reset: 'reset',
            },
        }).then(({ btnRun, btnReset, btnStop }) => {
            [_btnRun, _btnStop, _btnReset] = [btnRun, btnStop, btnReset];
            resolve();
        });
    });
}

/**
 * @returns DOM `run`, `stop`, and `reset` buttons
 */
export function getButtons(): {
    run: HTMLButtonElement;
    stop: HTMLButtonElement;
    reset: HTMLButtonElement;
} {
    return {
        run: _btnRun,
        stop: _btnStop,
        reset: _btnReset,
    };
}

export { updateState } from './components';
