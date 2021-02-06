import { LoopElement } from './loopElements';
import { ValueElement } from './valueElements';

describe('namespace LoopElement', () => {
    describe('class RepeatLoopElement', () => {
        const repeatElem = new LoopElement.RepeatLoopElement();

        test('Repeat 3 times while expecting next instruction to be itself twice and null after 3rd iteration', () => {
            const valueElem = new ValueElement.IntElement(3);
            for (let i = 0; i < 2; i++) {
                repeatElem.onVisit({
                    args: {
                        value: valueElem.getData()
                    }
                });
                repeatElem.onExit();
                expect(repeatElem.next).toEqual(repeatElem);
            }
            repeatElem.onVisit({
                args: {
                    value: valueElem.getData()
                }
            });
            repeatElem.onExit();
            expect(repeatElem.next).toBe(null);
        });

        test('Repeat with a negative value and expect error', () => {
            const valueElem = new ValueElement.IntElement(-3);
            expect(() =>
                repeatElem.onVisit({
                    args: {
                        value: valueElem.getData()
                    }
                })
            ).toThrowError('Repeat loop needs a positive value.');
        });
    });
});
