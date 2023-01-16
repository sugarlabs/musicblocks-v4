import { IComponentDefinition } from '@/@types/components';
import { IComponentMenu } from '@/@types/components/menu';

import { getComponent } from '@/core/config';
import { setToolbarExtended, unsetToolbarExtended } from '@/view';

import {
    getElement,
    resetStates,
    setButtonState,
    setCode,
    setHelp,
    setStatus,
    setup as setupView,
} from './view';
import { generateAPI, resetProgram } from './core';

// == definition ===================================================================================

export const strings: { [key: string]: string } = {
    build: 'build button - build the program',
    help: 'help button - show syntax information',
};

export const definition: IComponentDefinition = {
    dependencies: {
        optional: ['menu'],
        required: [],
    },
    flags: {},
    strings,
};

// == public functions =============================================================================

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
                setStatus('');
                resetProgram();
            });
        }

        setCode(`- clear

# -------------
# first hexagon
# -------------

- set-thickness: 4
- set-color: 5
- repeat:
    times:
      operator-math-plus:
        operand1: 4
        operand2: 2
    scope:
      - move-forward: 100
      - turn-right: 60

# --------------
# second hexagon
# --------------

- set-color: 9
- repeat:
    times: 6
    scope:
      - move-forward: 100
      - turn-left: 60`);

        setCode(`- box-number:
    name: "a"
    value: 0
- box-number:
    name: "b"
    value: 1
- box-number:
    name: "c"
    value: 0
- set-thickness:
    value:
      4
- repeat:
    times: 10
    scope:
      - print:
          boxidentifier-number: "a"
      - set-color:
          boxidentifier-number: "b"
      - repeat:
          times: 6
          scope:
            - move-forward:
                operator-math-times:
                  operand1:
                    boxidentifier-number: "a"
                  operand2: 8
            - turn-left: 90
      - box-number:
          name: "c"
          value:
            operator-math-plus:
              operand1:
                boxidentifier-number: "a"
              operand2:
                boxidentifier-number: "b"
      - box-number:
          name: "a"
          value:
            boxidentifier-number: "b"
      - box-number:
          name: "b"
          value:
            boxidentifier-number: "c"`);

        setHelp(generateAPI());

        const btn = getElement('button');

        let state: 'initial' | 'float' | 'pinned' = 'initial';

        const setState = (_state: 'initial' | 'float' | 'pinned') => {
            if (_state === 'initial') {
                unsetToolbarExtended();
                resetStates();
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
