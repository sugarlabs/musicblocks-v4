// -- types ----------------------------------------------------------------------------------------

import { IMenuModel } from '../../../../@types/menu';
import { TAppLanguage } from '../../../../@types/config';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IMenuModel {
    private _playing: boolean;
    private _languages: { code: TAppLanguage; name: string }[];
    private _brickSizes: { value: number; label: string }[];

    constructor() {
        this._playing = false;
        this._languages = [];
        this._brickSizes = [];
    }

    get playing(): boolean {
        return this._playing;
    }

    set playing(playing: boolean) {
        this._playing = playing;
    }

    get languages(): { code: TAppLanguage; name: string }[] {
        return this._languages;
    }

    set languages(languages: { code: TAppLanguage; name: string }[]) {
        this._languages = languages;
    }

    get brickSizes(): { value: number; label: string }[] {
        return this._brickSizes;
    }

    set brickSizes(brickSizes: { value: number; label: string }[]) {
        this._brickSizes = brickSizes;
    }
}
