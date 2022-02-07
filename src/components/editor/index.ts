import { IComponentMenu } from '@/@types/components/menu';

import { getComponent } from '@/config';
import { setToolbarExtended, unsetToolbarExtended } from '@/view';

import { getElement, resetStatus, setButtonState, setup as setupView } from './view';
import { resetProgram } from './core';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the UI components.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await setupView();
            resolve();
        })();
    });
}

/**
 * Initializes the component.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        const menu = getComponent('menu');
        if (menu) {
            (menu as IComponentMenu).mountHook('reset', () => {
                resetStatus();
                resetProgram();
            });
        }

        const btn = getElement('button');

        let state: 'initial' | 'float' | 'pinned' = 'initial';

        const setState = (_state: 'initial' | 'float' | 'pinned') => {
            if (_state === 'initial') {
                unsetToolbarExtended();
            } else {
                const toolbarContent = setToolbarExtended('Editor', _state, {
                    pin: () => setState('pinned'),
                    unpin: () => setState('float'),
                });
                const editor = getElement('editor');
                toolbarContent.appendChild(editor);
            }
            state = _state;
        };

        btn.addEventListener('click', () => {
            if (state === 'initial') {
                setButtonState('clicked');
                setState('float');
            } else {
                setButtonState('unclicked');
                setState('initial');
            }
        });

        resolve();
    });
}
