import { SimpleStatement } from "../../abstracts";

export class JumpStatement extends SimpleStatement {
  constructor(public readonly variant: "break" | "continue" | "return") {
    super("JumpStatement");
  }
}