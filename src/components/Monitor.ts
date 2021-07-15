// -- types ----------------------------------------------------------------------------------------

import { IMonitor, IPalette, IMenu, IBlockSize } from '../@types/monitor';

// -- PaletteBlocks defination ---------------------------------------------------------------------
const blockList: { [button: string]: (string | { [button: string]: string[] })[] } = {};
const lowShelf1: { [button: string]: string[] } = {};
const lowShelf2: { [button: string]: string[] } = {};

lowShelf1.block1 = ['block1', 'block2', 'block3', 'block4', 'block5'];
lowShelf2.block2 = ['block11', 'block21', 'block31', 'block41', 'block51'];

blockList.rhythm = ['note', 'note value drum', 'silence', 'note value', lowShelf1, lowShelf2];
blockList.meter = [
    'beats per second',
    'master beats per second',
    'on every note do',
    'notes played',
    'beat count',
    lowShelf1,
    lowShelf2,
];

blockList.pitch = [
    'pitch',
    'pitch G4',
    'scalar step (+/-)',
    'pitch number',
    'hertz',
    'fourth',
    'fifth',
    'pitch in hertz',
    'pitch number',
    'scalar change in pitch',
    'change in pitch',
    lowShelf1,
    lowShelf2,
];

blockList.flow = ['repeat', 'forever', 'if then', 'if then else', 'backward', lowShelf1, lowShelf2];

blockList.graphics = [
    'forward',
    'back',
    'left',
    'right',
    'set xy',
    'set heading',
    'arc',
    'scroll xy',
    'x',
    'y',
    'heading',
    lowShelf1,
    lowShelf2,
];

// -- subcomponent definitions ---------------------------------------------------------------------

/**
 * Class representing the Palette subcomponent proxied by the Monitor component.
 */
class Palette implements IPalette {
    /**
     * Fetches the list of palette sections and returns it.
     *
     * @returns `Promise` instance corresponding to the list of palette sections.
     */
    getSections(): Promise<string[]> {
        // dummy logic
        const fetchPaletteSections = () => {
            return new Promise<string[]>((res) => setTimeout(() => res(['Music', 'Logic', 'Art'])));
        };
        return fetchPaletteSections();
    }

    /**
     * Fetches the list of paletteSubSection and returns it.
     *
     * @returns `Promise` instance corresponding to the subSection list of the selected palette.
     */
    getSubSection(index: number): Promise<string[]> {
        // dummy logic
        const fetchSubSections = (i: number) => {
            if (i === 0) {
                return new Promise<string[]>((res) =>
                    setTimeout(() =>
                        res([
                            'rhythm',
                            'meter',
                            'pitch',
                            'Intervals',
                            'Tone',
                            'Ornament',
                            'Volume',
                            'Drum',
                            'Widgets',
                        ]),
                    ),
                );
            } else if (i === 1) {
                return new Promise<string[]>((res) =>
                    setTimeout(() =>
                        res([
                            'flow',
                            'action',
                            'boxes',
                            'number',
                            'boolean',
                            'heap',
                            'dictionary',
                            'extras',
                            'program',
                            'myblocks',
                        ]),
                    ),
                );
            } else if (i === 2) {
                return new Promise<string[]>((res) =>
                    setTimeout(() => res(['graphics', 'pen', 'media', 'sensors', 'ensemble'])),
                );
            } else {
                return new Promise<string[]>((res) => setTimeout(() => res([])));
            }
        };

        return fetchSubSections(index);
    }

    /**
     * Fetches the list of blocksList according to their subSection and returns it.
     *
     * @returns `Promise` instance corresponding to the Blocklist of the selected subSection.
     */
    getBlockList(subSection: string): Promise<(string | { [button: string]: string[] })[]> {
        // dummy logic
        const fetchBlockList = (section: string) => {
            return new Promise<(string | { [button: string]: string[] })[]>((res) =>
                setTimeout(() => res(blockList[section])),
            );
        };
        return fetchBlockList(subSection);
    }
}

/**
 * Class representing the Menu subcomponent proxied by the Monitor component.
 */
class Menu implements IMenu {
    /**
     * Fetches the list of languages and returns it.
     *
     * @returns 'Promise' instance corresponding to the list of languages available.
     */
    getLanguages(): Promise<string[]> {
        const fetchLanguages = () => {
            return new Promise<string[]>((res) =>
                setTimeout(() => res(['English', 'português', '日本語', 'हिंदी', 'عربى'])),
            );
        };
        return fetchLanguages();
    }

    getBlockSizes(): Promise<IBlockSize[]> {
        const fetchBlockSizes = () => {
            return new Promise<IBlockSize[]>((res) =>
                setTimeout(() =>
                    res([
                        {
                            label: 'Small',
                            size: 1,
                        },
                        {
                            label: 'Normal',
                            size: 1.5,
                        },
                        {
                            label: 'Medium',
                            size: 2,
                        },
                        {
                            label: 'Large',
                            size: 3,
                        },
                        {
                            label: 'Very Large',
                            size: 4,
                        },
                    ]),
                ),
            );
        };
        return fetchBlockSizes();
    }

    /**
     * Updates the language state in the Context API
     *
     * @param language the language selected from the menu
     */
    changeLanguage = (language: string) => {
        language;
    };

    changeBlockSize = (blockSize: number) => {
        blockSize;
    };

    updateHorizontalScroll = (isEnabled: boolean) => {
        isEnabled;
    };

    updateTurtleWrap = (isWrapOn: boolean) => {
        isWrapOn;
    };
}

// -- component definition -------------------------------------------------------------------------

/**
 * Class representing the Monitor component.
 *
 * @description The Monitor component is the supervisor background component on the client side.
 */
class Monitor implements IMonitor {
    /** Instance of the Palette component. */
    private _palette: Palette;
    private _menu: Menu;

    constructor() {
        this._palette = new Palette();
        this._menu = new Menu();
    }

    /** Getter for the palette component. */
    get palette(): Palette {
        return this._palette;
    }

    get menu(): Menu {
        return this._menu;
    }

    registerSetLanguage(updateLanguage: (language: string) => void): void {
        this._menu.changeLanguage = updateLanguage;
    }

    registerUpdateScroll(updateHorizontalScroll: (isEnabled: boolean) => void): void {
        this._menu.updateHorizontalScroll = updateHorizontalScroll;
    }

    registerUpdateWrap(updateTurtleWrap: (isWrapOn: boolean) => void): void {
        this._menu.updateTurtleWrap = updateTurtleWrap;
    }

    registerSetBlockSize(changeBlockSize: (blockSize: number) => void): void {
        this._menu.changeBlockSize = changeBlockSize;
    }
}

// -- component instance ---------------------------------------------------------------------------

export default new Monitor();
