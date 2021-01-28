import { TPrimitiveName } from '../@types/primitiveTypes';
import { TBoolean, TChar, TFloat, TInt, TString } from '../primitiveElements';
import { ArgumentElement, StatementElement } from '../structureElements';
import { ValueElement } from './valueElements';

type argType = ArgumentElement | null;
type dataValueType =
    | ValueElement.IntDataValueElement
    | ValueElement.FloatDataValueElement
    | ValueElement.CharDataValueElement
    | ValueElement.StringDataValueElement
    | ValueElement.BooleanDataValueElement;

export namespace DataElement {
    abstract class DataElement extends StatementElement {
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

        abstract get valueElement(): dataValueType | null;

        abstract onVisit(): void;
    }

    export class IntDataElement extends DataElement {
        constructor() {
            super('data-int', ['TInt']);
        }

        get valueElement() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                return new ValueElement.IntDataValueElement(arg.data as TInt);
            }
        }

        onVisit() {}
    }

    export class FloatDataElement extends DataElement {
        constructor() {
            super('data-float', ['TFloat']);
        }

        get valueElement() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                return new ValueElement.FloatDataValueElement(arg.data as TFloat);
            }
        }

        onVisit() {}
    }

    export class CharDataElement extends DataElement {
        constructor() {
            super('data-char', ['TChar']);
        }

        get valueElement() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                return new ValueElement.CharDataValueElement(arg.data as TChar);
            }
        }

        onVisit() {}
    }

    export class StringDataElement extends DataElement {
        constructor() {
            super('data-string', ['TString']);
        }

        get valueElement() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                return new ValueElement.StringDataValueElement(arg.data as TString);
            }
        }

        onVisit() {}
    }

    export class BooleanDataElement extends DataElement {
        constructor() {
            super('data-boolean', ['TBoolean']);
        }

        get valueElement() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                return new ValueElement.BooleanDataValueElement(arg.data as TBoolean);
            }
        }

        onVisit() {}
    }

    export class AnyDataElement extends DataElement {
        constructor() {
            super('data-any', ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']);
        }

        get valueElement() {
            const argValue = this.argValue;
            if (argValue === null) {
                throw Error('Invalid argument: value cannot be null');
            } else {
                const arg = argValue.data;
                if (arg instanceof TInt) {
                    return new ValueElement.IntDataValueElement(arg as TInt);
                } else if (arg instanceof TFloat) {
                    return new ValueElement.FloatDataValueElement(arg as TFloat);
                } else if (arg instanceof TChar) {
                    return new ValueElement.CharDataValueElement(arg as TChar);
                } else if (arg instanceof TString) {
                    return new ValueElement.StringDataValueElement(arg as TString);
                } else {
                    return new ValueElement.BooleanDataValueElement(arg as TBoolean);
                }
            }
        }

        onVisit() {}
    }

    abstract class UpdateDataElement extends StatementElement {
        constructor(
            elementName: string,
            constraints: {
                currValue: [TPrimitiveName];
                newValue: [TPrimitiveName];
            }
        ) {
            super(elementName, constraints);
        }

        set argCurrValue(value: dataValueType | null) {
            this.args.setArg('currValue', value);
        }

        get argCurrValue() {
            return this.args.getArg('currValue') as dataValueType;
        }

        set argNewValue(value: dataValueType | null) {
            this.args.setArg('newValue', value);
        }

        get argNewValue() {
            return this.args.getArg('newValue') as dataValueType;
        }

        onVisit() {
            const argCurr = this.argCurrValue;
            const argNew = this.argNewValue;
            if (argCurr !== null && argNew !== null) {
                argCurr.data.value = argNew.data.value;
            }
        }
    }

    export class UpdateIntDataElement extends UpdateDataElement {
        constructor() {
            super('update-data-int', {
                currValue: ['TInt'],
                newValue: ['TInt']
            });
        }
    }

    export class UpdateFloatDataElement extends UpdateDataElement {
        constructor() {
            super('update-data-int', {
                currValue: ['TFloat'],
                newValue: ['TFloat']
            });
        }
    }

    export class UpdateCharDataElement extends UpdateDataElement {
        constructor() {
            super('update-data-int', {
                currValue: ['TChar'],
                newValue: ['TChar']
            });
        }
    }

    export class UpdateStringDataElement extends UpdateDataElement {
        constructor() {
            super('update-data-int', {
                currValue: ['TString'],
                newValue: ['TString']
            });
        }
    }

    export class UpdateBooleanDataElement extends UpdateDataElement {
        constructor() {
            super('update-data-int', {
                currValue: ['TBoolean'],
                newValue: ['TBoolean']
            });
        }
    }
}
