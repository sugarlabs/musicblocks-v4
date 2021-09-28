// -- types ----------------------------------------------------------------------------------------

import { IArtboardManagerModel } from '@/@types/artboard';

import IArtboardModel from './Artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Menu component.
 */
export default class implements IArtboardManagerModel {
    private _height: number;
    private _width: number;
    private _scale: number;
    private _artboardList: IArtboardModel[];
    constructor() {
        this._height = 300;
        this._width = 300;
        this._scale = 1.0;
        this._artboardList = [];
    }
    /**
     * returns the height of the canvas.
     */
    getHeight(): number {
        return this._height;
    }

    /**
     * returns the height of the canvas.
     */
    getWidth(): number {
        return this._width;
    }

    /** returns the scale of the canvas. */
    getScale(): number {
        return this._scale;
    }

    /** zoom in , out based on value of scale. */
    doScale(scale: number): void {
        this._height = scale * this._height;
        this._width = scale * this._width;
    }

    /** add a new Artboard to the canvas */
    addArtboard(artboard: IArtboardModel): IArtboardModel[] {
        this._artboardList.concat(artboard);
        return this._artboardList;
    }

    /** returns all artboards */
    getArtboards(): IArtboardModel[] {
        return this._artboardList;
    }
}
