import { TPrimitive } from '../@types/primitiveTypes';
import { ArgumentElement, StatementElement } from '../structureElements';

export namespace MiscellaneousElement {
    export class PrintElement extends StatementElement {
        constructor() {
            super('print', false, {
                message: ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']
            });
        }

        /** @todo logic to be implemented after UI is created. Currently just for demonstration. */
        onVisit(props: { args: { message: TPrimitive } }) {
            console.log(`" ${props.args['message'].value} "`);
        }
    }
}
