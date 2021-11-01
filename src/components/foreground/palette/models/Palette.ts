// -- types ----------------------------------------------------------------------------------------

import { IPaletteModel, TBrickList } from '@/@types/palette';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IPaletteModel {
    private _sections: string[];
    private _subSections: { [key: string]: string[] };
    private _brickList: TBrickList;

    constructor() {
        this._sections = [];
        this._subSections = {};
        this._brickList = {};
    }

    get sections(): string[] {
        return this._sections;
    }

    set sections(sections: string[]) {
        this._sections = sections;
    }

    get subSections(): { [key: string]: string[] } {
        return this._subSections;
    }

    set subSections(subSections: { [key: string]: string[] }) {
        this._subSections = subSections;
    }

    get brickList(): TBrickList {
        return this._brickList;
    }

    set brickList(brickList: TBrickList) {
        this._brickList = brickList;
    }
}
