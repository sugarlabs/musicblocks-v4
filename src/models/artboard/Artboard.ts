// -- types ----------------------------------------------------------------------------------------

import { IArtboardModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtboardModel {
    /** Stores the value of the auto hide state. */
    private _lines: [number];
    private _arcs: [number];

    constructor() {
        this._lines = [0];
        this._arcs = [0];
    }

    /**
     * returns all the line parameters.
     */
    getLines(): [number] {
        return this._lines;
    }

    addLine(line: number): void {
        this._lines.concat(line);
    }

    /**
     * returns all the arcs parameters.
     */
    getArcs(): [number] {
        return this._arcs;
    }
}
