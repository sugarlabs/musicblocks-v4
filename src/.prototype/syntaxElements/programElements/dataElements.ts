import { TPrimitiveName } from '../@types/primitiveTypes';
import { ArgumentElement, StatementElement } from '../structureElements';

type argType = ArgumentElement | null;

export namespace BoxElement {
    class BoxElement extends StatementElement {
        /** @throws Invalid argument */
        constructor(
            identifier: string,
            valueConstraints: TPrimitiveName[],
            arg: { identifier: argType; value: argType }
        ) {
            super(identifier, {
                identifier: ['TString'],
                value: valueConstraints
            });
            this.args.setArg('identifier', arg.identifier);
            this.args.setArg('value', arg.value);
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

    export class IntBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-int', ['TInt'], arg);
        }
    }

    export class FloatBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-float', ['TFloat'], arg);
        }
    }

    export class CharBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-char', ['TChar'], arg);
        }
    }

    export class StringBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-string', ['TString'], arg);
        }
    }

    export class BooleanBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-boolean', ['TBoolean'], arg);
        }
    }

    export class AnyBoxElement extends BoxElement {
        /** @throws Invalid argument */
        constructor(arg: { identifier: argType; value: argType }) {
            super('box-any', ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean'], arg);
        }
    }
}
