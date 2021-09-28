// -- types ----------------------------------------------------------------------------------------

import { IMonitor } from '../../@types/monitor';

// -- subcomponents --------------------------------------------------------------------------------

import Menu from './Menu';
import Palette from './Palette';
import { Artboard, ArtboardManager } from './Artboard';

/**
 * Class representing the Monitor component.
 *
 * @description The Monitor component is the supervisor background component on the client side.
 */
export class Monitor implements IMonitor {
    /** Instance of the Menu subcomponent. */
    private _menu: Menu;

    // -------------------------------------------------------------------------

    /** Instance of the Palette subcomponent. */
    private _palette: Palette;
    /** Instance of the Artboard subcomponent. */
    private _artboard: Artboard;
    private _manager: ArtboardManager;

    constructor() {
        this._menu = new Menu(this);
        this._palette = new Palette(this);

        this._artboard = new Artboard(this);
        this._manager = new ArtboardManager(this);
    }

    get menu(): Menu {
        return this._menu;
    }

    get palette(): Palette {
        return this._palette;
    }

    get artboard(): Artboard {
        return this._artboard;
    }

    get manager(): ArtboardManager {
        return this._manager;
    }

    // registerArtboardClean(clean: () => void): void {
    //     this._artboard.clean = clean;
    // }

    // registerRemoveArtboard(removeArtboard: (id: number) => void): void {
    //     this._manager.removeArtboard = removeArtboard;
    // }

    // registerPlayArtboard(playArtboard: (id: number) => void): void {
    //     this._manager.playArtboard = playArtboard;
    // }

    // registerStopArtboard(stopArtboard: (id: number) => void): void {
    //     this._manager.stopArtboard = stopArtboard;
    // }

    // registerAddArtboard(
    //     addArtboard: (id: number, x: number, y: number, angle: number) => void,
    // ): void {
    //     this._manager.addArtboard = addArtboard;
    // }
}

// -- component instance ---------------------------------------------------------------------------

/**
 * Instance of Monitor class. This is meant to be shared all throughout (almost like a singleton).
 */
export default new Monitor();
