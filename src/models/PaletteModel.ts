export default class PaletteModel {
    // The section shown when music block is first opened
    defaultSection: string;

    // different section palettes are divide, currently music, logic and art (fetched from engine)

    // List of buttons in each section (fetched from engine)

    constructor() {
        this.defaultSection = "music";
    }
}
