// -- types ----------------------------------------------------------------------------------------

import { TBrickList } from '../../../@types/palette';

// -- other components -----------------------------------------------------------------------------

import { MessageUtils } from '../MessageUtils';
import { Monitor } from '../Monitor';

// -- utilities ------------------------------------------------------------------------------------

import {
    collectBrickList,
    collectPaletteSections,
    collectPaletteSubSections,
} from '../../../utils/config';

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the Menu subcomponent proxied by the Monitor component.
 */
export default class Palette extends MessageUtils {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {
            fetchSections: this._fetchSections,
            fetchSubSections: this._fetchSubSections,
            fetchBrickList: this._fetchBrickList,
        };
    }

    // -- Getters for values to present ----------------------------------------

    /** Returns a Promise for the list of palette sections. */
    private _fetchSections(): Promise<string[]> {
        return collectPaletteSections();
    }

    /** Returns a Promise for the list of palette sub-sections. */
    private _fetchSubSections(): Promise<{ [key: string]: string[] }> {
        return collectPaletteSubSections();
    }

    private _fetchBrickList(): Promise<TBrickList> {
        return collectBrickList();
    }
}
