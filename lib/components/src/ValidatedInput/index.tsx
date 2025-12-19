/**
 * @file Validated Input component.
 *
 * A reusable React component that combines an input field with
 * real-time validation and error display.
 */

import type { JSX, ChangeEvent, FocusEvent } from 'react';
import type { IParameterValidationSchema, IValidationResult } from '#/@types/validation';

import { useState, useCallback, useEffect } from 'react';
import { validateParameter, createValidResult } from '@sugarlabs/mb4-validation';
import ValidationError from '../ValidationError';

import './index.scss';

// -- Types ----------------------------------------------------------------------------------------

export type TInputType = 'text' | 'number' | 'range';

export interface IValidatedInputProps {
    /** Unique identifier for the input. */
    id: string;
    /** Display label for the input. */
    label: string;
    /** Input type. */
    type?: TInputType;
    /** Current value. */
    value: string | number;
    /** Validation schema for the parameter. */
    schema: IParameterValidationSchema;
    /** Callback when value changes. */
    onChange: (value: string | number, isValid: boolean) => void;
    /** Callback when validation result changes. */
    onValidationChange?: (result: IValidationResult) => void;
    /** When to validate: 'change', 'blur', or 'both'. */
    validateOn?: 'change' | 'blur' | 'both';
    /** Whether to show validation message on valid state. */
    showValidMessage?: boolean;
    /** Whether the input is disabled. */
    disabled?: boolean;
    /** Placeholder text. */
    placeholder?: string;
    /** Additional class name. */
    className?: string;
    /** Minimum value (for number/range inputs). */
    min?: number;
    /** Maximum value (for number/range inputs). */
    max?: number;
    /** Step value (for number/range inputs). */
    step?: number;
    /** Whether to allow applying suggested values. */
    allowSuggestion?: boolean;
}

// -- Component Definition -------------------------------------------------------------------------

/**
 * React component for input fields with integrated validation.
 *
 * @example
 * ```tsx
 * <ValidatedInput
 *   id="tempo"
 *   label="Tempo"
 *   type="number"
 *   value={tempo}
 *   schema={TEMPO_SCHEMA}
 *   onChange={(value, isValid) => {
 *     setTempo(value);
 *     setIsValid(isValid);
 *   }}
 *   validateOn="both"
 *   allowSuggestion
 * />
 * ```
 */
export default function ValidatedInput(props: IValidatedInputProps): JSX.Element {
    const {
        id,
        label,
        type = 'text',
        value,
        schema,
        onChange,
        onValidationChange,
        validateOn = 'blur',
        showValidMessage = false,
        disabled = false,
        placeholder,
        className = '',
        min,
        max,
        step,
        allowSuggestion = true,
    } = props;

    const [validationResult, setValidationResult] = useState<IValidationResult>(createValidResult());
    const [touched, setTouched] = useState(false);
    const [displayValue, setDisplayValue] = useState<string | number>(value);

    // Sync display value with prop value
    useEffect(() => {
        setDisplayValue(value);
    }, [value]);

    const performValidation = useCallback(
        (val: string | number): IValidationResult => {
            const result = validateParameter(val, schema);
            setValidationResult(result);
            onValidationChange?.(result);
            return result;
        },
        [schema, onValidationChange],
    );

    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newValue = type === 'number' ? event.target.valueAsNumber : event.target.value;
            setDisplayValue(event.target.value);

            if (validateOn === 'change' || validateOn === 'both') {
                const result = performValidation(newValue);
                onChange(newValue, result.isValid);
            } else {
                onChange(newValue, validationResult.isValid);
            }
        },
        [type, validateOn, performValidation, onChange, validationResult.isValid],
    );

    const handleBlur = useCallback(
        (_event: FocusEvent<HTMLInputElement>) => {
            setTouched(true);
            if (validateOn === 'blur' || validateOn === 'both') {
                const result = performValidation(displayValue);
                onChange(displayValue, result.isValid);
            }
        },
        [validateOn, performValidation, displayValue, onChange],
    );

    const handleSuggestionClick = useCallback(
        (suggestion: string | number) => {
            setDisplayValue(suggestion);
            const result = performValidation(suggestion);
            onChange(suggestion, result.isValid);
        },
        [performValidation, onChange],
    );

    const inputClassName = [
        'validated-input-field',
        touched && !validationResult.isValid ? 'validated-input-invalid' : '',
        touched && validationResult.isValid ? 'validated-input-valid' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const showError = touched && (!validationResult.isValid || showValidMessage);

    return (
        <div className="validated-input">
            <label htmlFor={id} className="validated-input-label">
                {label}
            </label>

            <input
                id={id}
                type={type}
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled}
                placeholder={placeholder}
                className={inputClassName}
                min={min}
                max={max}
                step={step}
                aria-invalid={touched && !validationResult.isValid}
                aria-describedby={showError ? `${id}-error` : undefined}
            />

            {showError && (
                <ValidationError
                    result={validationResult}
                    id={`${id}-error`}
                    showWhenValid={showValidMessage}
                    showSuggestion={allowSuggestion}
                    onSuggestionClick={allowSuggestion ? handleSuggestionClick : undefined}
                    className="validation-message-inline"
                />
            )}
        </div>
    );
}
