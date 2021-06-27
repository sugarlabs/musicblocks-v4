// -- types ----------------------------------------------------------------------------------------

import { IArtboardManagerModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtboardManagerModel {
    /** Stores the value of the auto hide state. */
    private _autoHide: boolean;

    constructor() {
        this._autoHide = false;
    }

    /**
     * `true` if auto hide is on else `false`.
     */
    get autoHide(): boolean {
        return this._autoHide;
    }

    /**
     * Toggles the value of `_autoHide`.
     */
    toggleAutoHide(): void {
        this._autoHide = !this._autoHide;
    }
}
