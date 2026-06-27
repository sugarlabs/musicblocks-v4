import type { TInjectedMenu } from '#/@types/components/menu';

import { emitEvent } from '@sugarlabs/mb4-events';
import { getCrumbs, run, registerContext, ScopeStack } from '@sugarlabs/mb4-module-engine.old';

import { mount as mountView, updateHandler, updateState } from './view';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Menu component.
 */
export async function mount(): Promise<void> {
    await mountView();
}

/**
 * Initializes the Menu component.
 */
export async function setup(): Promise<void> {
    registerContext('dummy', {});
    const scopeStack = new ScopeStack();

    await updateHandler('run', () => {
        const crumbs = getCrumbs();
        if (crumbs.length !== 0)
            run(getCrumbs()[0].nodeID, {
                context: scopeStack.getContext('dummy'),
                symbolTable: scopeStack.getSymbolTable(),
            });
        updateState('running', true);
        setTimeout(() => updateState('running', false));
        emitEvent('menu.run');
    });

    await updateHandler('stop', () => {
        updateState('running', false);
        emitEvent('menu.stop');
    });

    await updateHandler('reset', () => {
        updateState('running', false);
        emitEvent('menu.reset');
    });
}

// -- public variables -----------------------------------------------------------------------------

export const injected: TInjectedMenu = {
    // @ts-ignore
    flags: undefined,
    // @ts-ignore
    i18n: undefined,
    // @ts-ignore
    assets: undefined,
};
