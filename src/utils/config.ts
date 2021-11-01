// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '../@types/config';
import { TBrickList } from '@/@types/palette';

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

const paletteSections: string[] = ['Music', 'Logic', 'Art'];
const paletteSubSections: { [key: string]: string[] } = {
    Music: [
        'Rhythm',
        'Meter',
        'Pitch',
        'Intervals',
        'Tone',
        'Ornament',
        'Volume',
        'Drum',
        'Widgets',
    ],
    Logic: [
        'Flow',
        'Action',
        'Boxes',
        'Number',
        'Boolean',
        'Heap',
        'Dictionary',
        'Extras',
        'Program',
    ],
    Art: ['Graphics', 'Pen', 'Media', 'Sensors', 'Ensemble'],
};

/**
 * Fetches the list of palette sections and returns it.
 *
 * @returns `Promise` instance for the list of palette sections.
 */
export function collectPaletteSections(): Promise<string[]> {
    return new Promise<string[]>((resolve) => resolve(paletteSections));
}

/**
 * Fetches the list of palette sub-sections and returns it.
 *
 * @returns `Promise` instance for the list of palette sub-sections.
 */
export function collectPaletteSubSections(): Promise<{ [key: string]: string[] }> {
    return new Promise((resolve) => resolve(paletteSubSections));
}

/**
 * Fetches the list of blocks for each sub-section and returns it.
 *
 * @returns `Promise` instance for the list of bricks.
 */
export function collectBrickList(): Promise<TBrickList> {
    const brickListDummy: TBrickList = {
        Music: {
            Rhythm: [
                'note',
                'note value drum',
                'silence',
                'note value',
                {
                    block1: ['block1', 'block2', 'block3', 'block4', 'block5'],
                },
                {
                    block2: ['block11', 'block21', 'block31', 'block41', 'block51'],
                },
            ],
            Meter: [
                'beats per second',
                'master beats per second',
                'on every note do',
                'notes played',
                'beat count',
                {
                    block1: ['block1', 'block2', 'block3', 'block4', 'block5'],
                },
                {
                    block2: ['block11', 'block21', 'block31', 'block41', 'block51'],
                },
            ],
            Pitch: [
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
                {
                    block1: ['block1', 'block2', 'block3', 'block4', 'block5'],
                },
                {
                    block2: ['block11', 'block21', 'block31', 'block41', 'block51'],
                },
            ],
        },
        Logic: {
            Flow: [
                'repeat',
                'forever',
                'if then',
                'if then else',
                'backward',
                {
                    block1: ['block1', 'block2', 'block3', 'block4', 'block5'],
                },
                {
                    block2: ['block11', 'block21', 'block31', 'block41', 'block51'],
                },
            ],
        },
        Art: {
            Graphics: [
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
                {
                    block1: ['block1', 'block2', 'block3', 'block4', 'block5'],
                },
                {
                    block2: ['block11', 'block21', 'block31', 'block41', 'block51'],
                },
            ],
        },
    };

    const brickList: TBrickList = {};
    for (const section of paletteSections) {
        for (const subSection of paletteSubSections[section]) {
            if (section in brickListDummy && subSection in brickListDummy[section]) {
                if (!(section in brickList)) {
                    brickList[section] = {};
                }
                brickList[section][subSection] = brickListDummy[section][subSection];
            } else {
                brickList[section][subSection] = [];
            }
        }
    }

    return new Promise((resolve) => resolve(brickList));
}
