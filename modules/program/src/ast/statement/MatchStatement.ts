import { CompoundStatement } from '../../abstracts';
import { IdentifierExpression } from '../expression/IdentifierExpression';
import { LiteralExpression, ASTNodeBase } from '../../abstracts';

export class MatchStatement extends CompoundStatement {
    constructor(
        public readonly discriminant: IdentifierExpression,
        public readonly cases: { match: LiteralExpression; body: ASTNodeBase }[],
    ) {
        super('MatchStatement', cases[0]?.body || (null as unknown as ASTNodeBase));
        this.body = cases[0]?.body || (null as unknown);
    }
}
