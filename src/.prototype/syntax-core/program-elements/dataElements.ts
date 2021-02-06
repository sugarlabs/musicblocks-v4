import { TPrimitive, TPrimitiveName } from '../@types/primitiveTypes';
import { TString } from '../primitiveElements';
import { StatementElement } from '../structureElements';
import { SymbolTable } from '../symbolTable';
import { ValueElement } from './valueElements';

type TDataValue =
    | ValueElement.IntDataValueElement
    | ValueElement.FloatDataValueElement
    | ValueElement.CharDataValueElement
    | ValueElement.StringDataValueElement
    | ValueElement.BooleanDataValueElement;

export namespace DataElement {
    abstract class DataElement extends StatementElement {
        private _type: TPrimitiveName;

        constructor(identifier: string, type: TPrimitiveName) {
            super(identifier, {
                identifier: ['TString'],
                value: [type]
            });
            this._type = type;
        }

        get type() {
            return this._type;
        }

        get argIdentifier() {
            const arg = this.args.getArg('identifier');
            if (arg === null) {
                throw Error('Invalid data element: missing identifier.');
            } else {
                return arg.getData({}) as TString;
            }
        }

        abstract get valueElement(): TDataValue;

        onVisit(props: {
            args: {
                identifier: TPrimitive;
                value: TPrimitive;
            };
            symbolTable: SymbolTable;
        }) {
            props.symbolTable.addSymbol(props.args.identifier as TString, props.args.value);
        }
    }

    export class IntDataElement extends DataElement {
        constructor() {
            super('data-int', 'TInt');
        }

        get valueElement() {
            return new ValueElement.IntDataValueElement(this.argIdentifier);
        }
    }

    export class FloatDataElement extends DataElement {
        constructor() {
            super('data-float', 'TFloat');
        }

        get valueElement() {
            return new ValueElement.FloatDataValueElement(this.argIdentifier);
        }
    }

    export class CharDataElement extends DataElement {
        constructor() {
            super('data-char', 'TChar');
        }

        get valueElement() {
            return new ValueElement.CharDataValueElement(this.argIdentifier);
        }
    }

    export class StringDataElement extends DataElement {
        constructor() {
            super('data-string', 'TString');
        }

        get valueElement() {
            return new ValueElement.StringDataValueElement(this.argIdentifier);
        }
    }

    export class BooleanDataElement extends DataElement {
        constructor() {
            super('data-boolean', 'TBoolean');
        }

        get valueElement() {
            return new ValueElement.BooleanDataValueElement(this.argIdentifier);
        }
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
            super(elementName, constraints);
        }

        onVisit(props: {
            args: {
                currValue: TPrimitive;
                newValue: TPrimitive;
            };
        }) {
            props.args.currValue.value = props.args.newValue.value;
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
