import React from 'react';
import ReactDOM from 'react-dom';

// -- components -----------------------------------------------------------------------------------

import Toolbars from './toolbars/ViewModel';

// -- stylesheet -----------------------------------------------------------------------------------

import './main.scss';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts child components inside a root element.
 */
export function mountDOM() {
    ReactDOM.render(
        React.createElement(React.StrictMode, null, Toolbars()),
        document.getElementById('app'),
    );
}
