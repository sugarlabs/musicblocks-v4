// -- types ----------------------------------------------------------------------------------------
import p5 from 'p5';
import { ITurtleModel } from '../../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

export default class implements ITurtleModel {
    /** Stores the value for artBoard draw functions. */
    _id: number;
    _turtleX: number;
    _turtleY: number;
    _turtleAngle: number;
    _width: number;
    _height: number;
    _active: boolean;
    _color: [number, number, number];
    _svg!: p5.Image | p5.Element;
    _isMoving: boolean;

    constructor(id: number, x: number, y: number, angle: number) {
        this._id = id;
        this._turtleX = x;
        this._turtleY = y;
        this._turtleAngle = angle;
        this._width = 60;
        this._height = 30;
        this._isMoving = false;
        this._active = false;
        this._color = [
            Math.floor(Math.random() * 255) + 1,
            Math.floor(Math.random() * 255) + 1,
            Math.floor(Math.random() * 255) + 1,
        ];
    }
    getColor(): [number, number, number] {
        return this._color;
    }
    callSVG(sketch: p5): void {
        this._svg = sketch.loadImage(
            'https://github.com/sugarlabs/musicblocks/blob/master/images/mouse.svg',
        );
        sketch.imageMode(sketch.CENTER);
    }
    display(sketch: p5): void {
        // helps in creating custom shapes
        sketch.beginShape();
        sketch.translate(-this._width / 2, 0);
        sketch.vertex(0, 0);
        sketch.vertex(0, this._height);
        sketch.vertex(this._width, this._height);
        sketch.vertex(this._width, 0);
        sketch.vertex(this._width / 2, -this._height);
        sketch.vertex(0, 0);
        sketch.endShape(sketch.CLOSE);
        // sketch.image(this._svg, 0, 0, this._width, this._height);
    }

    move(sketch: p5): void {
        sketch.translate(this._turtleX, this._turtleY);
        sketch.rotate(90 - this._turtleAngle);
    }

    render(sketch: p5): void {
        // push pop is used to keep the state of the turtle different (when we translate the turtle)
        sketch.push();
        sketch.fill(sketch.color(this._color[0], this._color[1], this._color[2]));
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
    setIsMoving(isMoving: boolean): void {
        this._isMoving = isMoving;
    }
    getIsMoving(): boolean {
        return this._isMoving;
    }
}
