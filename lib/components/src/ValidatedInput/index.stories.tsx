/**
 * @file Storybook stories for ValidatedInput component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ValidatedInput from './index';
import {
    TEMPO_SCHEMA,
    PITCH_SCHEMA,
    VOLUME_SCHEMA,
    NOTE_WITH_OCTAVE_SCHEMA,
} from '@sugarlabs/mb4-validation';

const meta: Meta<typeof ValidatedInput> = {
    title: 'Components/Validation/ValidatedInput',
    component: ValidatedInput,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        type: {
            control: 'select',
            options: ['text', 'number', 'range'],
        },
        validateOn: {
            control: 'select',
            options: ['change', 'blur', 'both'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Tempo input with validation.
 */
export const TempoInput: Story = {
    render: function TempoInputStory() {
        const [tempo, setTempo] = useState<number>(120);
        const [isValid, setIsValid] = useState(true);

        return (
            <div style={{ maxWidth: '300px' }}>
                <ValidatedInput
                    id="tempo"
                    label="Tempo (BPM)"
                    type="number"
                    value={tempo}
                    schema={TEMPO_SCHEMA}
                    onChange={(value, valid) => {
                        setTempo(value as number);
                        setIsValid(valid);
                    }}
                    validateOn="both"
                    min={10}
                    max={500}
                    allowSuggestion
                />
                <p style={{ marginTop: '16px', fontSize: '0.875rem' }}>
                    Current value: {tempo} | Valid: {isValid ? '✓' : '✗'}
                </p>
            </div>
        );
    },
};

/**
 * Pitch input with validation.
 */
export const PitchInput: Story = {
    render: function PitchInputStory() {
        const [pitch, setPitch] = useState<number>(60);

        return (
            <div style={{ maxWidth: '300px' }}>
                <ValidatedInput
                    id="pitch"
                    label="MIDI Pitch (0-127)"
                    type="number"
                    value={pitch}
                    schema={PITCH_SCHEMA}
                    onChange={(value) => setPitch(value as number)}
                    validateOn="change"
                    min={0}
                    max={127}
                />
            </div>
        );
    },
};

/**
 * Volume slider with validation.
 */
export const VolumeSlider: Story = {
    render: function VolumeSliderStory() {
        const [volume, setVolume] = useState<number>(80);

        return (
            <div style={{ maxWidth: '300px' }}>
                <ValidatedInput
                    id="volume"
                    label={`Volume: ${volume}%`}
                    type="range"
                    value={volume}
                    schema={VOLUME_SCHEMA}
                    onChange={(value) => setVolume(value as number)}
                    validateOn="change"
                    min={0}
                    max={100}
                />
            </div>
        );
    },
};

/**
 * Note input with text validation.
 */
export const NoteInput: Story = {
    render: function NoteInputStory() {
        const [note, setNote] = useState<string>('C4');

        return (
            <div style={{ maxWidth: '300px' }}>
                <ValidatedInput
                    id="note"
                    label="Note (e.g., C4, Bb3, F#5)"
                    type="text"
                    value={note}
                    schema={NOTE_WITH_OCTAVE_SCHEMA}
                    onChange={(value) => setNote(value as string)}
                    validateOn="blur"
                    placeholder="Enter a note..."
                    allowSuggestion
                />
            </div>
        );
    },
};

/**
 * Multiple inputs in a form.
 */
export const MusicBlockForm: Story = {
    render: function MusicBlockFormStory() {
        const [formData, setFormData] = useState({
            tempo: 120,
            pitch: 60,
            volume: 80,
            note: 'C4',
        });

        const updateField = (field: string) => (value: string | number) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        };

        return (
            <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0 }}>Play Note Block</h3>

                <ValidatedInput
                    id="tempo"
                    label="Tempo (BPM)"
                    type="number"
                    value={formData.tempo}
                    schema={TEMPO_SCHEMA}
                    onChange={updateField('tempo')}
                    validateOn="blur"
                />

                <ValidatedInput
                    id="pitch"
                    label="MIDI Pitch"
                    type="number"
                    value={formData.pitch}
                    schema={PITCH_SCHEMA}
                    onChange={updateField('pitch')}
                    validateOn="blur"
                />

                <ValidatedInput
                    id="volume"
                    label="Volume (%)"
                    type="number"
                    value={formData.volume}
                    schema={VOLUME_SCHEMA}
                    onChange={updateField('volume')}
                    validateOn="blur"
                />

                <ValidatedInput
                    id="note"
                    label="Note"
                    type="text"
                    value={formData.note}
                    schema={NOTE_WITH_OCTAVE_SCHEMA}
                    onChange={updateField('note')}
                    validateOn="blur"
                />

                <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '0.875rem' }}>
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
        );
    },
};
