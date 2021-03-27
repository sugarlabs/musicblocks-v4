export class ItemNotFoundError<T> extends Error {
    defaultValue: T;
    constructor(message: string, defaultValue: T) {
        super(message);
        this.name = 'ItemNotFoundError';
        this.defaultValue = defaultValue;
    }
}
