import { ArgumentElement, BlockElement } from '../structureElements';

export namespace ConditionalElement {
    export class IfElseElement extends BlockElement {
        constructor(elementName?: 'if') {
            super(elementName !== undefined ? elementName : 'if-else', 2, false, {
                condition: ['TBoolean']
            });
        }

        set argCondition(condition: ArgumentElement | null) {
            this.args.setArg('condition', condition);
        }

        get argCondition() {
            return this.args.getArg('condition');
        }

        /** @throws Invalid argument */
        onVisit() {
            const arg = this.args.getArg('condition');
            if (arg === null) {
                throw Error('Invalid argument: condition cannot be null');
            }
            this.childHead = this.getChildHead(arg.data.value ? 0 : 1);
        }

        onExit() {}
    }

    export class IfThenElement extends IfElseElement {
        constructor() {
            super('if');
        }
    }
}
