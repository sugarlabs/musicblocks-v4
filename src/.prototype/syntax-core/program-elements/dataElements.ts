import { TPrimitive, TPrimitiveName } from '../@types/primitiveTypes';
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
        private _type: TPrimitiveName;

        constructor(identifier: string, type: TPrimitiveName) {
            super(identifier, false, {
                identifier: ['TString'],
                value: [type]
            });
            this._type = type;
        }

        get type() {
            return this._type;
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

        abstract get valueElement(): dataValueType;

        abstract get dataElementRef(): TPrimitive;

        abstract onVisit(): void;
    }

    export class IntDataElement extends DataElement {
        constructor() {
            super('data-int', 'TInt');
        }

        get valueElement() {
            return new ValueElement.IntDataValueElement(this);
        }

        get dataElementRef() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Value cannot be null.');
            } else {
                return arg.getData() as TInt;
            }
        }

        onVisit() {}
    }

    export class FloatDataElement extends DataElement {
        constructor() {
            super('data-float', 'TFloat');
        }

        get valueElement() {
            return new ValueElement.FloatDataValueElement(this);
        }

        get dataElementRef() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Value cannot be null.');
            } else {
                return arg.getData() as TFloat;
            }
        }

        onVisit() {}
    }

    export class CharDataElement extends DataElement {
        constructor() {
            super('data-char', 'TChar');
        }

        get valueElement() {
            return new ValueElement.CharDataValueElement(this);
        }

        get dataElementRef() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Value cannot be null.');
            } else {
                return arg.getData() as TChar;
            }
        }

        onVisit() {}
    }

    export class StringDataElement extends DataElement {
        constructor() {
            super('data-string', 'TString');
        }

        get valueElement() {
            return new ValueElement.StringDataValueElement(this);
        }

        get dataElementRef() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Value cannot be null.');
            } else {
                return arg.getData() as TString;
            }
        }

        onVisit() {}
    }

    export class BooleanDataElement extends DataElement {
        constructor() {
            super('data-boolean', 'TBoolean');
        }

        get valueElement() {
            return new ValueElement.BooleanDataValueElement(this);
        }

        get dataElementRef() {
            const arg = this.argValue;
            if (arg === null) {
                throw Error('Value cannot be null.');
            } else {
                return arg.getData() as TBoolean;
            }
        }

        onVisit() {}
    }

    // export class AnyDataElement extends DataElement {
    //     constructor() {
    //         super('data-any', ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']);
    //     }

    //     get valueElement() {
    //         return new ValueElement.IntDataValueElement(this);
    //     }

    //     get dataElementRef() {
    //         const argValue = this.argValue;
    //         if (argValue === null) {
    //             throw Error('Invalid argument: value cannot be null');
    //         } else {
    //             const arg = argValue.data;
    //             if (arg instanceof TInt) {
    //                 return arg as TInt;
    //             } else if (arg instanceof TFloat) {
    //                 return arg as TFloat;
    //             } else if (arg instanceof TChar) {
    //                 return arg as TChar;
    //             } else if (arg instanceof TString) {
    //                 return arg as TString;
    //             } else {
    //                 return arg as TBoolean;
    //             }
    //         }
    //     }

    //     onVisit() {}
    // }

    abstract class UpdateDataElement extends StatementElement {
        constructor(
            elementName: string,
            constraints: {
                currValue: [TPrimitiveName];
                newValue: [TPrimitiveName];
            }
        ) {
            super(elementName, false, constraints);
        }

        set argCurrValue(value: dataValueType | null) {
            this.args.setArg('currValue', value);
        }

        get argCurrValue() {
            return this.args.getArg('currValue') as dataValueType;
        }

        set argNewValue(value: ArgumentElement | null) {
            this.args.setArg('newValue', value);
        }

        get argNewValue() {
            return this.args.getArg('newValue');
        }

        onVisit() {
            const argCurr = this.argCurrValue;
            const argNew = this.argNewValue;
            if (argCurr !== null && argNew !== null) {
                argCurr.getData().value = argNew.getData().value;
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
