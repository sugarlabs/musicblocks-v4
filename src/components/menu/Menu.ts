import { useState } from 'react';

// -- view component -------------------------------------------------------------------------------

import Menu from '../../views/menu/Menu';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Menu component.
 */
export default function (): JSX.Element {
    const [title, updateTitle] = useState('Menu');
    setTimeout(() => updateTitle('Menubar'), 2000);

    return Menu({ title });
}
