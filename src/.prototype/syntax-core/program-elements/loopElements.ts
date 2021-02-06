import { TPrimitive } from '../@types/primitiveTypes';
import { BlockElement, DummyElement, InstructionElement } from '../structureElements';

export namespace LoopElement {
    export class RepeatLoopElement extends BlockElement {
        private _nextStore: InstructionElement | null = new DummyElement();
        private _counter: number = 0;

        constructor() {
            super('repeat', 1, {
                value: ['TInt', 'TFloat']
            });
        }

        onVisit(props: { args: { value: TPrimitive } }) {
            if (props.args['value'].value < 0) {
                throw Error('Repeat loop needs a positive value.');
            } else {
                // Not already repeating.
                if (this._nextStore !== null && this._nextStore.isDummy) {
                    this._nextStore = this.next;
                    this._counter = props.args['value'].value as number;
                }
            }
            this.childHead = this.getChildHead(0);
        }

        onExit() {
            this._counter--;
            if (this._counter > 0) {
                this.next = this;
            } else {
                // Reset values - repeat ended.
                this.next = this._nextStore;
                this._nextStore = new DummyElement();
            }
        }
    }
}
