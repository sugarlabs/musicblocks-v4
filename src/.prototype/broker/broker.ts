import { IBroker, TMessage } from './@types/broker';
import SyntaxHandler from './syntaxHandler';

export class Broker implements IBroker {
    private _syntaxHandler: SyntaxHandler;

    constructor() {
        this._syntaxHandler = new SyntaxHandler();
    }

    processMessage(message: TMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                let acknowledgement: string = '';
                switch (message.target) {
                    case 'syntax':
                        acknowledgement = this._syntaxHandler.processQuery(message.query);
                        break;
                    default:
                        throw Error('Should not be reached.');
                }
                setTimeout(() => resolve(acknowledgement));
            } catch (e) {
                reject(e);
            }
        });
    }
}
