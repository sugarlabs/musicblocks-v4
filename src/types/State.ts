export type State = {
    showSubCategory: boolean;
    showBlocks: boolean;
    selectedSubCategory: string;
    selectedBlock: string;
    category: string[];
    subCategory: string[][];
    blocks: { [button: string]: string[] };
};
export type Action =
    | { type: "hideSubCategory" }
    | { type: "removeBlocks" }
    | { type: "showSubCategory"; payload: string }
    | { type: "openSubCategory"; payload: string };
