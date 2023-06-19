import { createItem } from '@sugarlabs/mb4-view';
import { buildProgram } from '../core';

import { setStatus, setup as setupComponent } from './components';
import { setButtonImg, setup as setupButton } from './components/button';

// -- private variables ----------------------------------------------------------------------------

let _editor: HTMLDivElement;
let _editorToolbarBtn: HTMLElement;

// -- private functions ----------------------------------------------------------------------------

/**
 * Creates the DOM of the editor.
 */
function _createEditor(): Promise<void> {
    return new Promise((resolve) => {
        _editor = document.createElement('div');

        setupComponent(_editor).then(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            _editor.addEventListener('buildprogram', function (e: CustomEvent<string>) {
                buildProgram(e.detail).then((response) =>
                    setStatus(response ? 'Successfully Built' : 'Invalid Code'),
                );
            });

            resolve();
        });
    });
}

/**
 * Creates the DOM of the editor's toolbar button.
 */
function _createToolbarButton(): Promise<void> {
    return new Promise((resolve) => {
        _editorToolbarBtn = createItem({
            location: 'toolbar',
            type: 'button',
            position: 'cluster-a',
        });
        setupButton(_editorToolbarBtn);
        requestAnimationFrame(() => resolve());
    });
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the DOM elements.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await _createEditor();
            await _createToolbarButton();
            resolve();
        })();
    });
}

/**
 * Returns the individual DOM components.
 * @param element toolbar button or editor
 * @returns queried DOM component
 */
export function getElement(element: 'button' | 'editor'): HTMLElement {
    return element === 'button' ? _editorToolbarBtn : _editor;
}

/**
 * Sets the icon for the editor's toolbar button based on whether it is clicked or not.
 * @param state `clicked` or `unclicked`
 */
export function setButtonState(state: 'clicked' | 'unclicked'): void {
    setButtonImg(state === 'clicked' ? 'cross' : 'code');
}

export { setCode, setHelp, setStatus, resetStates } from './components';
