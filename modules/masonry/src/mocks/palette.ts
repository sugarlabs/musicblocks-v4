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
    Shapes,
    SlidersHorizontal,
    SquareFunction,
    ToggleLeft,
    Users,
    Volume2,
    Waves,
} from 'lucide-react';

import type { BrickViewProps } from '@/@types/brick.types';
import type { PaletteConfig } from '@/@types/palette.types';

// -------------------------------------------------------------------------------------------------

// The palette shell never renders these `brick` configs (bricks show as placeholders), so each is a
// minimal but VALID `BrickViewProps` stub that exists only to satisfy the type. A later PR will feed
// real brick definitions here.

/** Builds a minimal valid `statement` brick stub (kind/widget/colorsDefault/tooltipText only). */
const stubBrick = (text: string, bg: string): BrickViewProps => ({
    kind: 'statement',
    widget: { type: 'label', text },
    colorsDefault: { background: bg, foreground: '#ffffff', border: '#00000033' },
    tooltipText: text,
});

/** Builds a minimal valid `value` brick stub (used for terminal / read-out entries). */
const stubValueBrick = (text: string, bg: string): BrickViewProps => ({
    kind: 'value',
    widget: { type: 'label', text },
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
                            brick: stubBrick('Note', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.rest.1',
                            name: 'Rest',
                            description: 'Silence for a given duration',
                            brick: stubBrick('Rest', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.dot.1',
                            name: 'Dotted Note',
                            description: 'Extend a note duration by half',
                            brick: stubBrick('Dotted Note', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.tie.1',
                            name: 'Tie',
                            description: 'Tie contained notes into one sustained note',
                            brick: stubBrick('Tie', '#e07a5f'),
                        },
                        {
                            id: 'rhythm.tuplet.1',
                            name: 'Tuplet',
                            description: 'Fit contained notes evenly into a duration',
                            brick: stubBrick('Tuplet', '#e07a5f'),
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
                            brick: stubBrick('Meter', '#d1603f'),
                        },
                        {
                            id: 'meter.beat.1',
                            name: 'On Every Beat',
                            description: 'Run contained bricks on every beat',
                            brick: stubBrick('On Every Beat', '#d1603f'),
                        },
                        {
                            id: 'meter.strongbeat.1',
                            name: 'On Strong Beat',
                            description: 'Run contained bricks on a specified strong beat',
                            brick: stubBrick('On Strong Beat', '#d1603f'),
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
                            brick: stubBrick('Beats Per Minute', '#d1603f'),
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
                            brick: stubBrick('Pitch', '#3d84a8'),
                        },
                        {
                            id: 'pitch.solfege.1',
                            name: 'Solfege',
                            description: 'Choose a solfege syllable such as do, re, or mi',
                            brick: stubBrick('Solfege', '#3d84a8'),
                        },
                        {
                            id: 'pitch.hertz.1',
                            name: 'Hertz',
                            description: 'Play a pitch at a specific frequency in hertz',
                            brick: stubBrick('Hertz', '#3d84a8'),
                        },
                        {
                            id: 'pitch.notename.1',
                            name: 'Note Name',
                            description: 'Choose a pitch by its letter name and accidental',
                            brick: stubBrick('Note Name', '#3d84a8'),
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
                            brick: stubBrick('Scalar Interval', '#2c6e91'),
                        },
                        {
                            id: 'intervals.semitone.1',
                            name: 'Semitone Interval',
                            description: 'Add a semitone interval to contained pitches',
                            brick: stubBrick('Semitone Interval', '#2c6e91'),
                        },
                        {
                            id: 'intervals.transpose.1',
                            name: 'Transpose',
                            description: 'Shift contained pitches up or down by steps',
                            brick: stubBrick('Transpose', '#2c6e91'),
                        },
                        {
                            id: 'intervals.octave.1',
                            name: 'Set Octave',
                            description: 'Set the octave for contained pitches',
                            brick: stubBrick('Set Octave', '#2c6e91'),
                        },
                        {
                            id: 'intervals.mode.1',
                            name: 'Set Mode',
                            description: 'Choose the musical mode used to interpret intervals',
                            brick: stubBrick('Set Mode', '#2c6e91'),
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
                            brick: stubBrick('Sharp', '#1f5c7a'),
                        },
                        {
                            id: 'tone.flat.1',
                            name: 'Flat',
                            description: 'Lower contained pitches by a semitone',
                            brick: stubBrick('Flat', '#1f5c7a'),
                        },
                        {
                            id: 'tone.glide.1',
                            name: 'Glide',
                            description: 'Glide smoothly between contained pitches',
                            brick: stubBrick('Glide', '#1f5c7a'),
                        },
                        {
                            id: 'tone.instrument.1',
                            name: 'Set Instrument',
                            description: 'Choose the instrument for contained notes',
                            brick: stubBrick('Set Instrument', '#1f5c7a'),
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
                            brick: stubBrick('Staccato', '#b08d1e'),
                        },
                        {
                            id: 'ornament.slur.1',
                            name: 'Slur',
                            description: 'Play contained notes smoothly connected',
                            brick: stubBrick('Slur', '#b08d1e'),
                        },
                        {
                            id: 'ornament.accent.1',
                            name: 'Accent',
                            description: 'Emphasize contained notes',
                            brick: stubBrick('Accent', '#b08d1e'),
                        },
                        {
                            id: 'ornament.envelope.1',
                            name: 'Envelope',
                            description: 'Shape the attack and release of contained notes',
                            brick: stubBrick('Envelope', '#b08d1e'),
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
                            brick: stubBrick('Set Volume', '#c9a227'),
                        },
                        {
                            id: 'volume.crescendo.1',
                            name: 'Crescendo',
                            description: 'Gradually increase volume over contained notes',
                            brick: stubBrick('Crescendo', '#c9a227'),
                        },
                        {
                            id: 'volume.decrescendo.1',
                            name: 'Decrescendo',
                            description: 'Gradually decrease volume over contained notes',
                            brick: stubBrick('Decrescendo', '#c9a227'),
                        },
                        {
                            id: 'volume.pan.1',
                            name: 'Pan',
                            description: 'Position the sound in the stereo field',
                            brick: stubBrick('Pan', '#c9a227'),
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
                            brick: stubBrick('Play Drum', '#977818'),
                        },
                        {
                            id: 'drum.setdrum.1',
                            name: 'Set Drum',
                            description: 'Map contained notes onto a drum sound',
                            brick: stubBrick('Set Drum', '#977818'),
                        },
                        {
                            id: 'drum.noise.1',
                            name: 'Play Noise',
                            description: 'Play a noise generator sound',
                            brick: stubBrick('Play Noise', '#977818'),
                        },
                        {
                            id: 'drum.mappitch.1',
                            name: 'Map Pitch To Drum',
                            description: 'Replace contained pitches with a drum sound',
                            brick: stubBrick('Map Pitch To Drum', '#977818'),
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
                            brick: stubBrick('Piano Roll', '#8a6f14'),
                        },
                        {
                            id: 'widgets.rhythmmaker.1',
                            name: 'Rhythm Maker',
                            description: 'Open the rhythm maker widget to build beats',
                            brick: stubBrick('Rhythm Maker', '#8a6f14'),
                        },
                        {
                            id: 'widgets.tuner.1',
                            name: 'Tuner',
                            description: 'Open the tuner widget to adjust temperament',
                            brick: stubBrick('Tuner', '#8a6f14'),
                        },
                        {
                            id: 'widgets.oscilloscope.1',
                            name: 'Oscilloscope',
                            description: 'Open the oscilloscope widget to view waveforms',
                            brick: stubBrick('Oscilloscope', '#8a6f14'),
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
                            brick: stubBrick('Repeat', '#81b29a'),
                        },
                        {
                            id: 'flow.forever.1',
                            name: 'Forever',
                            description: 'Repeat contained bricks indefinitely',
                            brick: stubBrick('Forever', '#81b29a'),
                        },
                        {
                            id: 'flow.while.1',
                            name: 'While',
                            description: 'Repeat contained bricks while a condition holds',
                            brick: stubBrick('While', '#81b29a'),
                        },
                        {
                            id: 'flow.until.1',
                            name: 'Until',
                            description: 'Repeat contained bricks until a condition holds',
                            brick: stubBrick('Until', '#81b29a'),
                        },
                        {
                            id: 'flow.if.1',
                            name: 'If',
                            description: 'Run contained bricks when a condition is true',
                            brick: stubBrick('If', '#81b29a'),
                        },
                        {
                            id: 'flow.ifelse.1',
                            name: 'If Else',
                            description: 'Branch between two blocks based on a condition',
                            brick: stubBrick('If Else', '#81b29a'),
                        },
                        {
                            id: 'flow.wait.1',
                            name: 'Wait',
                            description: 'Pause for a given number of seconds',
                            brick: stubBrick('Wait', '#81b29a'),
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
                            brick: stubBrick('Start', '#6a9c82'),
                        },
                        {
                            id: 'action.action.1',
                            name: 'Action',
                            description: 'Define a reusable named action',
                            brick: stubBrick('Action', '#6a9c82'),
                        },
                        {
                            id: 'action.do.1',
                            name: 'Do',
                            description: 'Call a named action by name',
                            brick: stubBrick('Do', '#6a9c82'),
                        },
                        {
                            id: 'action.dispatch.1',
                            name: 'Broadcast',
                            description: 'Broadcast an event to listeners',
                            brick: stubBrick('Broadcast', '#6a9c82'),
                        },
                        {
                            id: 'action.listen.1',
                            name: 'On Event',
                            description: 'Run contained bricks when an event is received',
                            brick: stubBrick('On Event', '#6a9c82'),
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
                            brick: stubBrick('Store In Box', '#568a70'),
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
                            brick: stubBrick('Add To Box', '#568a70'),
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
                            brick: stubValueBrick('Number', '#5a8d73'),
                        },
                        {
                            id: 'number.add.1',
                            name: 'Add',
                            description: 'Add two numbers together',
                            brick: stubValueBrick('Add', '#5a8d73'),
                        },
                        {
                            id: 'number.subtract.1',
                            name: 'Subtract',
                            description: 'Subtract one number from another',
                            brick: stubValueBrick('Subtract', '#5a8d73'),
                        },
                        {
                            id: 'number.multiply.1',
                            name: 'Multiply',
                            description: 'Multiply two numbers together',
                            brick: stubValueBrick('Multiply', '#5a8d73'),
                        },
                        {
                            id: 'number.divide.1',
                            name: 'Divide',
                            description: 'Divide one number by another',
                            brick: stubValueBrick('Divide', '#5a8d73'),
                        },
                        {
                            id: 'number.random.1',
                            name: 'Random',
                            description: 'A random number within a range',
                            brick: stubValueBrick('Random', '#5a8d73'),
                        },
                    ],
                },
                {
                    name: 'Boolean',
                    icon: ToggleLeft,
                    color: '#3d6b54',
                    bricks: [
                        {
                            id: 'boolean.equal.1',
                            name: 'Equals',
                            description: 'True when two values are equal',
                            brick: stubValueBrick('Equals', '#4d7b64'),
                        },
                        {
                            id: 'boolean.greater.1',
                            name: 'Greater Than',
                            description: 'True when the first value exceeds the second',
                            brick: stubValueBrick('Greater Than', '#4d7b64'),
                        },
                        {
                            id: 'boolean.less.1',
                            name: 'Less Than',
                            description: 'True when the first value is below the second',
                            brick: stubValueBrick('Less Than', '#4d7b64'),
                        },
                        {
                            id: 'boolean.and.1',
                            name: 'And',
                            description: 'True when both conditions are true',
                            brick: stubValueBrick('And', '#4d7b64'),
                        },
                        {
                            id: 'boolean.or.1',
                            name: 'Or',
                            description: 'True when either condition is true',
                            brick: stubValueBrick('Or', '#4d7b64'),
                        },
                        {
                            id: 'boolean.not.1',
                            name: 'Not',
                            description: 'Invert a boolean value',
                            brick: stubValueBrick('Not', '#4d7b64'),
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
                            brick: stubBrick('Push', '#2f5b45'),
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
                            brick: stubBrick('Set Heap Entry', '#2f5b45'),
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
                            brick: stubBrick('Forward', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.back.1',
                            name: 'Back',
                            description: 'Move the turtle backward by a distance',
                            brick: stubBrick('Back', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.right.1',
                            name: 'Right',
                            description: 'Turn the turtle clockwise by an angle',
                            brick: stubBrick('Right', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.left.1',
                            name: 'Left',
                            description: 'Turn the turtle counter-clockwise by an angle',
                            brick: stubBrick('Left', '#9d6bb3'),
                        },
                        {
                            id: 'graphics.setxy.1',
                            name: 'Set XY',
                            description: 'Move the turtle to specific coordinates',
                            brick: stubBrick('Set XY', '#9d6bb3'),
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
                            brick: stubBrick('Pen Up', '#865a9c'),
                        },
                        {
                            id: 'pen.pendown.1',
                            name: 'Pen Down',
                            description: 'Lower the pen so movement draws a trail',
                            brick: stubBrick('Pen Down', '#865a9c'),
                        },
                        {
                            id: 'pen.color.1',
                            name: 'Set Color',
                            description: 'Set the pen color',
                            brick: stubBrick('Set Color', '#865a9c'),
                        },
                        {
                            id: 'pen.size.1',
                            name: 'Set Pen Size',
                            description: 'Set the width of the pen stroke',
                            brick: stubBrick('Set Pen Size', '#865a9c'),
                        },
                        {
                            id: 'pen.fill.1',
                            name: 'Fill',
                            description: 'Fill the shape drawn by contained bricks',
                            brick: stubBrick('Fill', '#865a9c'),
                        },
                        {
                            id: 'pen.background.1',
                            name: 'Set Background',
                            description: 'Set the canvas background color',
                            brick: stubBrick('Set Background', '#865a9c'),
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
                            brick: stubBrick('Show Text', '#6f4885'),
                        },
                        {
                            id: 'media.showimage.1',
                            name: 'Show Image',
                            description: 'Display an image on the canvas',
                            brick: stubBrick('Show Image', '#6f4885'),
                        },
                        {
                            id: 'media.speak.1',
                            name: 'Speak',
                            description: 'Speak text aloud using text-to-speech',
                            brick: stubBrick('Speak', '#6f4885'),
                        },
                        {
                            id: 'media.snapshot.1',
                            name: 'Take Snapshot',
                            description: 'Capture the current canvas as an image',
                            brick: stubBrick('Take Snapshot', '#6f4885'),
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
                            brick: stubBrick('New Turtle', '#4a2f5c'),
                        },
                        {
                            id: 'ensemble.switch.1',
                            name: 'Switch Turtle',
                            description: 'Run contained bricks on a chosen turtle',
                            brick: stubBrick('Switch Turtle', '#4a2f5c'),
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
                            brick: stubBrick('Sync Turtles', '#4a2f5c'),
                        },
                    ],
                },
            ],
        },
    ],
};

export default mockPaletteConfig;
