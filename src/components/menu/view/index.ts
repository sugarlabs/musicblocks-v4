import { createItem } from '@/view';

import svgRun from './resources/run.svg';
import svgStop from './resources/stop.svg';
import svgReset from './resources/reset.svg';

import { setup as setupComponent } from './components';

// import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _menuBtnRun: HTMLButtonElement;
let _menuBtnStp: HTMLButtonElement;
let _menuBtnRst: HTMLButtonElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the DOM.
 */
export function setup(): void {
    const menu = createItem({
        location: 'toolbar',
        type: 'container',
        position: 'cluster-b',
    });
    menu.id = 'menu';

    setupComponent(menu, {
        svgs: {
            run: svgRun,
            stop: svgStop,
            reset: svgReset,
        },
        labels: {
            run: 'run',
            stop: 'stop',
            reset: 'reset',
        },
    }).then(({ btnRun, btnReset, btnStop }) => {
        [_menuBtnRun, _menuBtnStp, _menuBtnRst] = [btnRun, btnStop, btnReset];
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
        run: _menuBtnRun,
        stop: _menuBtnRst,
        reset: _menuBtnRst,
    };
}
