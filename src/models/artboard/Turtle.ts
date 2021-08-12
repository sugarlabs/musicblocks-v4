// -- types ----------------------------------------------------------------------------------------
import p5 from 'p5';
import { ITurtleModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements ITurtleModel {
    /** Stores the value for artBoard draw functions. */
    _id: number;
    _turtleX: number;
    _turtleY: number;
    _turtleAngle: number;
    _width: number;
    _height: number;
    _color: [number, number, number];

    /** Dragging parameters */
    _dragging = false; // Is the object being dragged?
    _rollover = false; // Is the mouse over the ellipse?
    _offsetX = 0;
    _offsetY = 0;

    constructor(id: number, x: number, y: number, angle: number) {
        this._id = id;
        this._turtleX = x;
        this._turtleY = y;
        this._turtleAngle = angle;
        this._width = 30;
        this._height = 60;
        this._color = [
            Math.floor(Math.random() * 255) + 1,
            Math.floor(Math.random() * 255) + 1,
            Math.floor(Math.random() * 255) + 1,
        ];
    }
    getColor(): [number, number, number] {
        return this._color;
    }
    display(sketch: p5): void {
        sketch.rect(0, 0, this._width, this._height);
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
    over(sketch: p5): void {
        if (
            sketch.mouseX > this._turtleX &&
            sketch.mouseX < this._turtleX + this._width &&
            sketch.mouseY > this._turtleY &&
            sketch.mouseY < this._turtleY + this._height
        ) {
            this._rollover = true;
        } else {
            this._rollover = false;
        }
    }
    update(sketch: p5): void {
        if (this._dragging) {
            this._turtleX = sketch.mouseX + this._offsetX;
            this._turtleY = sketch.mouseY + this._offsetY;
        }
    }
    show(sketch: p5): void {
        sketch.stroke(0);
        // Different fill based on state
        if (this._dragging) {
            sketch.fill(50);
        } else if (this._rollover) {
            sketch.fill(100);
        } else {
            sketch.fill(175, 200);
        }
        this.render(sketch);
    }
    pressed(sketch: p5): void {
        // Did I click on the rectangle?
        if (
            sketch.mouseX > this._turtleX &&
            sketch.mouseX < this._turtleX + this._width &&
            sketch.mouseY > this._turtleY &&
            sketch.mouseY < this._turtleY + this._height
        ) {
            this._dragging = true;
            // If so, keep track of relative location of click to corner of rectangle
            this._offsetX = this._turtleX - sketch.mouseX;
            this._offsetY = this._turtleY - sketch.mouseY;
        }
    }

    released(): void {
        // Quit dragging
        this._dragging = false;
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
