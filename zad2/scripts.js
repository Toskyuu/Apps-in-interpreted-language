"use strict";
let todoList = []; //declares a new array for Your todo list

let updateJSONbin = function() {
    $.ajax({
  url: BASE_URL,
  type: 'PUT',
  headers: { //Required only if you are trying to access a private bin
    'X-Master-Key': SECRET_KEY
  },
  contentType: 'application/json',
  data: JSON.stringify(todoList),
  success: (data) => {
    console.log(data);
  },
  error: (err) => {
    console.log(err.responseJSON);
  }
});}

const BASE_URL = "https://api.jsonbin.io/v3/b/653e560212a5d37659920b56";
const SECRET_KEY = "$2a$10$J7KAJRumTXnF9Ycv/CVolOMmmxGvECJv.c8EtI0SUIMU7WT5Lzk12";
$.ajax({
 // copy Your bin identifier here. It can be obtained in the dashboard
 url: BASE_URL,
 type: 'GET',
 headers: { //Required only if you are trying to access a private bin
   'X-Master-Key': SECRET_KEY
},
 success: (data) => {
   console.log(data);
   todoList = data;
 },
 error: (err) => {
   console.log(err.responseJSON);
 }
});

let updateTodoList = function () {
  let todoListDiv = document.getElementById("todoListView");

  
  //add all elements
let filterInput = document.getElementById("inputSearch");   
for (let todo in todoList) {
  if (
    (filterInput.value == "") ||
    (todoList[todo].title.includes(filterInput.value)) ||
    (todoList[todo].description.includes(filterInput.value))
  ) {
    let newElement = document.createElement("p");
    let newContent = document.createTextNode(todoList[todo].title + " " +
                                             todoList[todo].description);
    newElement.appendChild(newContent);
    todoListDiv.appendChild(newElement);
  }
}

  let newDeleteButton = document.createElement("input");
  newDeleteButton.type = "button";
  newDeleteButton.value = "x";
  newDeleteButton.addEventListener("click", function () {
    deleteTodo(todo);
  });

  //remove all elements
  while (todoListDiv.firstChild) {
    todoListDiv.removeChild(todoListDiv.firstChild);
  }

  //add all elements
  for (let todo in todoList) {
    let newDeleteButton = document.createElement("input");
    newDeleteButton.type = "button";
    newDeleteButton.value = "x";
    newDeleteButton.addEventListener("click", function () {
      deleteTodo(todo);
    });
    let newElement = document.createElement("div");
    let newContent = document.createTextNode(
      todoList[todo].title + " " + todoList[todo].description
    );
    newElement.appendChild(newContent);
    todoListDiv.appendChild(newElement);
    newElement.appendChild(newDeleteButton);
  }
  updateJSONbin;
};

setInterval(updateTodoList, 1000);

let deleteTodo = function (index) {
  todoList.splice(index, 1);
  updateJSONbin;
};

let addTodo = function () {
  //get the elements in the form
  let inputTitle = document.getElementById("inputTitle");
  let inputDescription = document.getElementById("inputDescription");
  let inputPlace = document.getElementById("inputPlace");
  let inputDate = document.getElementById("inputDate");
  //get the values from the form
  let newTitle = inputTitle.value;
  let newDescription = inputDescription.value;
  let newPlace = inputPlace.value;
  let newDate = new Date(inputDate.value);
  //create new item
  let newTodo = {
    title: newTitle,
    description: newDescription,
    place: newPlace,
    dueDate: newDate,
  };
  //add item to the list
  todoList.push(newTodo);
  window.localStorage.setItem("todos", JSON.stringify(todoList));
};







