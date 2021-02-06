import { TPrimitive } from '../@types/primitiveTypes';
import { BlockElement } from '../structureElements';

export namespace ConditionalElement {
    export class IfElseElement extends BlockElement {
        constructor(elementName?: 'if') {
            super(elementName !== undefined ? elementName : 'if-else', 2, false, {
                condition: ['TBoolean']
            });
        }

        onVisit(props: { args: { condition: TPrimitive } }) {
            this.childHead = this.getChildHead(props.args['condition'].value ? 0 : 1);
        }

        onExit() {}
    }

    export class IfThenElement extends IfElseElement {
        constructor() {
            super('if');
        }
    }
}
