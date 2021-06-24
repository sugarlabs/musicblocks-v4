// -- types ----------------------------------------------------------------------------------------

import { IMonitor, IPalette, IMenu } from '../@types/monitor';

// -- subcomponent definitions ---------------------------------------------------------------------

/**
 * Class representing the Palette subcomponent proxied by the Monitor component.
 */
class Palette implements IPalette {
    /**
     * Fetches the list of palette sections and returns it.
     *
     * @returns `Promise` instance corresponding to the list of palette sections.
     */
    getSections(): Promise<string[]> {
        // dummy logic
        const fetchPaletteSections = () => {
            return new Promise<string[]>((res) => setTimeout(() => res(['Music', 'Logic', 'Art'])));
        };
        return fetchPaletteSections();
    }
}

/**
 * Class representing the Menu subcomponent proxied by the Monitor component.
 */
class Menu implements IMenu {
    /**
     * Fetches the list of palette sections and returns it.
     *
     * @returns 'Promise' instance corresponding to the list of languages available.
     */
    getLanguages(): Promise<string[]> {
        const fetchLanguages = () => {
            return new Promise<string[]>((res) =>
                setTimeout(() => res(['English', 'português', '日本語', 'हिंदी', 'عربى'])),
            );
        };
        return fetchLanguages();
    }
}

// -- component definition -------------------------------------------------------------------------

/**
 * Class representing the Monitor component.
 *
 * @description The Monitor component is the supervisor background component on the client side.
 */
class Monitor implements IMonitor {
    /** Instance of the Palette component. */
    private _palette: Palette;
    private _menu: Menu;

    constructor() {
        this._palette = new Palette();
        this._menu = new Menu();
    }

    /** Getter for the palette component. */
    get palette(): Palette {
        return this._palette;
    }

    get menu(): Menu {
        return this._menu;
    }
}

// -- component instance ---------------------------------------------------------------------------

export default new Monitor();
