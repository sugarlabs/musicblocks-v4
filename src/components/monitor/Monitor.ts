// -- types ----------------------------------------------------------------------------------------

import { IMonitor } from '../../@types/monitor';

// -- subcomponents --------------------------------------------------------------------------------

import Menu from './subcomponents/Menu';
import Palette from './subcomponents/Palette';
import ArtboardManager from './subcomponents/Artboard';

// -- component definition -------------------------------------------------------------------------

/**
 * Class representing the Monitor component.
 *
 * @description The Monitor component is the supervisor background component on the client side.
 */
export class Monitor implements IMonitor {
    private _menu: Menu;
    private _palette: Palette;
    private _artboardManager: ArtboardManager;

    constructor() {
        this._menu = new Menu(this);
        this._palette = new Palette(this);
        this._artboardManager = new ArtboardManager(this);
    }

    get menu(): Menu {
        return this._menu;
    }

    get palette(): Palette {
        return this._palette;
    }

    get artboardManager(): ArtboardManager {
        return this._artboardManager;
    }
}

// -- component instance ---------------------------------------------------------------------------

/**
 * Instance of Monitor class. This is meant to be shared all throughout (almost like a singleton).
 */
export default new Monitor();
