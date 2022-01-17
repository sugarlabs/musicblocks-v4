// -- types ----------------------------------------------------------------------------------------

import {
    IArtboardSpriteModel,
    TArtboardSpriteColor,
    TArtboardSpritePosition,
} from '../../../../@types/artboard';

// -- model component definition -------------------------------------------------------------------

/**
 * @class
 * Class representing the Model of the Artboard Sprite sub-component.
 */
export default class ArtboardSpriteModel implements IArtboardSpriteModel {
    private _spriteID: string;
    private _artboardID: string;

    public position: TArtboardSpritePosition;
    public heading: number;
    public color: TArtboardSpriteColor;

    constructor(
        spriteID: string,
        artboardID: string,
        position: TArtboardSpritePosition,
        heading: number,
        color: TArtboardSpriteColor,
    ) {
        this._spriteID = spriteID;
        this._artboardID = artboardID;
        this.position = position;
        this.heading = heading;
        this.color = color;
    }

    public get spriteID(): string {
        return this._spriteID;
    }

    public get artboardID(): string {
        return this._artboardID;
    }
}
