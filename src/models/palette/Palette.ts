// -- types ----------------------------------------------------------------------------------------

import { IPaletteModel } from '../../@types/palette';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IPaletteModel {
    /** Stores the value of the selected Section. */
    private _selectedSection: number;
    /** Stores whether to show the subSection or not */
    private _hideSubSection: boolean;

    constructor() {
        this._selectedSection = 0;
        this._hideSubSection = true;
    }

    /**
     * return index of selected Section
     */
    get selectedSection(): number {
        return this._selectedSection;
    }

    /**
     * `true` is the sub section is hidden
     */
    get hideSubSection(): boolean {
        return this._hideSubSection;
    }

    /**
     * Change the value of selected section`.
     */
    changeSelectedSection(index: number): void {
        this._selectedSection = index;
    }

    /**
     * toggle the value of `_higheSubSection`.
     */
    toggleHideSubSection(flag: boolean): void {
        this._hideSubSection = flag;
    }
}
