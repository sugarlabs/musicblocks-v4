import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
    React.createElement(React.StrictMode, null, App()),
    document.getElementById('root'),
);

// -------------------------------------------------------------------------------------------------

function _createToolbarItem(
    type: 'container' | 'button',
    position: 'cluster-a' | 'cluster-b',
): HTMLElement {
    const item = document.createElement(type === 'container' ? 'div' : 'button');
    document.getElementById(`toolbar-${position}`)!.appendChild(item);

    item.classList.add('toolbar-cluster-item');
    if (type === 'button') {
        item.classList.add('ttolbar-cluster-item-btn');
    }

    return item;
}

function _createWorkspaceItem(): HTMLElement {
    const wrapper = document.createElement('div');
    document.getElementById('workspace')!.appendChild(wrapper);

    return wrapper;
}

export function createItem(
    params:
        | { location: 'workspace' }
        | {
              location: 'toolbar';
              type: 'container' | 'button';
              position: 'cluster-a' | 'cluster-b';
          },
): HTMLElement {
    if (params.location === 'toolbar') {
        return _createToolbarItem(params.type, params.position);
    } /* if (params.location === 'workspace') */ else {
        return _createWorkspaceItem();
    }
}
