import { TFloat, TInt } from '../primitiveElements';
import { ArgumentElement, BlockElement, InstructionElement } from '../structureElements';

export namespace LoopElement {
    export class RepeatLoopElement extends BlockElement {
        private _nextStore: InstructionElement | null = null;
        private _counter: number = 0;

        constructor() {
            super('repeat', 1, {
                value: ['TInt', 'TFloat']
            });
        }

        set argValue(value: ArgumentElement | null) {
            if (value !== null) {
                const data = TInt.TInt(value.data as TInt | TFloat);
                this._counter = data.value;
            } else {
                this._counter = 0;
            }
            this.args.setArg('value', value);
        }

        onVisit() {
            const arg = this.args.getArg('value');
            if (arg === null || arg.data.value < 0) {
                throw Error('Invalid argument: Repeat loop needs a positive value');
            }
            if (this._nextStore === null) {
                this._nextStore = this.next;
            }
            this.childHead = this.getChildHead(0);
        }

        onExit() {
            this._counter--;
            if (this._counter > 0) {
                this.next = this;
            } else {
                this.next = this._nextStore;
                this._nextStore = null;
            }
        }
    }
}
