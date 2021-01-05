import {
    TInt as Int,
    TFloat as Float,
    TChar as Char,
    TString as String,
    TBoolean as Boolean
} from '../primitiveElements';

export interface IPrimitiveElement<T> {
    data: T;
}

export type TInt = Int;
export type TFloat = Float;
export type TChar = Char;
export type TString = String;
export type TBoolean = Boolean;
