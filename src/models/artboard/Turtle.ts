// -- types ----------------------------------------------------------------------------------------
import { ITurtleModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
class Turtle implements ITurtleModel {
    /** Stores the value for artBoard draw functions. */
    private _turtleX: number;
    private _turtleY: number;
    private _turtleAngle: number;

    constructor() {
        this._turtleX = 500;
        this._turtleY = 500;
        this._turtleAngle = 0;
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
    getTurtleAngle(): number {
        return this._turtleAngle;
    }
    setTurleAngle(angle: number): void {
        this._turtleAngle = angle;
    }
}
export const turtle = new Turtle();
