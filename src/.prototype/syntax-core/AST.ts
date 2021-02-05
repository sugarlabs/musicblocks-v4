import { IStartBlock, IActionBlock, IAST } from './@types/AST';
import { BlockElement } from './structureElements';
import { Context } from './context';

// ---- Top Level Blocks (Start and Action) --------------------------------------------------------

export class StartBlock extends BlockElement implements IStartBlock {
    constructor() {
        super('start', 1);
        this.context = new Context();
    }

    onVisit() {}

    onExit() {}
}

export class ActionBlock extends BlockElement implements IActionBlock {
    constructor() {
        super('action', 1, true, {
            name: ['TString']
        });
    }

    onVisit() {}

    onExit() {}
}

// ---- Abstract Syntax Tree (AST) -----------------------------------------------------------------

export class AST implements IAST {
    private _startBlocks: StartBlock[] = [];
    private _actionBlocks: ActionBlock[] = [];

    constructor() {}

    get startBlocks() {
        return this._startBlocks;
    }

    get actionBlocks() {
        return this._actionBlocks;
    }

    addStart(): StartBlock {
        const startElement = new StartBlock();
        this._startBlocks.push(startElement);
        return startElement;
    }

    removeStart(startElement: StartBlock) {
        const index = this._startBlocks.indexOf(startElement);
        if (index !== -1) {
            this._startBlocks.splice(index, 1);
        } else {
            throw Error(`Start block does not exist in AST.`);
        }
    }
}
