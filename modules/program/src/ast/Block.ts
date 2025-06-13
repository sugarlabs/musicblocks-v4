import { ASTNodeBase, Block as BlockAbstract } from "../abstracts";

export class Block extends BlockAbstract {
  constructor(statements: ASTNodeBase[] = []) {
    super(statements);
  }
}