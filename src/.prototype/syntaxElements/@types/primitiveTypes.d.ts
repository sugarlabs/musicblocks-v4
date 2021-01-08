type TNInt = 'TInt';
type TNFloat = 'TFloat';
type TNChar = 'TChar';
type TNString = 'TString';
type TNBoolean = 'TBoolean';
export type TPrimitiveName = TNInt | TNFloat | TNChar | TNString | TNBoolean;

import { TInt, TFloat, TChar, TString, TBoolean } from '../primitiveElements';

// These should be imported from this module, hence exported again from here.
export { TInt, TFloat, TChar, TString, TBoolean };
export type TPrimitive = TInt | TFloat | TChar | TString | TBoolean;
