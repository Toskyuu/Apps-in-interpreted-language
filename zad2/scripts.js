"use strict"
let todoList = []; //declares a new array for Your todo list

function createObject(title, place, description, dueDate){
    return {
        title,
        place,
        description,
        dueDate
    }
}

let objekt = createObject("tytul", "lodz", "no opis jakis", new Date(2023, 10 ,17));

todoList.push(objekt)

console.log(todoList[0]);