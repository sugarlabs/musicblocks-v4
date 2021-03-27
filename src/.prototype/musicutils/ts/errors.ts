export class ItemNotFoundError<T> extends Error {
    defaultValue: T;
    constructor(message: string, defaultValue: T) {
        super(message);
        this.name = 'ItemNotFoundError';
        this.defaultValue = defaultValue;
    }
}

export class InvalidArgumentError<T> extends Error {
    defaultValue: T;
    constructor(message: string, defaultValue: T) {
        super(message);
        this.name = 'InvalidArgumentError';
        this.defaultValue = defaultValue;
    }
}
