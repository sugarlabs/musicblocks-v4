import { ASTNodeBase, Program } from "../abstracts";

export class ProgramDeclaration extends Program {
  constructor(body: ASTNodeBase[]) {
    super(body);
  }
}