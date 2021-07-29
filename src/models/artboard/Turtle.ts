// -- types ----------------------------------------------------------------------------------------
import p5 from 'p5';
import { ITurtleModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements ITurtleModel {
    /** Stores the value for artBoard draw functions. */
    private _id: number;
    private _turtleX: number;
    private _turtleY: number;
    private _turtleAngle: number;

    constructor(id: number, x: number, y: number, angle: number) {
        this._id = id;
        this._turtleX = x;
        this._turtleY = y;
        this._turtleAngle = angle;
    }
    display(sketch: p5): void {
        sketch.rect(0, 0, 30, 60);
    }

    move(sketch: p5): void {
        sketch.translate(this._turtleX, this._turtleY);
        sketch.rotate(90 - this._turtleAngle);
    }

    render(sketch: p5): void {
        sketch.push();
        this.move(sketch);
        this.display(sketch);
        sketch.pop();
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
