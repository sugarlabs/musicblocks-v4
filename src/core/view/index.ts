import type { TAsset } from '@/@types/core/assets';

// -- private functions ----------------------------------------------------------------------------

function _createToolbarItem(
    type: 'container' | 'button',
    position: 'cluster-a' | 'cluster-b',
): HTMLElement {
    const item = document.createElement(type === 'container' ? 'div' : 'button');
    document.getElementById(`toolbar-${position}`)!.appendChild(item);

    item.classList.add('toolbar-cluster-item');
    if (type === 'button') {
        item.classList.add('toolbar-cluster-item-btn');
    }

    return item;
}

function _createWorkspaceItem(): HTMLElement {
    const wrapper = document.createElement('div');
    document.getElementById('workspace')!.appendChild(wrapper);

    return wrapper;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Creates a new component in the UI framework.
 * @param params component parameters
 * @returns DOM element of the new component
 */
export function createItem(
    params:
        | {
              /** location to mount component */
              location: 'workspace';
          }
        | {
              /** location to mount component */
              location: 'toolbar';
              /** whether component is a toolbar container item or a toolbar button */
              type: 'container' | 'button';
              /** cluster (group of component items) */
              position: 'cluster-a' | 'cluster-b';
          },
): HTMLElement {
    if (params.location === 'toolbar') {
        return _createToolbarItem(params.type, params.position);
    } /* if (params.location === 'workspace') */ else {
        return _createWorkspaceItem();
    }
}

export { initView, setView, mountViewOverlay, unmountViewOverlay } from './components';
export { mountSplash, updateSplash, unmountSplash } from './components/splash';
export { setToolbarExtended, unsetToolbarExtended } from './components/toolbar';

// -------------------------------------------------------------------------------------------------

type TAssetIdentifierView = 'image.logo';

export const definition: {
    assets: TAssetIdentifierView[];
} = {
    assets: ['image.logo'],
};

export const injected: {
    assets: Record<TAssetIdentifierView, TAsset>;
} = {
    // @ts-ignore
    assets: undefined,
};
