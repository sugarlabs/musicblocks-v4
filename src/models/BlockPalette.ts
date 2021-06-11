import { block } from "../types/Block";

export default class BlockPalette {
    // List of palette corresponding to each button will be fetched from engine

    // Stores whether the menu storing the blocks is shown or hidden
    menuHidden: boolean;
    // Store the name of the button clicked
    selectedButton: string | null;
    // The x & y coordinate of the block when dragged to the canvas
    setX!: number;
    setY!: number;

    constructor() {
        this.menuHidden = false;
        this.selectedButton = null;
    }
}
