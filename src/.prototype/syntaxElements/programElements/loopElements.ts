import { TInt } from '../primitiveElements';
import { ArgumentElement, BlockElement, InstructionElement } from '../structureElements';

export namespace LoopElement {
    export class RepeatLoopElement extends BlockElement {
        private _nextStore: InstructionElement | null;
        private _counter: number = 0;

        constructor() {
            super('repeat', 1, {
                value: ['TInt']
            });
            this._nextStore = this.next;
        }

        set argValue(value: ArgumentElement | null) {
            if (value !== null) {
                const data = value.data as TInt;
                if (data.value < 0) {
                    throw Error('Invalid argument: Repeat loop needs a positive value');
                }
                this._counter = data.value;
            } else {
                this._counter = 0;
            }
            this.args.setArg('value', value);
        }

        onVisit() {
            const arg = this.args.getArg('value');
            if (arg === null) {
                throw Error('Invalid argument: Repeat loop needs a positive value');
            }
        }

        onExit() {
            this._counter--;
            if (this._counter > 0) {
                this.next = this;
            } else {
                this.next = this._nextStore;
            }
        }
    }
}
