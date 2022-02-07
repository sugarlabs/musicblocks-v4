import { createItem } from '@/view';
import { buildProgram } from '../core';

import { setup as setupComponent } from './components';
import { setButtonImg, setup as setupButton } from './components/button';

// -- private variables ----------------------------------------------------------------------------

let _editor: HTMLDivElement;
let _editorToolbarBtn: HTMLElement;

let _editorStatus: HTMLParagraphElement;

// -- private functions ----------------------------------------------------------------------------

/**
 * Creates the DOM of the editor.
 */
function _createEditor(): Promise<void> {
    return new Promise((resolve) => {
        _editor = document.createElement('div');
        _editor.id = 'editor';

        setupComponent(_editor).then(({ codeBox, status, btnBuild }) => {
            _editorStatus = status;

            codeBox.addEventListener('input', () => {
                _editorStatus.innerHTML = '';
            });

            codeBox.innerHTML = `set-thickness value:4
set-color value:5
repeat times:6
  move-forward steps:100
  turn-right angle:60
set-color value:9
repeat times:6
  move-forward steps:100
  turn-left angle:60`;

            codeBox.innerHTML = `set-thickness value:4
set-color value:5
move-forward steps:100
turn-right angle:60
move-forward steps:100
turn-right angle:60
move-forward steps:100
turn-right angle:60
move-forward steps:100
turn-right angle:60`;

            btnBuild.addEventListener('click', () => {
                (async () => {
                    const response = await buildProgram(codeBox.value);
                    _editorStatus.innerHTML = response ? 'Successfully Built' : 'Invalid Code';
                })();
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

/**
 * Resets the editor status.
 */
export function resetStatus(): void {
    _editorStatus.innerHTML = '';
}
