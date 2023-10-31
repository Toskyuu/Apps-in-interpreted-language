"use strict";
let todoList = []; //declares a new array for Your todo list
const BASE_URL =
  "https://api.jsonbin.io/v3/b/653ed6e354105e766fc8cc29?meta=false ";
const SECRET_KEY =
  "$2a$10$KnEwck7Jzagu.qYCHWGxiuHr8pWNLUvcRwmBNmsllGMk.wS3Etfge";

$.ajax({
  // copy Your bin identifier here. It can be obtained in the dashboard
  url: BASE_URL,
  type: "GET",
  headers: {
    //Required only if you are trying to access a private bin
    "X-Master-Key": SECRET_KEY,
  },

  success: (data) => {
    console.log(data);
    todoList = data;
  },
  error: (err) => {
    console.log(err.responseJSON);
  },
});

let updateJSONbin = function () {
  $.ajax({
    url: BASE_URL,
    type: "PUT",
    headers: {
      //Required only if you are trying to access a private bin
      "X-Master-Key": SECRET_KEY,
    },
    contentType: "application/json",

    data: JSON.stringify(todoList),
    success: (data) => {
      console.log(data);
    },
    error: (err) => {
      console.log(err.responseJSON);
    },
  });
};

let createTableHeader = function (todoTable) {
  let header = todoTable.createTHead();
  let newRow = todoTable.insertRow(0);

  let newCellTitle = newRow.insertCell();
  newCellTitle.innerHTML = "Title";

  let newCellDesc = newRow.insertCell();
  newCellDesc.innerHTML = "Description";

  let newCellPlace = newRow.insertCell();
  newCellPlace.innerHTML = "Place";

  let newCellDate = newRow.insertCell();
  newCellDate.innerHTML = "Due Date";

  let newCellDel = newRow.insertCell();
  newCellDel.innerHTML = "Delete";
};

let updateTodoList = function () {
  let todoTable = document.getElementById("todoTableView");
  //remove all elements
  while (todoTable.firstChild) {
    todoTable.removeChild(todoTable.firstChild);
  }

  createTableHeader(todoTable);

  //add all elements
  let filterInput = document.getElementById("inputSearch");
  for (let todo in todoList) {
    if (
      filterInput.value == "" ||
      todoList[todo].title.includes(filterInput.value) ||
      todoList[todo].description.includes(filterInput.value) ||
      todoList[todo].place.includes(filterInput.value) ||
      todoList[todo].dueDate.includes(filterInput.value)
    ) {
      let newRow = todoTable.insertRow(-1);
      let newCellTitle = newRow.insertCell();
      let newTextTitle = document.createTextNode(todoList[todo].title);
      newCellTitle.appendChild(newTextTitle);
      let newCellDesc = newRow.insertCell();
      let newTextDesc = document.createTextNode(todoList[todo].description);
      newCellDesc.appendChild(newTextDesc);
      let newCellPlace = newRow.insertCell();
      let newTextPlace = document.createTextNode(todoList[todo].place);
      newCellPlace.appendChild(newTextPlace);
      let newCellDate = newRow.insertCell();
      let newTextDate = document.createTextNode(todoList[todo].dueDate);
      newCellDate.appendChild(newTextDate);
      let newDeleteButton = document.createElement("input");
      newDeleteButton.type = "button";
      newDeleteButton.value = "x";
      newDeleteButton.addEventListener("click", function () {
        deleteTodo(todo);
      });
      let newCellDel = newRow.insertCell();
      newCellDel.appendChild(newDeleteButton);
    }
  }
};

setInterval(updateTodoList, 1000);

let deleteTodo = function (index) {
  todoList.splice(index, 1);
  updateJSONbin();
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
  let newDate = inputDate.value;
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
  updateJSONbin();
};
