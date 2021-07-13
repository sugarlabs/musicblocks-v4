// -- types ----------------------------------------------------------------------------------------

import { IArtBoardDrawModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtBoardDrawModel {
    /** Stores the value for artBoard draw functions. */
    private _strokeWeight: number;
    private _strokeColor: [number, number, number];

    constructor() {
        this._strokeWeight = 10;
        this._strokeColor = [254, 30, 21];
    }
    setStrokeWeight(x: number): void {
        this._strokeWeight = x;
    }
    setStrokeColor(red: number, blue: number, green: number): void {
        this._strokeColor[0] = red;
        this._strokeColor[1] = blue;
        this._strokeColor[2] = green;
    }

    getStrokeWeight(): number {
        return this._strokeWeight;
    }
    getStokeColor(): [number, number, number] {
        return this._strokeColor;
    }
}
