import {
    ArgumentElement,
    BlockElement,
    DummyElement,
    InstructionElement
} from '../structureElements';

export namespace LoopElement {
    export class RepeatLoopElement extends BlockElement {
        private _nextStore: InstructionElement | null = new DummyElement();
        private _counter: number = 0;

        constructor() {
            super('repeat', 1, false, {
                value: ['TInt', 'TFloat']
            });
        }

        set argValue(value: ArgumentElement | null) {
            this.args.setArg('value', value);
        }

        onVisit() {
            const arg = this.args.getArg('value');
            if (arg === null || arg.getData().value < 0) {
                throw Error('Repeat loop needs a positive value.');
            } else {
                // Not already repeating.
                if (this._nextStore !== null && this._nextStore.isDummy) {
                    this._nextStore = this.next;
                    this._counter = arg.getData().value as number;
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
