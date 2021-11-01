// -- types ----------------------------------------------------------------------------------------

import { IArtboardModel, TArtboardSpritePosition } from '@/@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * @class
 * Class representing the Model of the Artboard sub-component.
 */
export default class implements IArtboardModel {
    private _artboardID: string;
    private _spriteID: string;

    public position: TArtboardSpritePosition;
    public heading: number;

    constructor(
        artboardID: string,
        spriteID: string,
        position: TArtboardSpritePosition,
        heading: number,
    ) {
        this._artboardID = artboardID;
        this._spriteID = spriteID;
        this.position = position;
        this.heading = heading;
    }

    public get artboardID(): string {
        return this._artboardID;
    }

    public get spriteID(): string {
        return this._spriteID;
    }
}
