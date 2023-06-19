import type { TPropsMenu } from '#/@types/components/menu';

import { createItem } from '@sugarlabs/mb4-view';

import { renderComponent } from './components';
import { injected } from '..';

// -- private variables ----------------------------------------------------------------------------

let _props: TPropsMenu;
let _container: HTMLElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the DOM.
 */
export async function mount(): Promise<void> {
    _container = createItem({
        location: 'toolbar',
        type: 'container',
        position: 'cluster-b',
    });
    _container.id = 'menu';

    _props = {
        injected,
        states: { running: false },
        handlers: {},
    };

    await renderComponent(_container, { ..._props });
}

export async function updateState(state: keyof TPropsMenu['states'], value: boolean) {
    _props.states[state] = value;
    await renderComponent(_container, { ..._props });
}

export async function updateHandler(
    handler: keyof TPropsMenu['handlers'],
    callback: CallableFunction,
) {
    _props.handlers[handler] = callback;
    await renderComponent(_container, { ..._props });
}
