export type block = {
    category: string; // One of Value, Flow, Clamp etc
    type: string; // unique for every block type, ex - heading, number, rightpos, width, text, solfege etc
    title: string | null; // a title to be displayed in the block body
    helpString: string;
};
