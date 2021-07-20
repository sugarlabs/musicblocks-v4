// -- types ----------------------------------------------------------------------------------------
import p5 from 'p5';
import { ITurtleModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements ITurtleModel {
    /** Stores the value of the auto hide state. */
    private _dragging: boolean;
    private _rollover: boolean;
    private _x: number;
    private _y: number;
    private _id: number;
    private _w: number;
    private _h: number;
    private _offsetX: number;
    private _offsetY: number;
    private _p: p5;

    constructor(id: number, x: number, y: number, w: number, h: number, p: p5) {
        this._dragging = false;
        this._rollover = false;
        this._x = x;
        this._y = y;
        this._id = id;
        this._w = w;
        this._h = h;
        this._offsetX = 0;
        this._offsetY = 0;
        this._p = p;
    }

    over(): void {
        // Is mouse over object
        if (
            this._p.mouseX > this._x &&
            this._p.mouseX < this._x + this._w &&
            this._p.mouseY > this._y &&
            this._p.mouseY < this._y + this._h
        ) {
            this._rollover = true;
        } else {
            this._rollover = false;
        }
    }
    update(): void {
        // Adjust location if being dragged
        if (this._dragging) {
            this._x = this._p.mouseX + this._offsetX;
            this._y = this._p.mouseY + this._offsetY;
        }
    }
    show(): void {
        this._p.stroke(10);
        // Different fill based on state
        if (this._dragging) {
            this._p.fill(50);
        } else if (this._rollover) {
            this._p.fill(100);
        } else {
            this._p.fill(175, 200);
        }
        this._p.rect(this._x, this._y, this._w, this._h);
    }
    pressed(): void {
        // Did I click on the rectangle?
        if (
            this._p.mouseX > this._x &&
            this._p.mouseX < this._x + this._w &&
            this._p.mouseY > this._y &&
            this._p.mouseY < this._y + this._h
        ) {
            this._dragging = true;
            // If so, keep track of relative location of click to corner of rectangle
            this._offsetX = this._x - this._p.mouseX;
            this._offsetY = this._y - this._p.mouseY;
        }
    }
    released(): void {
        // Quit dragging
        this._dragging = false;
    }
}
