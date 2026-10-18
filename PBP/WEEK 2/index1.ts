// const a: number = 5;
// const b: number = 10;
// console.log(a + b);

// type Student = {
//     id: string;
//     name: string;
//     age: number;
//     gender?: string;
// };

// type Student = {
//     id: string;
//     name: string;
//     age: number;
//     gender?: "male" | "female";
// };

// type Gender = "male" | "female";

// type Student = {
//     id: string;
//     name: string;
//     age: number;
//     gender?: Gender;
// };

// const me: Student = {
//     name: "Adrian",
//     age: 20,
//     id: "1123049",
//     gender: "male"
// };

// console.log(me);

// =================================================================

// function sum(a:number,b:number){
//     return a + b;
// }

function sum(a:number,b:number): number{
    return a + b;
}

function add(a: number | string, b: number | string){
    return (a as any) + (b as any);
}   

// console.log(sum('a','b'));
console.log(sum(10,20));
console.log(add('a','b'));