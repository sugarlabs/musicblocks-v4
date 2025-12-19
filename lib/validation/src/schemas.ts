/**
 * @file Pre-defined validation schemas for common Music Blocks parameters.
 */

import type {
    IParameterValidationSchema,
    IBlockValidationSchema,
} from '#/@types/validation';

// -- Parameter Schemas ----------------------------------------------------------------------------

/**
 * Validation schema for tempo parameter (10-500 BPM).
 */
export const TEMPO_SCHEMA: IParameterValidationSchema = {
    name: 'tempo',
    label: 'Tempo',
    rules: [
        {
            type: 'range',
            min: 10,
            max: 500,
            integerOnly: true,
            unit: 'BPM',
            required: true,
        },
    ],
    defaultValue: 120,
};

/**
 * Validation schema for MIDI pitch parameter (0-127).
 */
export const PITCH_SCHEMA: IParameterValidationSchema = {
    name: 'pitch',
    label: 'Pitch',
    rules: [
        {
            type: 'range',
            min: 0,
            max: 127,
            integerOnly: true,
            required: true,
        },
    ],
    defaultValue: 60,
};

/**
 * Validation schema for volume parameter (0-100%).
 */
export const VOLUME_SCHEMA: IParameterValidationSchema = {
    name: 'volume',
    label: 'Volume',
    rules: [
        {
            type: 'range',
            min: 0,
            max: 100,
            integerOnly: false,
            unit: '%',
            required: true,
        },
    ],
    defaultValue: 80,
};

/**
 * Validation schema for octave parameter (0-9).
 */
export const OCTAVE_SCHEMA: IParameterValidationSchema = {
    name: 'octave',
    label: 'Octave',
    rules: [
        {
            type: 'range',
            min: 0,
            max: 9,
            integerOnly: true,
            required: true,
        },
    ],
    defaultValue: 4,
};

/**
 * Validation schema for note name parameter (e.g., C, C#, Bb).
 */
export const NOTE_NAME_SCHEMA: IParameterValidationSchema = {
    name: 'noteName',
    label: 'Note',
    rules: [
        {
            type: 'format',
            pattern: /^[A-Ga-g](#{1,2}|b{1,2})?$/,
            formatDescription: 'Note letter (A-G) with optional accidental (# or b).',
            example: 'C#',
            required: true,
        },
    ],
    defaultValue: 'C',
};

/**
 * Validation schema for duration parameter.
 */
export const DURATION_SCHEMA: IParameterValidationSchema = {
    name: 'duration',
    label: 'Duration',
    rules: [
        {
            type: 'enum',
            allowedValues: [
                'whole',
                'half',
                'quarter',
                'eighth',
                'sixteenth',
                'thirty-second',
                '1',
                '1/2',
                '1/4',
                '1/8',
                '1/16',
                '1/32',
            ],
            caseSensitive: false,
            required: true,
        },
    ],
    defaultValue: 'quarter',
};

/**
 * Validation schema for note with octave parameter (e.g., C4, Bb3).
 */
export const NOTE_WITH_OCTAVE_SCHEMA: IParameterValidationSchema = {
    name: 'note',
    label: 'Note',
    rules: [
        {
            type: 'format',
            pattern: /^[A-Ga-g](#{1,2}|b{1,2})?[0-9]$/,
            formatDescription: 'Note letter with optional accidental and octave number.',
            example: 'C4',
            required: true,
        },
    ],
    defaultValue: 'C4',
};

// -- Block Schemas --------------------------------------------------------------------------------

/**
 * Validation schema for a tempo block.
 */
export const TEMPO_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'tempo',
    blockName: 'Set Tempo',
    parameters: {
        tempo: TEMPO_SCHEMA,
    },
};

/**
 * Validation schema for a play note block.
 */
export const PLAY_NOTE_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'playNote',
    blockName: 'Play Note',
    parameters: {
        note: NOTE_WITH_OCTAVE_SCHEMA,
        duration: DURATION_SCHEMA,
        volume: {
            ...VOLUME_SCHEMA,
            rules: [
                {
                    ...VOLUME_SCHEMA.rules[0],
                    required: false,
                },
            ],
        },
    },
};

/**
 * Validation schema for a set pitch block.
 */
export const SET_PITCH_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'setPitch',
    blockName: 'Set Pitch',
    parameters: {
        pitch: PITCH_SCHEMA,
    },
};

/**
 * Validation schema for a set volume block.
 */
export const SET_VOLUME_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'setVolume',
    blockName: 'Set Volume',
    parameters: {
        volume: VOLUME_SCHEMA,
    },
};

/**
 * Validation schema for a set octave block.
 */
export const SET_OCTAVE_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'setOctave',
    blockName: 'Set Octave',
    parameters: {
        octave: OCTAVE_SCHEMA,
    },
};

/**
 * Validation schema for move forward block.
 */
export const MOVE_FORWARD_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'moveForward',
    blockName: 'Move Forward',
    parameters: {
        distance: {
            name: 'distance',
            label: 'Distance',
            rules: [
                {
                    type: 'range',
                    min: -10000,
                    max: 10000,
                    integerOnly: false,
                    unit: 'pixels',
                    required: true,
                },
            ],
            defaultValue: 100,
        },
    },
};

/**
 * Validation schema for turn block.
 */
export const TURN_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'turn',
    blockName: 'Turn',
    parameters: {
        angle: {
            name: 'angle',
            label: 'Angle',
            rules: [
                {
                    type: 'range',
                    min: -360,
                    max: 360,
                    integerOnly: false,
                    unit: 'degrees',
                    required: true,
                },
            ],
            defaultValue: 90,
        },
    },
};

/**
 * Validation schema for set color block.
 */
export const SET_COLOR_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'setColor',
    blockName: 'Set Color',
    parameters: {
        color: {
            name: 'color',
            label: 'Color',
            rules: [
                {
                    type: 'range',
                    min: 0,
                    max: 100,
                    integerOnly: false,
                    required: true,
                },
            ],
            defaultValue: 0,
        },
    },
};

/**
 * Validation schema for set thickness block.
 */
export const SET_THICKNESS_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'setThickness',
    blockName: 'Set Thickness',
    parameters: {
        thickness: {
            name: 'thickness',
            label: 'Thickness',
            rules: [
                {
                    type: 'range',
                    min: 1,
                    max: 100,
                    integerOnly: true,
                    unit: 'pixels',
                    required: true,
                },
            ],
            defaultValue: 1,
        },
    },
};

/**
 * Validation schema for repeat block.
 */
export const REPEAT_BLOCK_SCHEMA: IBlockValidationSchema = {
    blockType: 'repeat',
    blockName: 'Repeat',
    parameters: {
        times: {
            name: 'times',
            label: 'Times',
            rules: [
                {
                    type: 'range',
                    min: 0,
                    max: 10000,
                    integerOnly: true,
                    required: true,
                },
            ],
            defaultValue: 1,
        },
    },
};
