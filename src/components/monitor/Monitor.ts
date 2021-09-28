// -- types ----------------------------------------------------------------------------------------

import { IMonitor, IArtboardManager, IArtboard } from '../../@types/monitor';

// -- subcomponents --------------------------------------------------------------------------------

import Menu from './Menu';
import Palette from './Palette';

/**
 * Class representing the Artboard subcomponent proxied by the Monitor component.
 */
class Artboard implements IArtboard {
    clean = () => {
        // clean the artwork on the artboard
    };
}

/**
 * Class representing the Manager subcomponent proxied by the Monitor component.
 */
class ArtboardManager implements IArtboardManager {
    /** enable horizontal scrolling in the artboards*/
    enableHorizontalScroll = (isEnabled: boolean) => {
        isEnabled;
    };

    enableTurtleWrap = (isWrapOn: boolean) => {
        isWrapOn;
    };

    playArtboard = (id: number) => {
        id;
    };

    stopArtboard = (id: number) => {
        id;
    };

    removeArtboard = (id: number) => {
        id;
    };

    addArtboard = (id: number, x: number, y: number, angle: number) => {
        [id, x, y, angle];
    };
}

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

        this._artboard = new Artboard();
        this._manager = new ArtboardManager();
    }

    /** Getter for the palette subcomponent. */
    get palette(): Palette {
        return this._palette;
    }

    /** Getter for the menu subcomponent. */
    get menu(): Menu {
        return this._menu;
    }

    /** Getter for the artboard subcomponent. */
    get artboard(): Artboard {
        return this._artboard;
    }

    get manager(): ArtboardManager {
        return this._manager;
    }

    registerArtboardClean(clean: () => void): void {
        this._artboard.clean = clean;
    }

    registerRemoveArtboard(removeArtboard: (id: number) => void): void {
        this._manager.removeArtboard = removeArtboard;
    }

    registerPlayArtboard(playArtboard: (id: number) => void): void {
        this._manager.playArtboard = playArtboard;
    }

    registerStopArtboard(stopArtboard: (id: number) => void): void {
        this._manager.stopArtboard = stopArtboard;
    }

    registerAddArtboard(
        addArtboard: (id: number, x: number, y: number, angle: number) => void,
    ): void {
        this._manager.addArtboard = addArtboard;
    }
}

// -- component instance ---------------------------------------------------------------------------

/**
 * Instance of Monitor class. This is meant to be shared all throughout (almost like a singleton).
 */
export default new Monitor();
