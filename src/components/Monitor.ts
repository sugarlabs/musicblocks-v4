// -- types ----------------------------------------------------------------------------------------

import { IMonitor, IPalette } from '../@types/monitor';

// -- PaletteBlocks defination ---------------------------------------------------------------------
const blockList: { [button: string]: string[] } = {};
blockList.rhythm = ['note', 'note value drum', 'silence', 'note value'];
blockList.meter = [
    'beats per second',
    'master beats per second',
    'on every note do',
    'notes played',
    'beat count',
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
];

blockList.flow = ['repeat', 'forever', 'if then', 'if then else', 'backward'];

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
    getBlockList(subSection: string): Promise<string[]> {
        // dummy logic
        const fetchBlockList = (section: string) => {
            return new Promise<string[]>((res) => setTimeout(() => res(blockList[section])));
        };
        return fetchBlockList(subSection);
    }
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

    constructor() {
        this._palette = new Palette();
    }

    /** Getter for the palette component. */
    get palette(): Palette {
        return this._palette;
    }
}

// -- component instance ---------------------------------------------------------------------------

export default new Monitor();
