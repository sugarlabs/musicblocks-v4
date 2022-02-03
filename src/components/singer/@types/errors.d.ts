/*
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/**
 * Interface for Error subclasses that excapsulate an error name.
 *
 * @remarks
 * Named error instances are to be used throughout the codebase.
 */
export interface INamedError extends Error {
    name: string;
}

/**
 * Generic type interface for the Error subclasses that bundle in a default value with the name.
 */
export interface IDefaultError<T> extends INamedError {
    defaultValue: T;
}
