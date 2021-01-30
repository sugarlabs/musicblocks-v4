import { TQuery as TSyntaxQuery } from './syntaxHandler';

export type TMessage = {
    target: 'syntax';
    query: TSyntaxQuery;
};

export interface IBroker {
    processMessage(message: TMessage): Promise<string>;
}
