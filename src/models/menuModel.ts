class MenuModel {

    // the language opted by the user
    language: string;

    // determines if the mode is beginner or advanced
    beginnerMode: boolean;

    // determines if the feature to save mouse artwork as SVG is enabled or not
    saveSVG: boolean;

    // determines if the feature to save mouse artwork as PNG is enabled or not
    savePNG: boolean;

    constructor(language: string, mode: boolean) {
        this.language = language;
        this.beginnerMode = mode;
        this.saveSVG = false;
        this.savePNG = false;
    }
}

export default MenuModel;
