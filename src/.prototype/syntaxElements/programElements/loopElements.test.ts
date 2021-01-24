import { LoopElement } from './loopElements';
import { ValueElement } from './valueElements';

describe('namespace LoopElement', () => {
    describe('class RepeatLoopElement', () => {
        const repeatElem = new LoopElement.RepeatLoopElement();

        test('Repeat 3 times while expecting next instruction to be itself twice and null after 3rd iteration', () => {
            repeatElem.argValue = new ValueElement.IntElement(3);
            for (let i = 0; i < 2; i++) {
                repeatElem.onVisit();
                repeatElem.onExit();
                expect(repeatElem.next).toEqual(repeatElem);
            }
            repeatElem.onVisit();
            repeatElem.onExit();
            expect(repeatElem.next).toBe(null);
        });

        test('Repeat with a null value and expect error', () => {
            repeatElem.argValue = null;
            expect(() => repeatElem.onVisit()).toThrowError(
                'Invalid argument: Repeat loop needs a positive value'
            );
        });

        test('Attempt to assign a negative value to repeat and expect error', () => {
            expect(() => (repeatElem.argValue = new ValueElement.IntElement(-5))).toThrowError(
                'Invalid argument: Repeat loop needs a positive value'
            );
        });
    });
});
