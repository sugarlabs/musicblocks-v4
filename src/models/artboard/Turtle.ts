// -- types ----------------------------------------------------------------------------------------

import p5 from 'p5';
import { ITurtleModel } from '../../@types/artboard';
import { sketch } from './ArtBoardSketch';

// -- model component definition -------------------------------------------------------------------

/**
 * Class representing the Model of the Artboard component.
 */
export default class implements ITurtleModel {
    /** Stores the value of the auto hide state. */
    id: string;
    name: string;
    startBlock: string;
    x: number;
    y: number;
    running: boolean;
    media: [string];
    canvas: p5;

    constructor(id: string, name: string, startBlock: string) {
        this.id = id;
        this.name = name;
        this.startBlock = startBlock;
        this.x = 200;
        this.y = 300;
        this.running = false;
        this.media = [''];
        this.canvas = new sketch(p5);
    }
}
