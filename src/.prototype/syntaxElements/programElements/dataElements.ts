import { TPrimitiveName } from '../@types/primitiveTypes';
import { TChar, TFloat, TInt, TString } from '../primitiveElements';
import { ArgumentElement, StatementElement } from '../structureElements';
import { ValueElement } from './valueElements';

type argType = ArgumentElement | null;
type valueType =
    | ValueElement.IntElement
    | ValueElement.FloatElement
    | ValueElement.CharElement
    | ValueElement.StringElement
    | ValueElement.TrueElement
    | ValueElement.FalseElement;

export namespace DataElement {
    abstract class DataElement extends StatementElement {
        protected _valueElement: valueType | null = null;

        constructor(identifier: string, valueConstraints: TPrimitiveName[]) {
            super(identifier, {
                identifier: ['TString'],
                value: valueConstraints
            });
        }

        /** @throws Invalid argument */
        set argIdentifier(identifier: argType) {
            this.args.setArg('identifier', identifier);
        }

        get argIdentifier() {
            return this.args.getArg('identifier');
        }

        /** @throws Invalid argument */
        set argValue(value: argType) {
            this.args.setArg('value', value);
        }

        get argValue() {
            return this.args.getArg('value');
        }

        get valueElement() {
            return this._valueElement;
        }

        abstract onVisit(): void;
    }

    export class IntDataElement extends DataElement {
        constructor() {
            super('data-int', ['TInt']);
        }

        onVisit() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                this._valueElement = new ValueElement.IntElement((arg.data as TInt).value);
                this._valueElement.dataElement = this;
            }
        }
    }

    export class FloatDataElement extends DataElement {
        constructor() {
            super('data-float', ['TFloat']);
        }

        onVisit() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                this._valueElement = new ValueElement.FloatElement((arg.data as TFloat).value);
                this._valueElement.dataElement = this;
            }
        }
    }

    export class CharDataElement extends DataElement {
        constructor() {
            super('data-char', ['TChar']);
        }

        onVisit() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                this._valueElement = new ValueElement.CharElement((arg.data as TChar).value);
                this._valueElement.dataElement = this;
            }
        }
    }

    export class StringDataElement extends DataElement {
        constructor() {
            super('data-string', ['TString']);
        }

        onVisit() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                this._valueElement = new ValueElement.StringElement((arg.data as TString).value);
                this._valueElement.dataElement = this;
            }
        }
    }

    export class BooleanDataElement extends DataElement {
        constructor() {
            super('data-boolean', ['TBoolean']);
        }

        onVisit() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                this._valueElement = arg.data.value
                    ? new ValueElement.TrueElement()
                    : new ValueElement.FalseElement();
                this._valueElement.dataElement = this;
            }
        }
    }

    export class AnyDataElement extends DataElement {
        constructor() {
            super('data-any', ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']);
        }

        onVisit() {
            const argValue = this.argValue;
            if (argValue === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                const arg = argValue.data;
                if (arg instanceof TInt) {
                    this._valueElement = new ValueElement.IntElement(arg.value);
                } else if (arg instanceof TFloat) {
                    this._valueElement = new ValueElement.FloatElement(arg.value);
                } else if (arg instanceof TChar) {
                    this._valueElement = new ValueElement.CharElement(arg.value);
                } else if (arg instanceof TString) {
                    this._valueElement = new ValueElement.StringElement(arg.value);
                } else {
                    this._valueElement = arg.value
                        ? new ValueElement.TrueElement()
                        : new ValueElement.FalseElement();
                }
                this._valueElement.dataElement = this;
            }
        }
    }
}
