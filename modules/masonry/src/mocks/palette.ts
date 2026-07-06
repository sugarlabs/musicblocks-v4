import {
    Activity,
    Boxes,
    Brush,
    Camera,
    Cpu,
    Database,
    Drum,
    GitBranch,
    Hash,
    Music,
    PenTool,
    Play,
    Repeat,
    Settings,
    Shapes,
    SlidersHorizontal,
    SquareFunction,
    ToggleLeft,
    Users,
    Volume2,
    Waves,
} from 'lucide-react';

import type {
    BrickViewProps,
    WidgetInput,
    WidgetDisplay,
    ParamArgPair,
} from '@/@types/brick.types';
import type { PaletteConfig } from '@/@types/palette.types';

// -------------------------------------------------------------------------------------------------

// The palette shell never renders these `brick` configs (bricks show as placeholders), so each is a
// minimal but VALID `BrickViewProps` stub that exists only to satisfy the type. A later PR will feed
// real brick definitions here.

/** Builds a valid `statement` brick stub. */
const stubStatementBrick = (
    text: string,
    bg: string,
    hasNesting: boolean = false,
): BrickViewProps => ({
    kind: 'statement',
    widget: { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
    hasConnectionPrev: true,
    hasConnectionNext: true,
    ...(hasNesting ? { nesting: { dims: null, isFolded: false } } : {}),
});

/** Builds a valid `expression` brick stub. */
const stubExpressionBrick = (text: string, bg: string, params: string[] = []): BrickViewProps => ({
    kind: 'expression',
    widget: { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
    paramArgs: (params.length > 0
        ? params.map((p) => ({ param: p, argDims: null }))
        : [{ argDims: null }]) as [ParamArgPair, ...ParamArgPair[]],
});

/** Builds a valid `value` brick stub (display label or input). */
const stubValueBrick = (
    text: string,
    bg: string,
    widget?: WidgetInput | WidgetDisplay,
): BrickViewProps => ({
    kind: 'value',
    widget: widget ?? { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
});

// -------------------------------------------------------------------------------------------------

/**
 * Extensive mock palette configuration used by the Palette story. It intentionally spans three
 * classifications (Music / Logic / Art) with many categories and bricks each, so classification
 * switching, a long-ish sidebar, and main-list scrolling/crowding are all visible in the shell.
 */
export const mockPaletteConfig: PaletteConfig = {
    classifications: [
        {
            name: 'Music',
            icon: Music,
            categories: [
                {
                    name: 'Rhythm',
                    icon: Music,
                    color: '#e07a5f',
                    bricks: [
                        {
                            id: 'rhythm.note.1',
                            name: 'Note',
                            description: 'Play a note for a given duration',
                            brick: stubStatementBrick('Note', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.rest.1',
                            name: 'Rest',
                            description: 'Silence for a given duration',
                            brick: stubStatementBrick('Rest', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.dot.1',
                            name: 'Dotted Note',
                            description: 'Extend a note duration by half',
                            brick: stubStatementBrick('Dotted Note', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.tie.1',
                            name: 'Tie',
                            description: 'Tie contained notes into one sustained note',
                            brick: stubStatementBrick('Tie', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.tuplet.1',
                            name: 'Tuplet',
                            description: 'Fit contained notes evenly into a duration',
                            brick: stubStatementBrick('Tuplet', '#e07a5f'),
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
                    icon: Repeat,
                    color: '#d1603f',
                    bricks: [
                        {
                            id: 'meter.meter.1',
                            name: 'Meter',
                            description: 'Set the beats per measure and note value per beat',
                            brick: stubStatementBrick('Meter', '#d1603f'),
                        },
                        {
                            id: 'meter.beat.1',
                            name: 'On Every Beat',
                            description: 'Run contained bricks on every beat',
                            brick: stubStatementBrick('On Every Beat', '#d1603f'),
                        },
                        {
                            id: 'meter.strongbeat.1',
                            name: 'On Strong Beat',
                            description: 'Run contained bricks on a specified strong beat',
                            brick: stubStatementBrick('On Strong Beat', '#d1603f'),
                        },
                        {
                            id: 'meter.beatcount.1',
                            name: 'Beat Count',
                            description: 'The number of beats played so far',
                            brick: stubValueBrick('Beat Count', '#e0754f'),
                        },
                        {
                            id: 'meter.bpm.1',
                            name: 'Beats Per Minute',
                            description: 'Set the tempo in beats per minute',
                            brick: stubStatementBrick('Beats Per Minute', '#d1603f'),
                        },
                    ],
                },
                {
                    name: 'Pitch',
                    icon: Waves,
                    color: '#3d84a8',
                    bricks: [
                        {
                            id: 'pitch.pitch.1',
                            name: 'Pitch',
                            description: 'Play a specific pitch by solfege and octave',
                            brick: stubStatementBrick('Pitch', '#3d84a8'),
                        },
                        {
                            id: 'pitch.solfege.1',
                            name: 'Solfege',
                            description: 'Choose a solfege syllable such as do, re, or mi',
                            brick: stubStatementBrick('Solfege', '#3d84a8'),
                        },
                        {
                            id: 'pitch.hertz.1',
                            name: 'Hertz',
                            description: 'Play a pitch at a specific frequency in hertz',
                            brick: stubStatementBrick('Hertz', '#3d84a8'),
                        },
                        {
                            id: 'pitch.notename.1',
                            name: 'Note Name',
                            description: 'Choose a pitch by its letter name and accidental',
                            brick: stubStatementBrick('Note Name', '#3d84a8'),
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
                    icon: SlidersHorizontal,
                    color: '#2c6e91',
                    bricks: [
                        {
                            id: 'intervals.scalar.1',
                            name: 'Scalar Interval',
                            description: 'Add a scalar interval to contained pitches',
                            brick: stubStatementBrick('Scalar Interval', '#2c6e91'),
                        },
                        {
                            id: 'intervals.semitone.1',
                            name: 'Semitone Interval',
                            description: 'Add a semitone interval to contained pitches',
                            brick: stubStatementBrick('Semitone Interval', '#2c6e91'),
                        },
                        {
                            id: 'intervals.transpose.1',
                            name: 'Transpose',
                            description: 'Shift contained pitches up or down by steps',
                            brick: stubStatementBrick('Transpose', '#2c6e91'),
                        },
                        {
                            id: 'intervals.octave.1',
                            name: 'Set Octave',
                            description: 'Set the octave for contained pitches',
                            brick: stubStatementBrick('Set Octave', '#2c6e91'),
                        },
                        {
                            id: 'intervals.mode.1',
                            name: 'Set Mode',
                            description: 'Choose the musical mode used to interpret intervals',
                            brick: stubStatementBrick('Set Mode', '#2c6e91'),
                        },
                    ],
                },
                {
                    name: 'Tone',
                    icon: SquareFunction,
                    color: '#1f5c7a',
                    bricks: [
                        {
                            id: 'tone.sharp.1',
                            name: 'Sharp',
                            description: 'Raise contained pitches by a semitone',
                            brick: stubStatementBrick('Sharp', '#1f5c7a'),
                        },
                        {
                            id: 'tone.flat.1',
                            name: 'Flat',
                            description: 'Lower contained pitches by a semitone',
                            brick: stubStatementBrick('Flat', '#1f5c7a'),
                        },
                        {
                            id: 'tone.glide.1',
                            name: 'Glide',
                            description: 'Glide smoothly between contained pitches',
                            brick: stubStatementBrick('Glide', '#1f5c7a'),
                        },
                        {
                            id: 'tone.instrument.1',
                            name: 'Set Instrument',
                            description: 'Choose the instrument for contained notes',
                            brick: stubStatementBrick('Set Instrument', '#1f5c7a'),
                        },
                    ],
                },
                {
                    name: 'Ornament',
                    icon: Activity,
                    color: '#b08d1e',
                    bricks: [
                        {
                            id: 'ornament.staccato.1',
                            name: 'Staccato',
                            description: 'Play contained notes short and detached',
                            brick: stubStatementBrick('Staccato', '#b08d1e'),
                        },
                        {
                            id: 'ornament.slur.1',
                            name: 'Slur',
                            description: 'Play contained notes smoothly connected',
                            brick: stubStatementBrick('Slur', '#b08d1e'),
                        },
                        {
                            id: 'ornament.accent.1',
                            name: 'Accent',
                            description: 'Emphasize contained notes',
                            brick: stubStatementBrick('Accent', '#b08d1e'),
                        },
                        {
                            id: 'ornament.envelope.1',
                            name: 'Envelope',
                            description: 'Shape the attack and release of contained notes',
                            brick: stubStatementBrick('Envelope', '#b08d1e'),
                        },
                    ],
                },
                {
                    name: 'Volume',
                    icon: Volume2,
                    color: '#c9a227',
                    bricks: [
                        {
                            id: 'volume.setvolume.1',
                            name: 'Set Volume',
                            description: 'Set the playback volume level',
                            brick: stubStatementBrick('Set Volume', '#c9a227'),
                        },
                        {
                            id: 'volume.crescendo.1',
                            name: 'Crescendo',
                            description: 'Gradually increase volume over contained notes',
                            brick: stubStatementBrick('Crescendo', '#c9a227'),
                        },
                        {
                            id: 'volume.decrescendo.1',
                            name: 'Decrescendo',
                            description: 'Gradually decrease volume over contained notes',
                            brick: stubStatementBrick('Decrescendo', '#c9a227'),
                        },
                        {
                            id: 'volume.pan.1',
                            name: 'Pan',
                            description: 'Position the sound in the stereo field',
                            brick: stubStatementBrick('Pan', '#c9a227'),
                        },
                        {
                            id: 'volume.level.1',
                            name: 'Volume Level',
                            description: 'The current playback volume level',
                            brick: stubValueBrick('Volume Level', '#d9b237'),
                        },
                    ],
                },
                {
                    name: 'Drum',
                    icon: Drum,
                    color: '#977818',
                    bricks: [
                        {
                            id: 'drum.playdrum.1',
                            name: 'Play Drum',
                            description: 'Play a percussion sound once',
                            brick: stubStatementBrick('Play Drum', '#977818'),
                        },
                        {
                            id: 'drum.setdrum.1',
                            name: 'Set Drum',
                            description: 'Map contained notes onto a drum sound',
                            brick: stubStatementBrick('Set Drum', '#977818'),
                        },
                        {
                            id: 'drum.noise.1',
                            name: 'Play Noise',
                            description: 'Play a noise generator sound',
                            brick: stubStatementBrick('Play Noise', '#977818'),
                        },
                        {
                            id: 'drum.mappitch.1',
                            name: 'Map Pitch To Drum',
                            description: 'Replace contained pitches with a drum sound',
                            brick: stubStatementBrick('Map Pitch To Drum', '#977818'),
                        },
                    ],
                },
                {
                    name: 'Widgets',
                    icon: SlidersHorizontal,
                    color: '#8a6f14',
                    bricks: [
                        {
                            id: 'widgets.pianoroll.1',
                            name: 'Piano Roll',
                            description: 'Open the piano roll widget to edit notes visually',
                            brick: stubStatementBrick('Piano Roll', '#8a6f14'),
                        },
                        {
                            id: 'widgets.rhythmmaker.1',
                            name: 'Rhythm Maker',
                            description: 'Open the rhythm maker widget to build beats',
                            brick: stubStatementBrick('Rhythm Maker', '#8a6f14'),
                        },
                        {
                            id: 'widgets.tuner.1',
                            name: 'Tuner',
                            description: 'Open the tuner widget to adjust temperament',
                            brick: stubStatementBrick('Tuner', '#8a6f14'),
                        },
                        {
                            id: 'widgets.oscilloscope.1',
                            name: 'Oscilloscope',
                            description: 'Open the oscilloscope widget to view waveforms',
                            brick: stubStatementBrick('Oscilloscope', '#8a6f14'),
                        },
                    ],
                },
            ],
        },
        {
            name: 'Logic',
            icon: GitBranch,
            categories: [
                {
                    name: 'Flow',
                    icon: Repeat,
                    color: '#81b29a',
                    bricks: [
                        {
                            id: 'flow.repeat.1',
                            name: 'Repeat',
                            description: 'Repeat contained bricks a number of times',
                            brick: stubStatementBrick('Repeat', '#81b29a', true),
                        },
                        {
                            id: 'flow.forever.1',
                            name: 'Forever',
                            description: 'Repeat contained bricks indefinitely',
                            brick: stubStatementBrick('Forever', '#81b29a', true),
                        },
                        {
                            id: 'flow.while.1',
                            name: 'While',
                            description: 'Repeat contained bricks while a condition holds',
                            brick: stubStatementBrick('While', '#81b29a', true),
                        },
                        {
                            id: 'flow.until.1',
                            name: 'Until',
                            description: 'Repeat contained bricks until a condition holds',
                            brick: stubStatementBrick('Until', '#81b29a', true),
                        },
                        {
                            id: 'flow.if.1',
                            name: 'If',
                            description: 'Run contained bricks when a condition is true',
                            brick: stubStatementBrick('If', '#81b29a', true),
                        },
                        {
                            id: 'flow.ifelse.1',
                            name: 'If Else',
                            description: 'Branch between two blocks based on a condition',
                            brick: stubStatementBrick('If Else', '#81b29a', true),
                        },
                        {
                            id: 'flow.wait.1',
                            name: 'Wait',
                            description: 'Pause for a given number of seconds',
                            brick: stubStatementBrick('Wait', '#81b29a'),
                        },
                    ],
                },
                {
                    name: 'Action',
                    icon: Play,
                    color: '#6a9c82',
                    bricks: [
                        {
                            id: 'action.start.1',
                            name: 'Start',
                            description: 'Entry point that runs when the program starts',
                            brick: stubStatementBrick('Start', '#6a9c82'),
                        },
                        {
                            id: 'action.action.1',
                            name: 'Action',
                            description: 'Define a reusable named action',
                            brick: stubStatementBrick('Action', '#6a9c82'),
                        },
                        {
                            id: 'action.do.1',
                            name: 'Do',
                            description: 'Call a named action by name',
                            brick: stubStatementBrick('Do', '#6a9c82'),
                        },
                        {
                            id: 'action.dispatch.1',
                            name: 'Broadcast',
                            description: 'Broadcast an event to listeners',
                            brick: stubStatementBrick('Broadcast', '#6a9c82'),
                        },
                        {
                            id: 'action.listen.1',
                            name: 'On Event',
                            description: 'Run contained bricks when an event is received',
                            brick: stubStatementBrick('On Event', '#6a9c82'),
                        },
                    ],
                },
                {
                    name: 'Boxes',
                    icon: Boxes,
                    color: '#568a70',
                    bricks: [
                        {
                            id: 'boxes.storein.1',
                            name: 'Store In Box',
                            description: 'Store a value in a named box',
                            brick: stubStatementBrick('Store In Box', '#568a70'),
                        },
                        {
                            id: 'boxes.box.1',
                            name: 'Box',
                            description: 'The value currently held in a named box',
                            brick: stubValueBrick('Box', '#66a080'),
                        },
                        {
                            id: 'boxes.increment.1',
                            name: 'Add To Box',
                            description: 'Add a value to a named box',
                            brick: stubStatementBrick('Add To Box', '#568a70'),
                        },
                        {
                            id: 'boxes.namedbox.1',
                            name: 'Named Box',
                            description: 'Reference a box by an explicit name',
                            brick: stubValueBrick('Named Box', '#66a080'),
                        },
                    ],
                },
                {
                    name: 'Number',
                    icon: Hash,
                    color: '#4a7d63',
                    bricks: [
                        {
                            id: 'number.number.1',
                            name: 'Number',
                            description: 'A literal numeric value',
                            brick: stubValueBrick('Number', '#5a8d73', {
                                type: 'numberbox',
                                value: 0,
                            }),
                        },
                        {
                            id: 'number.add.1',
                            name: 'Add',
                            description: 'Add two numbers together',
                            brick: stubExpressionBrick('Add', '#5a8d73', ['a', 'b']),
                        },
                        {
                            id: 'number.subtract.1',
                            name: 'Subtract',
                            description: 'Subtract one number from another',
                            brick: stubExpressionBrick('Subtract', '#5a8d73', ['a', 'b']),
                        },
                        {
                            id: 'number.multiply.1',
                            name: 'Multiply',
                            description: 'Multiply two numbers together',
                            brick: stubExpressionBrick('Multiply', '#5a8d73', ['a', 'b']),
                        },
                        {
                            id: 'number.divide.1',
                            name: 'Divide',
                            description: 'Divide one number by another',
                            brick: stubExpressionBrick('Divide', '#5a8d73', ['a', 'b']),
                        },
                        {
                            id: 'number.random.1',
                            name: 'Random',
                            description: 'A random number within a range',
                            brick: stubExpressionBrick('Random', '#5a8d73', ['min', 'max']),
                        },
                    ],
                },
                {
                    name: 'Boolean',
                    icon: ToggleLeft,
                    color: '#3d6b54',
                    bricks: [
                        {
                            id: 'boolean.boolean.1',
                            name: 'Boolean',
                            description: 'A literal boolean value',
                            brick: stubValueBrick('Boolean', '#4d7b64', {
                                type: 'toggle',
                                value: true,
                            }),
                        },
                        {
                            id: 'boolean.equal.1',
                            name: 'Equals',
                            description: 'True when two values are equal',
                            brick: stubExpressionBrick('Equals', '#4d7b64', ['a', 'b']),
                        },
                        {
                            id: 'boolean.greater.1',
                            name: 'Greater Than',
                            description: 'True when the first value exceeds the second',
                            brick: stubExpressionBrick('Greater Than', '#4d7b64', ['a', 'b']),
                        },
                        {
                            id: 'boolean.less.1',
                            name: 'Less Than',
                            description: 'True when the first value is below the second',
                            brick: stubExpressionBrick('Less Than', '#4d7b64', ['a', 'b']),
                        },
                        {
                            id: 'boolean.and.1',
                            name: 'And',
                            description: 'True when both conditions are true',
                            brick: stubExpressionBrick('And', '#4d7b64', ['a', 'b']),
                        },
                        {
                            id: 'boolean.or.1',
                            name: 'Or',
                            description: 'True when either condition is true',
                            brick: stubExpressionBrick('Or', '#4d7b64', ['a', 'b']),
                        },
                        {
                            id: 'boolean.not.1',
                            name: 'Not',
                            description: 'Invert a boolean value',
                            brick: stubExpressionBrick('Not', '#4d7b64', ['value']),
                        },
                    ],
                },
                {
                    name: 'Heap',
                    icon: Database,
                    color: '#2f5b45',
                    bricks: [
                        {
                            id: 'heap.push.1',
                            name: 'Push',
                            description: 'Push a value onto the heap',
                            brick: stubStatementBrick('Push', '#2f5b45'),
                        },
                        {
                            id: 'heap.pop.1',
                            name: 'Pop',
                            description: 'Pop the last value off the heap',
                            brick: stubValueBrick('Pop', '#3f6b55'),
                        },
                        {
                            id: 'heap.setindex.1',
                            name: 'Set Heap Entry',
                            description: 'Set the heap entry at an index',
                            brick: stubStatementBrick('Set Heap Entry', '#2f5b45'),
                        },
                        {
                            id: 'heap.getindex.1',
                            name: 'Heap Entry',
                            description: 'The heap entry at an index',
                            brick: stubValueBrick('Heap Entry', '#3f6b55'),
                        },
                        {
                            id: 'heap.length.1',
                            name: 'Heap Length',
                            description: 'The number of entries in the heap',
                            brick: stubValueBrick('Heap Length', '#3f6b55'),
                        },
                    ],
                },
            ],
        },
        {
            name: 'Art',
            icon: Brush,
            categories: [
                {
                    name: 'Graphics',
                    icon: Shapes,
                    color: '#9d6bb3',
                    bricks: [
                        {
                            id: 'graphics.forward.1',
                            name: 'Forward',
                            description: 'Move the turtle forward by a distance',
                            brick: stubStatementBrick('Forward', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.back.1',
                            name: 'Back',
                            description: 'Move the turtle backward by a distance',
                            brick: stubStatementBrick('Back', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.right.1',
                            name: 'Right',
                            description: 'Turn the turtle clockwise by an angle',
                            brick: stubStatementBrick('Right', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.left.1',
                            name: 'Left',
                            description: 'Turn the turtle counter-clockwise by an angle',
                            brick: stubStatementBrick('Left', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.setxy.1',
                            name: 'Set XY',
                            description: 'Move the turtle to specific coordinates',
                            brick: stubStatementBrick('Set XY', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.heading.1',
                            name: 'Heading',
                            description: 'The current heading of the turtle in degrees',
                            brick: stubValueBrick('Heading', '#ad7bc3'),
                        },
                    ],
                },
                {
                    name: 'Pen',
                    icon: PenTool,
                    color: '#865a9c',
                    bricks: [
                        {
                            id: 'pen.penup.1',
                            name: 'Pen Up',
                            description: 'Lift the pen so movement leaves no trail',
                            brick: stubStatementBrick('Pen Up', '#865a9c'),
                        },
                        {
                            id: 'pen.pendown.1',
                            name: 'Pen Down',
                            description: 'Lower the pen so movement draws a trail',
                            brick: stubStatementBrick('Pen Down', '#865a9c'),
                        },
                        {
                            id: 'pen.color.1',
                            name: 'Set Color',
                            description: 'Set the pen color',
                            brick: stubStatementBrick('Set Color', '#865a9c'),
                        },
                        {
                            id: 'pen.size.1',
                            name: 'Set Pen Size',
                            description: 'Set the width of the pen stroke',
                            brick: stubStatementBrick('Set Pen Size', '#865a9c'),
                        },
                        {
                            id: 'pen.fill.1',
                            name: 'Fill',
                            description: 'Fill the shape drawn by contained bricks',
                            brick: stubStatementBrick('Fill', '#865a9c'),
                        },
                        {
                            id: 'pen.background.1',
                            name: 'Set Background',
                            description: 'Set the canvas background color',
                            brick: stubStatementBrick('Set Background', '#865a9c'),
                        },
                    ],
                },
                {
                    name: 'Media',
                    icon: Camera,
                    color: '#6f4885',
                    bricks: [
                        {
                            id: 'media.showtext.1',
                            name: 'Show Text',
                            description: 'Display text on the canvas',
                            brick: stubStatementBrick('Show Text', '#6f4885'),
                        },
                        {
                            id: 'media.showimage.1',
                            name: 'Show Image',
                            description: 'Display an image on the canvas',
                            brick: stubStatementBrick('Show Image', '#6f4885'),
                        },
                        {
                            id: 'media.speak.1',
                            name: 'Speak',
                            description: 'Speak text aloud using text-to-speech',
                            brick: stubStatementBrick('Speak', '#6f4885'),
                        },
                        {
                            id: 'media.snapshot.1',
                            name: 'Take Snapshot',
                            description: 'Capture the current canvas as an image',
                            brick: stubStatementBrick('Take Snapshot', '#6f4885'),
                        },
                    ],
                },
                {
                    name: 'Sensors',
                    icon: Cpu,
                    color: '#5a3a6e',
                    bricks: [
                        {
                            id: 'sensors.mousex.1',
                            name: 'Mouse X',
                            description: 'The current horizontal mouse position',
                            brick: stubValueBrick('Mouse X', '#6a4a7e'),
                        },
                        {
                            id: 'sensors.mousey.1',
                            name: 'Mouse Y',
                            description: 'The current vertical mouse position',
                            brick: stubValueBrick('Mouse Y', '#6a4a7e'),
                        },
                        {
                            id: 'sensors.mousedown.1',
                            name: 'Mouse Pressed',
                            description: 'True while the mouse button is held down',
                            brick: stubValueBrick('Mouse Pressed', '#6a4a7e'),
                        },
                        {
                            id: 'sensors.keypressed.1',
                            name: 'Key Pressed',
                            description: 'The most recently pressed key',
                            brick: stubValueBrick('Key Pressed', '#6a4a7e'),
                        },
                        {
                            id: 'sensors.time.1',
                            name: 'Time',
                            description: 'Seconds elapsed since the program started',
                            brick: stubValueBrick('Time', '#6a4a7e'),
                        },
                    ],
                },
                {
                    name: 'Ensemble',
                    icon: Users,
                    color: '#4a2f5c',
                    bricks: [
                        {
                            id: 'ensemble.newturtle.1',
                            name: 'New Turtle',
                            description: 'Create a new turtle with its own actions',
                            brick: stubStatementBrick('New Turtle', '#4a2f5c'),
                        },
                        {
                            id: 'ensemble.switch.1',
                            name: 'Switch Turtle',
                            description: 'Run contained bricks on a chosen turtle',
                            brick: stubStatementBrick('Switch Turtle', '#4a2f5c'),
                        },
                        {
                            id: 'ensemble.turtlex.1',
                            name: 'Turtle X',
                            description: 'The horizontal position of a named turtle',
                            brick: stubValueBrick('Turtle X', '#5a3f6c'),
                        },
                        {
                            id: 'ensemble.turtley.1',
                            name: 'Turtle Y',
                            description: 'The vertical position of a named turtle',
                            brick: stubValueBrick('Turtle Y', '#5a3f6c'),
                        },
                        {
                            id: 'ensemble.sync.1',
                            name: 'Sync Turtles',
                            description: 'Synchronize the clocks of all turtles',
                            brick: stubStatementBrick('Sync Turtles', '#4a2f5c'),
                        },
                    ],
                },
                {
                    name: 'QA Tests',
                    icon: Settings,
                    color: '#666666',
                    bricks: [
                        {
                            id: 'qa.stmt.0',
                            name: 'Stmt Arg0 Text',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'Arg 0' },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                            },
                        },
                        {
                            id: 'qa.stmt.1',
                            name: 'Stmt Arg1 NoLabel',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'Arg 1' },
                                paramArgs: [{ param: 'A', argDims: null }],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                            },
                        },
                        {
                            id: 'qa.stmt.2',
                            name: 'Stmt Arg2 Labeled Glyph',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'label' },
                                paramArgs: [
                                    { param: 'A', argDims: null },
                                    { param: 'B', argDims: null },
                                ],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                            },
                        },
                        {
                            id: 'qa.stmt.3',
                            name: 'Stmt Variant',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: {
                                    type: 'variant',
                                    options: ['Opt A', 'Opt B'],
                                    value: 'Opt A',
                                },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                            },
                        },
                        {
                            id: 'qa.stmt.nest.0',
                            name: 'Nest Arg0 Text',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'Nest 0' },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                                nesting: { dims: null, isFolded: false },
                            },
                        },
                        {
                            id: 'qa.stmt.nest.1',
                            name: 'Nest Arg1 NoLabel',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'Nest 1' },
                                paramArgs: [{ param: 'A', argDims: null }],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                                nesting: { dims: null, isFolded: false },
                            },
                        },
                        {
                            id: 'qa.stmt.nest.2',
                            name: 'Nest Arg2 Labeled Variant',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'variant', options: ['A', 'B'], value: 'A' },
                                paramArgs: [
                                    { param: 'A', argDims: null },
                                    { param: 'B', argDims: null },
                                ],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: true,
                                hasConnectionNext: true,
                                nesting: { dims: null, isFolded: false },
                            },
                        },
                        {
                            id: 'qa.stmt.nest.nonotch',
                            name: 'Nest NoNotch',
                            description: '',
                            brick: {
                                kind: 'statement',
                                widget: { type: 'label', text: 'No Notch Nest' },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                                hasConnectionPrev: false,
                                hasConnectionNext: false,
                                nesting: { dims: null, isFolded: false },
                            },
                        },
                        {
                            id: 'qa.expr.1',
                            name: 'Expr Arg1 Text',
                            description: '',
                            brick: {
                                kind: 'expression',
                                widget: { type: 'label', text: 'Expr 1' },
                                paramArgs: [{ param: 'A', argDims: null }],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.expr.2',
                            name: 'Expr Arg2 Labeled Glyph',
                            description: '',
                            brick: {
                                kind: 'expression',
                                widget: { type: 'label', text: 'label' },
                                paramArgs: [
                                    { param: 'A', argDims: null },
                                    { param: 'B', argDims: null },
                                ],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.expr.3',
                            name: 'Expr Variant',
                            description: '',
                            brick: {
                                kind: 'expression',
                                widget: { type: 'variant', options: ['A', 'B'], value: 'A' },
                                paramArgs: [
                                    { param: 'A', argDims: null },
                                    { param: 'B', argDims: null },
                                ],
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.val.text',
                            name: 'Val Textbox',
                            description: '',
                            brick: {
                                kind: 'value',
                                widget: { type: 'textbox', value: 'Hello' },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.val.num',
                            name: 'Val Numberbox',
                            description: '',
                            brick: {
                                kind: 'value',
                                widget: { type: 'numberbox', value: 5, min: 0, max: 10 },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.val.toggle',
                            name: 'Val Toggle',
                            description: '',
                            brick: {
                                kind: 'value',
                                widget: {
                                    type: 'toggle',
                                    value: true,
                                    labels: { on: 'Yes', off: 'No' },
                                },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.val.slider',
                            name: 'Val Slider',
                            description: '',
                            brick: {
                                kind: 'value',
                                widget: { type: 'slider', value: 50, min: 0, max: 100 },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                        {
                            id: 'qa.val.select',
                            name: 'Val Select',
                            description: '',
                            brick: {
                                kind: 'value',
                                widget: {
                                    type: 'select',
                                    options: ['Option1', 'Option2'],
                                    value: 'Option1',
                                },
                                colorsDefault: {
                                    background: '#ffcc00',
                                    foreground: '#000000',
                                    border: '#cc9900',
                                },
                                tooltipText: '',
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export default mockPaletteConfig;
