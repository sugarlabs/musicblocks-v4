import { ArgumentElement, StatementElement } from '../structureElements';

export namespace MiscellaneousElement {
    export class PrintElement extends StatementElement {
        constructor() {
            super('print', {
                message: ['TInt', 'TFloat', 'TChar', 'TString', 'TBoolean']
            });
        }

        set argMessage(message: ArgumentElement | null) {
            this.args.setArg('message', message);
        }

        /** @todo logic to be implemented after UI is created. Currently just for demonstration. */
        onVisit() {
            const arg = this.args.getArg('message');
            if (arg !== null) {
                console.log(`" ${arg.data.value} "`);
            } else {
                console.log(`" ${null} "`);
            }
        }
    }
}
