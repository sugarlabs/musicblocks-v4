// -- types ----------------------------------------------------------------------------------------

import { IArtboardModel } from '../../@types/artboard';
import { ITurtleModel } from '../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtboardModel {
    /** Stores the value of the auto hide state. */
    public _id: number;
    public _turtle: ITurtleModel;

    constructor(id: number, turtle: ITurtleModel) {
        this._id = id;
        this._turtle = turtle;
    }

    /**
     * returns the turtle.
     */
    getTurtle(): ITurtleModel {
        return this._turtle;
    }
}
