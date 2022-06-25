import { createItem } from '@/view';

import { setup as setupComponent } from './components';

// import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _btnLoadProject: HTMLInputElement;
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
                loadProject: 'Load Project',
                saveProject: 'Save project as HTML',
                run: 'run',
                stop: 'stop',
                reset: 'reset',
            },
        }).then(({ btnLoadProject, btnSaveProject, btnRun, btnReset, btnStop }) => {
            [_btnLoadProject, _btnSaveProject, _btnRun, _btnStop, _btnReset] = [
                btnLoadProject,
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
 * @returns DOM `loadProject`,`saveProject`,`run`, `stop`, and `reset` buttons
 */
export function getButtons(): {
    loadProject: HTMLInputElement;
    saveProject: HTMLButtonElement;
    run: HTMLButtonElement;
    stop: HTMLButtonElement;
    reset: HTMLButtonElement;
} {
    return {
        loadProject: _btnLoadProject,
        saveProject: _btnSaveProject,
        run: _btnRun,
        stop: _btnStop,
        reset: _btnReset,
    };
}

export { updateState } from './components';
