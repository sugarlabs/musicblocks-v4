/*
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { INamedError, IDefaultError } from './@types/errors';

/**
 * Abstract Error subclass that encapsulates a name with the error.
 */
abstract class NamedError extends Error implements INamedError {
    private _name: string;

    /**
     * @param name - Custom name of the `Error` instance.
     * @param message - Error message.
     */
    constructor(name: string, message: string) {
        super(message);
        this._name = name;
    }

    /** Custom name of the `Error` instance. */
    public get name(): string {
        return this._name;
    }
}

/**
 * Abstract NamedError subclass that encapsulates a default value along with the name.
 */
abstract class DefaultError<T> extends NamedError implements IDefaultError<T> {
    private _defaultValue: T;

    /**
     * @param name - Custom name of the `Error` instance.
     * @param message - Error message.
     * @param defaultValue - Default value bundled with the error.
     */
    constructor(name: string, message: string, defaultValue: T) {
        super(name, message);
        this._defaultValue = defaultValue;
    }

    /** Default value bundled with the error. */
    public get defaultValue(): T {
        return this._defaultValue;
    }
}

/**
 * Sub-class of Error whose instance is thrown when a method is supposed to expect or return an item
 * which it can't find (or doesn't exist).
 */
export class ItemNotFoundError<T> extends NamedError {
    /**
     * @param message - Error message.
     */
    constructor(message: string) {
        super('ItemNotFoundError', message);
    }
}

/**
 * Sub-class of Error whose instance is thrown when a method is supposed to expect or return an item
 * which it can't find (or doesn't exist).
 */
export class ItemNotFoundDefaultError<T> extends DefaultError<T> {
    /**
     * @param message - Error message.
     * @param defaultValue - Default value bundled with the error.
     */
    constructor(message: string, defaultValue: T) {
        super('ItemNotFoundError', message, defaultValue);
    }
}

/**
 * Sub-class of NamedError whose instance is thrown when a method is supposed to expect a specific
 * kind (or format) of one or more arguments but it receives otherwise.
 */
export class InvalidArgumentError extends NamedError {
    /**
     * @param message - Error message.
     */
    constructor(message: string) {
        super('InvalidArgumentError', message);
    }
}

/**
 * Sub-class of DefaultError whose instance is thrown when a method is supposed to expect a specific
 * kind (or format) of one or more arguments but it receives otherwise.
 */
export class InvalidArgumentDefaultError<T> extends DefaultError<T> {
    /**
     * @param message - Error message.
     * @param defaultValue - Default value bundled with the error.
     */
    constructor(message: string, defaultValue: T) {
        super('InvalidArgumentError', message, defaultValue);
    }
}
