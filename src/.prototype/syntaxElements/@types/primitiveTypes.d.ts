type TNInt = 'TInt';
type TNFloat = 'TFloat';
type TNChar = 'TChar';
type TNString = 'TString';
type TNBoolean = 'TBoolean';
export type TPrimitiveName = TNInt | TNFloat | TNChar | TNString | TNBoolean;

/*
 * There is a circular dependency on files between this file and ../primitiveElements.ts.
 * The ones above this comment are dependencies of ../primitiveElements.ts.
 * The ones below this comment are dependent on ../primitiveElements.ts.
 * This is not a bug, however, it is not a good convention.
 * This particular case may be carefully exempted only for clarity.
 */

import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';
export type TPrimitive = TInt | TFloat | TChar | TString | TBoolean;
