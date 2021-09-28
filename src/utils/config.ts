// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '../@types/config';

// -- utilities ------------------------------------------------------------------------------------

export function collectAppLanguages(): Promise<{ code: TAppLanguage; name: string }[]> {
    return new Promise((resolve) =>
        resolve([
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'हिंदी' },
            { code: 'pt', name: 'Português' },
        ]),
    );
}

export function collectBrickSizes(): Promise<{ value: number; label: string }[]> {
    return new Promise((resolve) =>
        resolve([
            { value: 1, label: 'small' },
            { value: 2, label: 'normal' },
            { value: 3, label: 'medium' },
            { value: 4, label: 'large' },
            { value: 5, label: 'very large' },
        ]),
    );
}

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

/**
 * Fetches the list of palette sections and returns it.
 *
 * @returns `Promise` instance corresponding to the list of palette sections.
 */
export function getSections(): Promise<string[]> {
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
export function getSubSection(index: number): Promise<string[]> {
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
export function getBlockList(
    subSection: string,
): Promise<(string | { [button: string]: string[] })[]> {
    // dummy logic
    const fetchBlockList = (section: string) => {
        return new Promise<(string | { [button: string]: string[] })[]>((res) =>
            setTimeout(() => res(blockList[section])),
        );
    };
    return fetchBlockList(subSection);
}
