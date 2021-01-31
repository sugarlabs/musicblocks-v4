import { ISyntaxHandler, TQuery } from './@types/syntaxHandler';
import {
    ArgumentDataElement,
    ArgumentElement,
    ArgumentExpressionElement,
    BlockElement,
    InstructionElement,
    StatementElement,
    SyntaxElement
} from '../syntax-core/structureElements';
import * as Factory from '../syntax-core/syntaxElementFactory';

export default class SyntaxHandler implements ISyntaxHandler {
    private _elementMap: {
        [key: string]: {
            elementName: string;
            element: SyntaxElement;
            type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
        };
    } = {};

    constructor() {}

    // -- Utilities ------------------------------------------------------------

    /** Handles creation of syntax elements. */
    private _handleCreate(elementName: string, arg?: number | string): string {
        const element = Factory.createSyntaxElement(elementName, arg);
        let id: string;
        do {
            id = 'E' + Date.now();
        } while (id in this._elementMap);
        this._elementMap[id] = { elementName, ...element };
        return id;
    }

    /** Handles removal of syntax elements. */
    private _handleRemove(elementID: string): void {
        if (elementID in this._elementMap) {
            delete this._elementMap[elementID];
        } else {
            throw Error(`Invalid argument: element with ID "${elementID}" does not exist.`);
        }
    }

    private _handleAttachment(
        type: 'instruction' | 'argument',
        elementID_1: string,
        elementID_2: string | null,
        argLabel?: string
    ) {
        let element_1: SyntaxElement;
        let element_2: SyntaxElement | null;
        if (elementID_1 in this._elementMap) {
            element_1 = this._elementMap[elementID_1].element;
        } else {
            throw Error(`Invalid ID: element with ID "${elementID_1}" does not exist.`);
        }

        if (elementID_2 === null) {
            element_2 = null;
        } else if (elementID_2 in this._elementMap) {
            element_2 = this._elementMap[elementID_2].element;
        } else {
            throw Error(`Invalid ID: element with ID "${elementID_2}" does not exist.`);
        }

        if (type === 'instruction') {
            if (!(element_1 instanceof InstructionElement)) {
                throw Error(
                    `Invalid argument: element with ID "${elementID_1}" must be an instruction.`
                );
            } else {
                if (element_2 !== null && !(element_2 instanceof InstructionElement)) {
                    throw Error(
                        `Invalid argument: element with ID "${elementID_2}" must be an instruction.`
                    );
                } else {
                    (element_1 as InstructionElement).next = element_2 as InstructionElement | null;
                }
            }
        } else {
            if (
                !(element_1 instanceof InstructionElement) &&
                !(element_1 instanceof ArgumentExpressionElement)
            ) {
                throw Error(
                    `Invalid argument: element with ID "${elementID_1}" must be an instruction or an expression.`
                );
            } else {
                if (element_2 !== null && !(element_2 instanceof ArgumentElement)) {
                    throw Error(
                        `Invalid argument: element with ID "${elementID_2}" must be an argument.`
                    );
                } else {
                    (element_1 as InstructionElement | ArgumentExpressionElement).args.setArg(
                        argLabel as string,
                        element_2 as ArgumentElement | null
                    );
                }
            }
        }
    }

    /** Handles attachment/detachment of instructions. */
    private _handleInstructionAttachment(elementID_1: string, elementID_2: string | null) {
        this._handleAttachment('instruction', elementID_1, elementID_2);
    }

    /** Handles attachment/detachment of arguments to instructions/expressions. */
    private _handleArgumentAttachment(
        elementID_1: string,
        elementID_2: string | null,
        argLabel: string
    ) {
        this._handleAttachment('argument', elementID_1, elementID_2, argLabel);
    }

    // -- Actions --------------------------------------------------------------

    processQuery(query: TQuery): string {
        switch (query.action) {
            case 'create':
                return this._handleCreate(query.props.elementName, query.props.arg);
            case 'remove':
                this._handleRemove(query.props.elementID);
                break;
            case 'attach-ins':
                this._handleInstructionAttachment(query.props.elementID_1, query.props.elementID_2);
                break;
            case 'attach-arg':
                this._handleArgumentAttachment(
                    query.props.elementID_1,
                    query.props.elementID_2,
                    query.props.argLabel
                );
                break;
            default:
                throw Error('Should not be reached.');
        }
        return 'successful'; // dummy
    }

    getElement(
        elementID: string
    ): {
        elementName: string;
        element: StatementElement | BlockElement | ArgumentDataElement | ArgumentExpressionElement;
        type: 'statement' | 'block' | 'arg-data' | 'arg-exp';
    } {
        if (!(elementID in this._elementMap)) {
            throw Error(`Invalid argument: element with ID ${elementID} does not exist.`);
        }
        const elementProps = this._elementMap[elementID];
        let element = elementProps.element;
        switch (elementProps.type) {
            case 'statement':
                return { ...elementProps, element: element as StatementElement };
            case 'block':
                return { ...elementProps, element: element as BlockElement };
            case 'arg-data':
                return { ...elementProps, element: element as ArgumentDataElement };
            case 'arg-exp':
                return { ...elementProps, element: element as ArgumentExpressionElement };
            default:
                throw Error('Should not be reached.');
        }
    }
}
