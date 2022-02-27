/** Represents the interface for a code instruction snapshot object. */
export interface ICodeInstructionSnapshotObj {
    [key: string]:
        | {
              [key: string]: boolean | number | string | ICodeInstructionSnapshotObj[];
          }
        | boolean
        | number
        | string;
}

/** Represents the interface for a code instruction snapshot. */
export type ICodeInstructionSnapshot = string | ICodeInstructionSnapshotObj;
