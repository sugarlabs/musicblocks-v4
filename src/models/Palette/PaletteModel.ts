import { blockList, buttonList, category } from "../../dummyEngine";

export const paletteModel = {
    // Boolean to store whether to show the subcategory of the main 3 categories or not
    showSubCategory: false,
    // Show blocks of the respective subCategories
    showBlocks: false,
    // store the category selected
    selectedSubCategory: "",
    // store the block selected
    selectedBlock: "",
    category: category,
    subCategory: buttonList,
    blocks: blockList
};
