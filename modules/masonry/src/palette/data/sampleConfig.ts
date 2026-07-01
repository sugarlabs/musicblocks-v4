import type { BrickViewProps } from '@/@types/brick.types';
import type { PaletteConfig } from '@/@types/palette.types';

// -------------------------------------------------------------------------------------------------
// Realistic mock PaletteConfig used by the Storybook story and the playground.
//
// The `brick` field of every entry is a minimal but VALID `BrickViewProps` stub. The palette shell
// never renders these (BrickSlot is a placeholder), so the stubs exist only to satisfy the type; a
// later PR will replace them / feed real definitions.
// -------------------------------------------------------------------------------------------------

/** Builds a minimal valid `statement` brick stub (kind/widget/colorsDefault/tooltipText only). */
const stubBrick = (text: string, bg: string): BrickViewProps => ({
    kind: 'statement',
    widget: { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
});

/** Builds a minimal valid `value` brick stub (used for a couple of terminal entries). */
const stubValueBrick = (text: string, bg: string): BrickViewProps => ({
    kind: 'value',
    widget: { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
});

export const sampleConfig: PaletteConfig = {
    categories: [
        {
            name: 'Rhythm',
            icon: 'Music',
            sections: [
                {
                    name: 'Notes',
                    icon: 'Music',
                    color: '#e07a5f',
                    bricks: [
                        {
                            id: 'rhythm.note.1',
                            name: 'Note',
                            description: 'Play a note for a given duration',
                            brick: stubBrick('Note', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.rest.1',
                            name: 'Rest',
                            description: 'Silence for a given duration',
                            brick: stubBrick('Rest', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.notevalue.1',
                            name: 'Note Value',
                            description: 'The duration value of the current note',
                            brick: stubValueBrick('Note Value', '#e6957f'),
                        },
                    ],
                },
                {
                    name: 'Meter',
                    icon: 'Repeat',
                    color: '#d1603f',
                    bricks: [
                        {
                            id: 'rhythm.meter.1',
                            name: 'Meter',
                            description: 'Set the beats per measure and note value per beat',
                            brick: stubBrick('Meter', '#d1603f'),
                        },
                        {
                            id: 'rhythm.beat.1',
                            name: 'On Every Beat',
                            description: 'Run contained bricks on every beat',
                            brick: stubBrick('On Every Beat', '#d1603f'),
                        },
                    ],
                },
            ],
        },
        {
            name: 'Pitch',
            icon: 'Waves',
            sections: [
                {
                    name: 'Solfege',
                    icon: 'Music',
                    color: '#3d84a8',
                    bricks: [
                        {
                            id: 'pitch.pitch.1',
                            name: 'Pitch',
                            description: 'Play a specific pitch by solfege and octave',
                            brick: stubBrick('Pitch', '#3d84a8'),
                        },
                        {
                            id: 'pitch.hertz.1',
                            name: 'Hertz',
                            description: 'Play a pitch at a specific frequency in hertz',
                            brick: stubBrick('Hertz', '#3d84a8'),
                        },
                        {
                            id: 'pitch.number.1',
                            name: 'Pitch Number',
                            description: 'The numeric index of the current pitch',
                            brick: stubValueBrick('Pitch Number', '#4d94b8'),
                        },
                    ],
                },
                {
                    name: 'Intervals',
                    icon: 'Waves',
                    color: '#2c6e91',
                    bricks: [
                        {
                            id: 'pitch.interval.1',
                            name: 'Scalar Interval',
                            description: 'Add a scalar interval to contained pitches',
                            brick: stubBrick('Scalar Interval', '#2c6e91'),
                        },
                        {
                            id: 'pitch.semitone.1',
                            name: 'Semitone Interval',
                            description: 'Add a semitone interval to contained pitches',
                            brick: stubBrick('Semitone Interval', '#2c6e91'),
                        },
                    ],
                },
            ],
        },
        {
            name: 'Flow',
            icon: 'GitBranch',
            sections: [
                {
                    name: 'Loops',
                    icon: 'Repeat',
                    color: '#81b29a',
                    bricks: [
                        {
                            id: 'flow.repeat.1',
                            name: 'Repeat',
                            description: 'Repeat contained bricks a number of times',
                            brick: stubBrick('Repeat', '#81b29a'),
                        },
                        {
                            id: 'flow.forever.1',
                            name: 'Forever',
                            description: 'Repeat contained bricks indefinitely',
                            brick: stubBrick('Forever', '#81b29a'),
                        },
                    ],
                },
                {
                    name: 'Conditionals',
                    icon: 'GitBranch',
                    color: '#6a9c82',
                    bricks: [
                        {
                            id: 'flow.if.1',
                            name: 'If',
                            description: 'Run contained bricks when a condition is true',
                            brick: stubBrick('If', '#6a9c82'),
                        },
                        {
                            id: 'flow.ifelse.1',
                            name: 'If Else',
                            description: 'Branch between two blocks based on a condition',
                            brick: stubBrick('If Else', '#6a9c82'),
                        },
                    ],
                },
            ],
        },
        {
            name: 'Graphics',
            icon: 'Shapes',
            sections: [
                {
                    name: 'Pen',
                    icon: 'Palette',
                    color: '#9d6bb3',
                    bricks: [
                        {
                            id: 'graphics.penup.1',
                            name: 'Pen Up',
                            description: 'Lift the pen so movement leaves no trail',
                            brick: stubBrick('Pen Up', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.pendown.1',
                            name: 'Pen Down',
                            description: 'Lower the pen so movement draws a trail',
                            brick: stubBrick('Pen Down', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.color.1',
                            name: 'Set Color',
                            description: 'Set the pen color',
                            brick: stubBrick('Set Color', '#9d6bb3'),
                        },
                    ],
                },
                {
                    name: 'Movement',
                    icon: 'Play',
                    color: '#865a9c',
                    bricks: [
                        {
                            id: 'graphics.forward.1',
                            name: 'Forward',
                            description: 'Move the turtle forward by a distance',
                            brick: stubBrick('Forward', '#865a9c'),
                        },
                        {
                            id: 'graphics.right.1',
                            name: 'Right',
                            description: 'Turn the turtle clockwise by an angle',
                            brick: stubBrick('Right', '#865a9c'),
                        },
                    ],
                },
            ],
        },
    ],
};
