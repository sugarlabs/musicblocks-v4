class MenuModel {

    // the language opted by the user
    language: string;

    // determines if the feature to save mouse artwork as SVG is enabled or not
    saveSVG: boolean;

    // determines if the feature to save mouse artwork as PNG is enabled or not
    savePNG: boolean;

    constructor(language: string) {
        this.language = language;
        this.saveSVG = false;
        this.savePNG = false;
    }
}

export default MenuModel;
