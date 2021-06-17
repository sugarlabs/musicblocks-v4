import {canvas} from "./../../types/Canvas";

export class DrawCanvas {
	// create a canvas 
	public height: number;
	public width: number;

	constructor(
		{height, width}:canvas = {
			height: 0, width: 0
		}) {
        this.height = height;
        this.width = width;
    }
}
