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
    public _id: number;
    public _x: number;
    public _y: number;
    public _zIndex: number;
    public _angle: number;

    constructor(id: number, x: number, y: number, angle: number) {
        this._lines = [0];
        this._arcs = [0];
        this._id = id;
        this._x = x;
        this._y = y;
        this._zIndex = id;
        this._angle = angle;
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
