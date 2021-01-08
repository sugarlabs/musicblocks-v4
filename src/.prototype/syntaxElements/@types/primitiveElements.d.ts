import { TPrimitiveName } from './primitiveTypes';

export interface IPrimitiveElement<T> {
    value: T;
    type: TPrimitiveName;
}
