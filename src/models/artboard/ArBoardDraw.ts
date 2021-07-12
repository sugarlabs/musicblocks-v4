// -- types ----------------------------------------------------------------------------------------

import { IArtBoardDrawModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtBoardDrawModel {
    /** Stores the value for artBoard draw functions. */
    private _strokeWeight: number;
    private _strokeColor: number;
    private _turtleX: number;
    private _turtleY: number;

    constructor() {
        this._strokeWeight = 10;
        this._strokeColor = 0;
        this._turtleX = 500;
        this._turtleY = 500;
    }
    getStrokeWeight(): number {
        return this._strokeWeight;
    }
    getStokeColor(): number {
        return this._strokeColor;
    }
    getTurtleX(): number {
        return this._turtleX;
    }
    setTurtleX(x: number): void {
        this._turtleX = x;
    }
    getTurtleY(): number {
        return this._turtleY;
    }
    setTurtleY(y: number): void {
        this._turtleY = y;
    }
}
