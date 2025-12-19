/**
 * @file Storybook stories for ValidationError component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import ValidationError from './index';

const meta: Meta<typeof ValidationError> = {
    title: 'Components/Validation/ValidationError',
    component: ValidationError,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        result: {
            description: 'The validation result to display',
        },
        showWhenValid: {
            control: 'boolean',
            description: 'Whether to show the component when validation passes',
        },
        showSuggestion: {
            control: 'boolean',
            description: 'Whether to show the suggestion',
        },
        showDetails: {
            control: 'boolean',
            description: 'Whether to show the details',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Shows an error message for invalid input.
 */
export const Invalid: Story = {
    args: {
        result: {
            isValid: false,
            status: 'invalid',
            message: 'Tempo must be between 10 and 500 BPM. You entered: -50',
            suggestion: 10,
            details: 'Valid range: 10 to 500 BPM.',
        },
        showSuggestion: true,
        showDetails: true,
    },
};

/**
 * Shows a success message for valid input.
 */
export const Valid: Story = {
    args: {
        result: {
            isValid: true,
            status: 'valid',
            message: 'Valid tempo: 120 BPM',
        },
        showWhenValid: true,
    },
};

/**
 * Shows a warning message.
 */
export const Warning: Story = {
    args: {
        result: {
            isValid: true,
            status: 'warning',
            message: 'Tempo is very fast. Consider using a slower tempo for beginners.',
            details: 'Recommended range: 60 to 180 BPM.',
        },
        showWhenValid: true,
        showDetails: true,
    },
};

/**
 * Error with clickable suggestion.
 */
export const WithClickableSuggestion: Story = {
    args: {
        result: {
            isValid: false,
            status: 'invalid',
            message: 'Invalid note name.',
            suggestion: 'C4',
            details: 'Valid format: Note letter (A-G) with optional accidental (# or b) + octave (0-9).',
        },
        showSuggestion: true,
        showDetails: true,
        onSuggestionClick: (value) => {
            alert(`Suggestion clicked: ${value}`);
        },
    },
};

/**
 * Compact inline variant.
 */
export const InlineCompact: Story = {
    args: {
        result: {
            isValid: false,
            status: 'invalid',
            message: 'Volume must be between 0 and 100%.',
            suggestion: 100,
        },
        className: 'validation-message-inline validation-message-compact',
    },
};

/**
 * Multiple errors example (showing different states).
 */
export const MultipleStates: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ValidationError
                result={{
                    isValid: false,
                    status: 'invalid',
                    message: 'Pitch must be between 0 and 127. You entered: 150',
                    suggestion: 127,
                    details: 'MIDI pitch values range from 0 (C-1) to 127 (G9).',
                }}
                showSuggestion
                showDetails
            />
            <ValidationError
                result={{
                    isValid: true,
                    status: 'warning',
                    message: 'Very high pitch. May be difficult to hear.',
                }}
                showWhenValid
            />
            <ValidationError
                result={{
                    isValid: true,
                    status: 'valid',
                    message: 'Valid pitch: 60 (Middle C)',
                }}
                showWhenValid
            />
        </div>
    ),
};
