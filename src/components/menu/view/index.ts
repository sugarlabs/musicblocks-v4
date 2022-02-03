import { createItem } from '../../../view';

import './index.scss';

let _menuBtnRun: HTMLButtonElement;
let _menuBtnRst: HTMLButtonElement;

/**
 * Sets up the DOM.
 */
export function setup(): void {
    const menu = createItem({
        location: 'toolbar',
        type: 'container',
        position: 'cluster-a',
    });
    _menuBtnRun = document.createElement('button');
    menu.appendChild(_menuBtnRun);
    _menuBtnRst = document.createElement('button');
    menu.appendChild(_menuBtnRst);

    menu.id = 'menu';
    _menuBtnRun.innerText = 'RUN';
    _menuBtnRun.classList.add('menu-btn');
    _menuBtnRst.innerText = 'RST';
    _menuBtnRst.classList.add('menu-btn');
}

/**
 * @returns DOM `run` and `reset` button
 */
export function getButtons(): { run: HTMLButtonElement; reset: HTMLButtonElement } {
    return { run: _menuBtnRun, reset: _menuBtnRst };
}
