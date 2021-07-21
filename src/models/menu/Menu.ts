// -- types ----------------------------------------------------------------------------------------

import { IMenuModel } from '../../@types/menu';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IMenuModel {
    /** Stores the value of the auto hide state. */
    private _autoHide: boolean;
    private _autoHideTemp: boolean;
    private _playMenuVisible: boolean;
    private _settingsMenuVisible: boolean;
    private _projectMenuVisible: boolean;
    private _languageMenuVisible: boolean;
    private _blockSizeMenuVisible: boolean;

    constructor() {
        this._autoHide = true;
        this._autoHideTemp = true;
        this._playMenuVisible = false;
        this._settingsMenuVisible = false;
        this._projectMenuVisible = false;
        this._languageMenuVisible = false;
        this._blockSizeMenuVisible = false;
    }

    /**
     * `true` if auto hide is on else `false`.
     */
    get autoHide(): boolean {
        return this._autoHide;
    }

    get autoHideTemp(): boolean {
        return this._autoHideTemp;
    }

    get playMenuVisible(): boolean {
        return this._playMenuVisible;
    }

    get settingsMenuVisible(): boolean {
        return this._settingsMenuVisible;
    }

    get projectMenuVisible(): boolean {
        return this._projectMenuVisible;
    }

    get languageMenuVisible(): boolean {
        return this._languageMenuVisible;
    }

    get blockSizeMenuVisible(): boolean {
        return this._blockSizeMenuVisible;
    }

    /**
     * Toggles the value of `_autoHide`.
     */
    toggleAutoHide(): void {
        this._autoHide = !this._autoHide;
    }

    /**
     * Toggles the value of `_autoHideTemp`.
     */
    toggleAutoHideTemp(): void {
        this._autoHideTemp = !this._autoHideTemp;
    }

    /**
     * Toggles the value of `_playMenuVisible`.
     */
    togglePlayMenu(): void {
        this._playMenuVisible = !this._playMenuVisible;
    }

    /**
     * Toggles the value of `_settingsMenuVisible`.
     */
    toggleSettingsMenu(): void {
        this._settingsMenuVisible = !this._settingsMenuVisible;
    }

    /**
     * Toggles the value of `_projectMenuVisible`.
     */
    toggleProjectMenu(): void {
        this._projectMenuVisible = !this._projectMenuVisible;
    }

    /**
     * Toggles the value of `_languageMenuVisible`.
     */
    toggleLanguageMenu(): void {
        this._languageMenuVisible = !this._languageMenuVisible;
    }

    /**
     * Toggles the value of `_blockSizeMenuVisible`.
     */
    toggleBlockSizeMenu(): void {
        this._blockSizeMenuVisible = !this._blockSizeMenuVisible;
    }
}
