function add(a: number, b: number): number {
    return a + b;
}

console.log("Hello World!");

const num1: number = 6;
const num2: number = (num1 + 1) << 1;
console.log(`${num1} + ${num2} = ${add(num1, num2)}`);
