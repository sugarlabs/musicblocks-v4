import { TPrimitiveName } from '../@types/primitiveTypes';
import { ArgumentElement, StatementElement } from '../structureElements';

type argType = ArgumentElement | null;

export namespace DataElement {
    class DataElement extends StatementElement {
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

        /** @todo: Implement this after creating Synbol Table. */
        onVisit() {}
    }

    export class IntDataElement extends DataElement {
        constructor() {
            super('data-int', ['TInt']);
        }
    }

    export class FloatDataElement extends DataElement {
        constructor() {
            super('data-float', ['TFloat']);
        }
    }

    export class CharDataElement extends DataElement {
        constructor() {
            super('data-char', ['TChar']);
        }
    }

    export class StringDataElement extends DataElement {
        constructor() {
            super('data-string', ['TString']);
        }
    }

    export class BooleanDataElement extends DataElement {
        constructor() {
            super('data-boolean', ['TBoolean']);
        }
    }

    export class AnyDataElement extends DataElement {
        constructor() {
            super('data-any', ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']);
        }
    }
}
