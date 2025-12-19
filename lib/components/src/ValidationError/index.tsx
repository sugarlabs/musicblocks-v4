/**
 * @file Validation Error display component.
 *
 * A reusable React component for displaying validation error messages
 * with visual feedback, suggestions, and valid input ranges.
 */

import type { JSX } from 'react';
import type { IValidationResult } from '#/@types/validation';

import './index.scss';

// -- Component Definition -------------------------------------------------------------------------

/**
 * Props for the ValidationError component.
 */
export interface IValidationErrorProps {
    /** The validation result to display. */
    result: IValidationResult;
    /** Unique identifier for accessibility. */
    id?: string;
    /** Whether to show the component even when valid. */
    showWhenValid?: boolean;
    /** Custom class name. */
    className?: string;
    /** Whether to show the suggestion. */
    showSuggestion?: boolean;
    /** Whether to show the details. */
    showDetails?: boolean;
    /** Callback when suggestion is clicked. */
    onSuggestionClick?: (suggestion: string | number) => void;
}

/**
 * React component for displaying validation errors, warnings, and success messages.
 *
 * @example
 * ```tsx
 * <ValidationError
 *   result={validationResult}
 *   id="tempo-error"
 *   showSuggestion
 *   onSuggestionClick={(value) => setTempo(value)}
 * />
 * ```
 */
export default function ValidationError(props: IValidationErrorProps): JSX.Element | null {
    const {
        result,
        id,
        showWhenValid = false,
        className = '',
        showSuggestion = true,
        showDetails = true,
        onSuggestionClick,
    } = props;

    // Don't render if valid and showWhenValid is false
    if (result.isValid && !showWhenValid) {
        return null;
    }

    const statusClass = `validation-message validation-message-${result.status}`;
    const combinedClassName = `${statusClass} ${className}`.trim();

    const handleSuggestionClick = () => {
        if (result.suggestion !== undefined && onSuggestionClick) {
            onSuggestionClick(result.suggestion);
        }
    };

    return (
        <div className={combinedClassName} id={id} role={result.isValid ? 'status' : 'alert'}>
            {/* Status icon */}
            <span className="validation-message-icon" aria-hidden="true">
                {result.status === 'valid' && '✓'}
                {result.status === 'invalid' && '✕'}
                {result.status === 'warning' && '⚠'}
            </span>

            {/* Message content */}
            <div className="validation-message-content">
                {result.message && (
                    <span className="validation-message-text">{result.message}</span>
                )}

                {/* Suggestion */}
                {showSuggestion && result.suggestion !== undefined && (
                    <span className="validation-message-suggestion">
                        {onSuggestionClick ? (
                            <button
                                type="button"
                                className="validation-suggestion-btn"
                                onClick={handleSuggestionClick}
                            >
                                Use suggested value: <strong>{result.suggestion}</strong>
                            </button>
                        ) : (
                            <>
                                Suggested value: <strong>{result.suggestion}</strong>
                            </>
                        )}
                    </span>
                )}

                {/* Details */}
                {showDetails && result.details && (
                    <span className="validation-message-details">{result.details}</span>
                )}
            </div>
        </div>
    );
}
