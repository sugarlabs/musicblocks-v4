import './components';

import { createToolbarItem } from './components/toolbar';

// -- private functions ----------------------------------------------------------------------------

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
        return createToolbarItem(params.type, params.position);
    } /* if (params.location === 'workspace') */ else {
        return _createWorkspaceItem();
    }
}

export { setToolbarExtended, unsetToolbarExtended } from './components/toolbar';
