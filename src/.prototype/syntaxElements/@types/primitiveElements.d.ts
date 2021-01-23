import { TPrimitiveName } from './primitiveTypes';

export interface IPrimitiveElement<T> {
    /** Primitive type string ('TInt', 'TFloat', 'TChar', 'TString', 'TBoolean') of the element. */
    type: TPrimitiveName;
    /** Wrapped value. */
    value: T;
}
