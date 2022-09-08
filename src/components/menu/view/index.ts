import { createItem } from '@/view';

import { setup as setupComponent } from './components';

// import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _btnSaveProject: HTMLButtonElement;
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
                saveProject: 'Save project as HTML',
                run: 'run',
                stop: 'stop',
                reset: 'reset',
            },
        }).then(({ btnSaveProject, btnRun, btnReset, btnStop }) => {
            [_btnSaveProject, _btnRun, _btnStop, _btnReset] = [
                btnSaveProject,
                btnRun,
                btnStop,
                btnReset,
            ];
            resolve();
        });
    });
}

/**
 * @returns DOM `run`, `stop`, and `reset` buttons
 */
export function getButtons(): {
    saveProject: HTMLButtonElement;
    run: HTMLButtonElement;
    stop: HTMLButtonElement;
    reset: HTMLButtonElement;
} {
    return {
        saveProject: _btnSaveProject,
        run: _btnRun,
        stop: _btnStop,
        reset: _btnReset,
    };
}

export { updateState } from './components';
