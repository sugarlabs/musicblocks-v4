import { v4 as uuidv4 } from 'uuid';

// -- types ----------------------------------------------------------------------------------------

import { IArtboardManagerModel } from '@/@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * @class
 * Class representing the Model of the Artboard Manager component.
 */
export default class implements IArtboardManagerModel {
    public viewportDimensions: [number, number];
    private _artboardMap: { [key: string]: string };

    private _height: number;
    private _width: number;
    private _scale: number;

    constructor() {
        this.viewportDimensions = [0, 0];
        this._artboardMap = {};
        this._artboardMap[uuidv4()] = uuidv4();

        this._height = 300;
        this._width = 300;
        this._scale = 1.0;
    }

    public get artboardMap(): { [key: string]: string } {
        return this._artboardMap;
    }

    public addArtboard(): void {
        const spriteIDs = Object.entries(this._artboardMap).map(([_, v]) => v);

        let newArtboardID: string;
        do {
            newArtboardID = uuidv4();
        } while (newArtboardID in this._artboardMap);

        let newSpriteID: string;
        do {
            newSpriteID = uuidv4();
        } while (spriteIDs.includes(newSpriteID));

        this._artboardMap[newArtboardID] = newSpriteID;
    }

    public removeArtboard(id: string, parameter?: 'artboard' | 'sprite'): boolean {
        if (parameter === undefined || parameter === 'artboard') {
            if (id in this._artboardMap) {
                delete this._artboardMap[id];
                return true;
            } else {
                return false;
            }
        } else {
            const entries = Object.entries(this._artboardMap);
            const entry = entries.find(([_, spriteID]) => spriteID === id);
            if (entry) {
                delete this._artboardMap[entry[0]];
                return true;
            } else {
                return false;
            }
        }
    }

    // --------------------------------

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

    // /** add a new Artboard to the canvas */
    // addArtboard(artboard: IArtboardModel): IArtboardModel[] {
    //     this._artboardList.concat(artboard);
    //     return this._artboardList;
    // }

    // /** returns all artboards */
    // getArtboards(): IArtboardModel[] {
    //     return this._artboardList;
    // }
}
