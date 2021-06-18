import { useState } from 'react';

// -- model component ------------------------------------------------------------------------------

import _MenuModel from '../../models/menu/Menu';
const MenuModel = new _MenuModel();

// -- view component -------------------------------------------------------------------------------

import MenuView from '../../views/menu/Menu';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Menu component.
 */
export default function (): JSX.Element {
    const [title, updateTitle] = useState('Menubar');
    setTimeout(() => updateTitle('Menu'), 2000);

    /*
     * Poor example but illustrates usage of model.
     * Say `toggleAutoHide` is fairly complex and impacts other intrinsic states, moving all the
     * complexity into the Model makes sense.
     */
    const [autoHide, setAutoHide] = useState(false);
    const toggleAutoHide = () => {
        MenuModel.toggleAutoHide();
        setAutoHide(MenuModel.autoHide);
    };

    return MenuView({ title, autoHide, toggleAutoHide });
}
