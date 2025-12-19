/**
 * @file React hook for validation state management.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
    IValidationResult,
    IValidationState,
    IParameterValidationSchema,
    IBlockValidationSchema,
    TValidationTrigger,
} from '#/@types/validation';

import { validateParameter, validateBlock, createValidResult } from './index';

// -- Types ----------------------------------------------------------------------------------------

/** Configuration options for useValidation hook. */
export interface IUseValidationOptions {
    /** When to trigger validation. */
    validateOn?: TValidationTrigger[];
    /** Whether to validate on mount. */
    validateOnMount?: boolean;
    /** Custom error handler. */
    onError?: (errors: string[]) => void;
    /** Custom success handler. */
    onSuccess?: () => void;
}

/** Return type for useValidation hook for a single parameter. */
export interface IUseParameterValidationReturn {
    /** Current validation result. */
    result: IValidationResult;
    /** Whether the field has been touched. */
    touched: boolean;
    /** Whether the field is currently being validated. */
    isValidating: boolean;
    /** Validate the current value. */
    validate: (value: unknown) => IValidationResult;
    /** Handler for onChange events. */
    handleChange: (value: unknown) => void;
    /** Handler for onBlur events. */
    handleBlur: () => void;
    /** Reset validation state. */
    reset: () => void;
    /** CSS class for validation state. */
    className: string;
    /** Props to spread on input elements. */
    inputProps: {
        'aria-invalid': boolean;
        'aria-describedby': string | undefined;
    };
}

/** Return type for useValidation hook for a block. */
export interface IUseBlockValidationReturn {
    /** Current validation state. */
    state: IValidationState;
    /** Whether any field has been touched. */
    touched: Record<string, boolean>;
    /** Validate all fields. */
    validateAll: (values: Record<string, unknown>) => IValidationState;
    /** Validate a single field. */
    validateField: (name: string, value: unknown) => IValidationResult;
    /** Get validation result for a field. */
    getFieldResult: (name: string) => IValidationResult;
    /** Get props for a field. */
    getFieldProps: (name: string) => {
        className: string;
        'aria-invalid': boolean;
        'aria-describedby': string | undefined;
    };
    /** Handler for field change. */
    handleFieldChange: (name: string, value: unknown) => void;
    /** Handler for field blur. */
    handleFieldBlur: (name: string) => void;
    /** Reset all validation state. */
    reset: () => void;
    /** Whether the form is valid. */
    isValid: boolean;
    /** All error messages. */
    errors: string[];
}

// -- Single Parameter Validation Hook -------------------------------------------------------------

/**
 * React hook for validating a single parameter.
 * @param schema - The parameter validation schema.
 * @param initialValue - Initial value (optional).
 * @param options - Validation options.
 * @returns Validation utilities and state.
 */
export function useParameterValidation(
    schema: IParameterValidationSchema,
    initialValue?: unknown,
    options: IUseValidationOptions = {},
): IUseParameterValidationReturn {
    const { validateOn = ['blur'], onError, onSuccess } = options;

    const [result, setResult] = useState<IValidationResult>(() => {
        if (options.validateOnMount && initialValue !== undefined) {
            return validateParameter(initialValue, schema);
        }
        return createValidResult();
    });

    const [touched, setTouched] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [currentValue, setCurrentValue] = useState<unknown>(initialValue);

    const validate = useCallback(
        (value: unknown): IValidationResult => {
            setIsValidating(true);
            const validationResult = validateParameter(value, schema);
            setResult(validationResult);
            setIsValidating(false);

            if (!validationResult.isValid && onError) {
                onError([validationResult.message ?? 'Validation failed']);
            } else if (validationResult.isValid && onSuccess) {
                onSuccess();
            }

            return validationResult;
        },
        [schema, onError, onSuccess],
    );

    const handleChange = useCallback(
        (value: unknown) => {
            setCurrentValue(value);
            if (validateOn.includes('change')) {
                validate(value);
            }
        },
        [validateOn, validate],
    );

    const handleBlur = useCallback(() => {
        setTouched(true);
        if (validateOn.includes('blur')) {
            validate(currentValue);
        }
    }, [validateOn, validate, currentValue]);

    const reset = useCallback(() => {
        setResult(createValidResult());
        setTouched(false);
        setCurrentValue(initialValue);
    }, [initialValue]);

    const className = useMemo(() => {
        if (!touched) return '';
        if (result.isValid) return 'validation-valid';
        return 'validation-invalid';
    }, [touched, result.isValid]);

    const inputProps = useMemo(
        () => ({
            'aria-invalid': touched && !result.isValid,
            'aria-describedby': !result.isValid ? `${schema.name}-error` : undefined,
        }),
        [touched, result.isValid, schema.name],
    );

    return {
        result,
        touched,
        isValidating,
        validate,
        handleChange,
        handleBlur,
        reset,
        className,
        inputProps,
    };
}

// -- Block Validation Hook ------------------------------------------------------------------------

/**
 * React hook for validating an entire block with multiple parameters.
 * @param schema - The block validation schema.
 * @param initialValues - Initial values for all parameters.
 * @param options - Validation options.
 * @returns Validation utilities and state.
 */
export function useBlockValidation(
    schema: IBlockValidationSchema,
    initialValues: Record<string, unknown> = {},
    options: IUseValidationOptions = {},
): IUseBlockValidationReturn {
    const { validateOn = ['blur'], onError, onSuccess } = options;

    const [state, setState] = useState<IValidationState>(() => {
        if (options.validateOnMount) {
            return validateBlock(initialValues, schema);
        }
        return {
            isValid: true,
            results: {},
            errors: [],
            warnings: [],
        };
    });

    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [values, setValues] = useState<Record<string, unknown>>(initialValues);

    const validateAll = useCallback(
        (newValues: Record<string, unknown>): IValidationState => {
            const validationState = validateBlock(newValues, schema);
            setState(validationState);

            if (!validationState.isValid && onError) {
                onError(validationState.errors);
            } else if (validationState.isValid && onSuccess) {
                onSuccess();
            }

            return validationState;
        },
        [schema, onError, onSuccess],
    );

    const validateField = useCallback(
        (name: string, value: unknown): IValidationResult => {
            const paramSchema = schema.parameters[name];
            if (!paramSchema) {
                return createValidResult();
            }

            const result = validateParameter(value, paramSchema);

            setState((prev) => {
                const newResults = { ...prev.results, [name]: result };
                const newErrors = Object.values(newResults)
                    .filter((r) => !r.isValid && r.message)
                    .map((r) => r.message!);
                const newWarnings = Object.values(newResults)
                    .filter((r) => r.status === 'warning' && r.message)
                    .map((r) => r.message!);

                return {
                    isValid: newErrors.length === 0,
                    results: newResults,
                    errors: newErrors,
                    warnings: newWarnings,
                };
            });

            return result;
        },
        [schema],
    );

    const getFieldResult = useCallback(
        (name: string): IValidationResult => {
            return state.results[name] ?? createValidResult();
        },
        [state.results],
    );

    const getFieldProps = useCallback(
        (name: string) => {
            const result = getFieldResult(name);
            const isTouched = touched[name] ?? false;

            return {
                className: isTouched ? (result.isValid ? 'validation-valid' : 'validation-invalid') : '',
                'aria-invalid': isTouched && !result.isValid,
                'aria-describedby': !result.isValid ? `${name}-error` : undefined,
            };
        },
        [getFieldResult, touched],
    );

    const handleFieldChange = useCallback(
        (name: string, value: unknown) => {
            setValues((prev) => ({ ...prev, [name]: value }));
            if (validateOn.includes('change')) {
                validateField(name, value);
            }
        },
        [validateOn, validateField],
    );

    const handleFieldBlur = useCallback(
        (name: string) => {
            setTouched((prev) => ({ ...prev, [name]: true }));
            if (validateOn.includes('blur')) {
                validateField(name, values[name]);
            }
        },
        [validateOn, validateField, values],
    );

    const reset = useCallback(() => {
        setState({
            isValid: true,
            results: {},
            errors: [],
            warnings: [],
        });
        setTouched({});
        setValues(initialValues);
    }, [initialValues]);

    return {
        state,
        touched,
        validateAll,
        validateField,
        getFieldResult,
        getFieldProps,
        handleFieldChange,
        handleFieldBlur,
        reset,
        isValid: state.isValid,
        errors: state.errors,
    };
}

// -- Default export -------------------------------------------------------------------------------

export const useValidation = {
    parameter: useParameterValidation,
    block: useBlockValidation,
};
