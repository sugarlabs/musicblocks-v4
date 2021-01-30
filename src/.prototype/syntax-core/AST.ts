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
        super('action', 1, {
            name: ['TString']
        });
    }

    onVisit() {
        if (this.context === null) {
            throw Error(`Invalid context: context cannot be null`);
        }
    }

    onExit() {
        this.context = null;
    }
}

// ---- Abstract Syntax Tree (AST) -----------------------------------------------------------------

export class AST implements IAST {
    /** Stores the singleton instance (once instantiated). */
    private static _instance: AST | undefined;

    private _startBlocks: StartBlock[] = [];
    private _actionBlocks: ActionBlock[] = [];

    /** Creates and returns a new instance of the class if one doesn't exist, else returns the existing one. */
    constructor() {
        if (AST._instance) {
            return AST._instance;
        }
        AST._instance = this;
    }

    /** Getter that returns the singleton instance. */
    static get instance() {
        return AST._instance;
    }

    get startBlocks() {
        return this._startBlocks;
    }

    get actionBlocks() {
        return this._actionBlocks;
    }

    get newStart() {
        const start = new StartBlock();
        this._startBlocks.push(start);
        return start;
    }

    get newAction() {
        const action = new ActionBlock();
        this._actionBlocks.push(action);
        return action;
    }
}
