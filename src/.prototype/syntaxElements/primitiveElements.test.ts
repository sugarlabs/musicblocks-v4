import { TInt, TFloat, TChar, TString, TBoolean } from './primitiveElements';

test('assign 5 to TInt to equal 5', () => {
    const typeObj = new TInt(5);
    expect(typeObj.value).toBe(5);
});

test('assign Math.PI (3.1415..) to TInt to equal 3', () => {
    const typeObj = new TInt(Math.PI);
    expect(typeObj.value).toBe(3);
});

test('assign Math.E (2.7182..) to TFloat to equal Math.E', () => {
    const typeObj = new TFloat(Math.E);
    expect(typeObj.value).toBe(Math.E);
});

test('assign "mystring" to TChar to equal "m"', () => {
    const typeObj = new TChar('mystring');
    expect(typeObj.value).toBe('m');
});

test('assign "" to TChar to equal ASCII 0 character', () => {
    const typeObj = new TChar('');
    expect(typeObj.value).toBe(String.fromCharCode(0));
});

test('assign 65 to TChar to equal "A"', () => {
    const typeObj = new TChar(65);
    expect(typeObj.value).toBe('A');
});

test('assign 500 to TChar to equal ASCII 255 character', () => {
    const typeObj = new TChar(500);
    expect(typeObj.value).toBe(String.fromCharCode(255));
});

test('assign 65 and add offset of -500 to TChar to equal ASCII 0 character', () => {
    const typeObj = new TChar(65);
    typeObj.addOffset(-500);
    expect(typeObj.value).toBe(String.fromCharCode(0));
});

test('assign "mystring" to TString to equal "mystring"', () => {
    const typeObj = new TString('mystring');
    expect(typeObj.value).toBe('mystring');
});

test('assign true to TBoolean to equal true', () => {
    const typeObj = new TBoolean(true);
    expect(typeObj.value).toBe(true);
});

test('assign false to TBoolean to equal false', () => {
    const typeObj = new TBoolean(false);
    expect(typeObj.value).toBe(false);
});
