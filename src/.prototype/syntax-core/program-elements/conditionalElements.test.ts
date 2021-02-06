import { ConditionalElement } from './conditionalElements';
import { StatementElement } from '../structureElements';
import { ValueElement } from './valueElements';

/** Dummy class to extend abstract class StatementElement. */
class CStatementElement extends StatementElement {
    onVisit() {}
}

describe('namespace ConditionalElement', () => {
    const statement_1 = new CStatementElement('statement-1', false);
    const statement_2 = new CStatementElement('statement-2', false);

    describe('class IfElseElement', () => {
        const ifElseElem = new ConditionalElement.IfElseElement();
        ifElseElem.setChildHead(0, statement_1);
        ifElseElem.setChildHead(1, statement_2);

        test("pass a valid true condition and expect childHead to be first block's head", () => {
            const argElem = new ValueElement.TrueElement();
            ifElseElem.args.setArg('condition', argElem);
            ifElseElem.onVisit({
                args: {
                    condition: argElem.getData()
                }
            });
            const childHead = ifElseElem.childHead;
            if (childHead !== null) {
                expect(childHead.elementName).toBe('statement-1');
            } else {
                throw Error('Object should not be null');
            }
        });

        test("pass a valid false condition and expect childHead to be second block's head", () => {
            const argElem = new ValueElement.FalseElement();
            ifElseElem.args.setArg('condition', argElem);
            ifElseElem.onVisit({
                args: {
                    condition: argElem.getData()
                }
            });
            const childHead = ifElseElem.childHead;
            if (childHead !== null) {
                expect(childHead.elementName).toBe('statement-2');
            } else {
                throw Error('Object should not be null');
            }
        });

        // test('pass a null as condition and expect error', () => {
        //     ifElseElem.args.setArg('condition', null);
        //     expect(() => ifElseElem.onVisit()).toThrowError(
        //         'Invalid argument: condition cannot be null'
        //     );
        // });
    });

    describe('class IfThenElement', () => {
        const IfThenElem = new ConditionalElement.IfThenElement();
        IfThenElem.setChildHead(0, statement_1);

        test("pass a valid true condition and expect childHead to be first block's head", () => {
            const argElem = new ValueElement.TrueElement();
            IfThenElem.args.setArg('condition', argElem);
            IfThenElem.onVisit({
                args: {
                    condition: argElem.getData()
                }
            });
            const childHead = IfThenElem.childHead;
            if (childHead !== null) {
                expect(childHead.elementName).toBe('statement-1');
            } else {
                throw Error('Object should not be null');
            }
        });

        test('pass a valid false condition and expect childHead to be null', () => {
            const argElem = new ValueElement.FalseElement();
            IfThenElem.args.setArg('condition', argElem);
            IfThenElem.onVisit({
                args: {
                    condition: argElem.getData()
                }
            });
            const childHead = IfThenElem.childHead;
            expect(childHead).toBe(null);
        });

        // test('pass a null as condition and expect error', () => {
        //     IfThenElem.args.setArg('condition', null);
        //     expect(() => IfThenElem.onVisit()).toThrowError(
        //         'Invalid argument: condition cannot be null'
        //     );
        // });
    });
});
