abstract class SyntaxError extends Error {
    private _name: string;
    private _message: string;

    constructor(name: string, message: string) {
        super(message);
        this._name = name;
        this._message = message;
    }

    public toString(): string {
        return `${this._name}: ${this._message}`;
    }

    public get type(): string {
        return this._name;
    }
}

export class InvalidInstructionError extends SyntaxError {
    constructor(message: string) {
        super('InvalidInstructionError', message);
    }
}

export class InvalidArgumentError extends SyntaxError {
    constructor(message: string) {
        super('InvalidArgumentError', message);
    }
}
