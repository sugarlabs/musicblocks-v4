// Music Blocks specific implementations
import { FunctionCallStatement } from "../statement/FunctionCallStatement";
import { IdentifierExpression } from "../expression/IdentifierExpression";
import { Expression, ASTNodeBase } from "../../abstracts";
import { StringLiteralExpression } from "../expression/StringLiteralExpression";
import { VariableDeclarationStatement } from "../statement/VariableDeclarationStatement";
import { ModifyingContextStatement } from "../statement/ModifyingContextStatement";

// Music-specific function calls
export class PlayNoteStatement extends FunctionCallStatement {
  constructor(
    pitch: Expression,
    duration?: Expression,
    volume?: Expression
  ) {
    const args: { param: IdentifierExpression; value: Expression }[] = [
      { param: new IdentifierExpression("pitch"), value: pitch }
    ];

    if (duration) {
      args.push({ param: new IdentifierExpression("duration"), value: duration });
    }
    if (volume) {
      args.push({ param: new IdentifierExpression("volume"), value: volume });
    }

    super(new IdentifierExpression("playNote"), args);
  }

  get pitch(): Expression {
    return this.args.find(arg => arg.param.name === "pitch")?.value || new StringLiteralExpression("");
  }

  get duration(): Expression | undefined {
    return this.args.find(arg => arg.param.name === "duration")?.value;
  }

  get volume(): Expression | undefined {
    return this.args.find(arg => arg.param.name === "volume")?.value;
  }
}

export class SetKeyStatement extends FunctionCallStatement {
  constructor(key: Expression) {
    super(
      new IdentifierExpression("setKey"),
      [{ param: new IdentifierExpression("key"), value: key }]
    );
  }

  get key(): Expression {
    return this.args[0].value;
  }
}

export class SetMasterVolumeStatement extends FunctionCallStatement {
  constructor(volume: Expression) {
    super(
      new IdentifierExpression("setMasterVolume"),
      [{ param: new IdentifierExpression("volume"), value: volume }]
    );
  }

  get volume(): Expression {
    return this.args[0].value;
  }
}

// Art-specific function calls
export class ForwardStatement extends FunctionCallStatement {
  constructor(steps: Expression) {
    super(
      new IdentifierExpression("forward"),
      [{ param: new IdentifierExpression("steps"), value: steps }]
    );
  }

  get steps(): Expression {
    return this.args[0].value;
  }
}

export class RightStatement extends FunctionCallStatement {
  constructor(angle: Expression) {
    super(
      new IdentifierExpression("right"),
      [{ param: new IdentifierExpression("angle"), value: angle }]
    );
  }

  get angle(): Expression {
    return this.args[0].value;
  }
}

export class LeftStatement extends FunctionCallStatement {
  constructor(angle: Expression) {
    super(
      new IdentifierExpression("left"),
      [{ param: new IdentifierExpression("angle"), value: angle }]
    );
  }

  get angle(): Expression {
    return this.args[0].value;
  }
}

// System function calls
export class ClearStatement extends FunctionCallStatement {
  constructor() {
    super(new IdentifierExpression("clear"), []);
  }
}

// Variable operations
export class BoxDeclarationStatement extends VariableDeclarationStatement {
  constructor(boxName: string, initialValue: Expression) {
    super(
      new IdentifierExpression(boxName),
      initialValue
    );
  }
}

// Music-specific modifying context statements
export class SetInstrumentStatement extends ModifyingContextStatement {
  constructor(instrument: Expression, body: ASTNodeBase) {
    super(
      [{ param: new IdentifierExpression("instrument"), value: instrument }],
      body
    );
  }

  get instrument(): Expression {
    return this.args[0].value;
  }
}

export class DecrescendoStatement extends ModifyingContextStatement {
  constructor(factor: Expression, body: ASTNodeBase) {
    super(
      [{ param: new IdentifierExpression("factor"), value: factor }],
      body
    );
  }

  get factor(): Expression {
    return this.args[0].value;
  }
}

// Specialized expressions for Music Blocks
export class InstrumentExpression extends StringLiteralExpression {
  constructor(instrument: string) {
    super(instrument);
  }

  static readonly INSTRUMENTS = [
    "guitar", "piano", "violin", "flute", "trumpet", "drums"
  ] as const;

  get instrumentType(): string {
    return this.value as string;
  }
}

export class NoteExpression extends StringLiteralExpression {
  constructor(note: string) {
    super(note);
  }

  get noteName(): string {
    return this.value as string;
  }
}

// Event-driven function calls
export class OnNoteDoStatement extends FunctionCallStatement {
  constructor(callback: IdentifierExpression) {
    super(
      new IdentifierExpression("onNoteDo"),
      [{ param: new IdentifierExpression("callback"), value: callback }]
    );
  }

  get callback(): IdentifierExpression {
    return this.args[0].value as IdentifierExpression;
  }
}