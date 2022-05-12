import { format, parseISO } from "date-fns";

import { listsTemplate } from "./template";

const listContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const newTaskDate = document.querySelector("[data-new-task-date-input]");
const clearCompleteTasksButton = document.querySelector(
  "[data-clear-complete-tasks-button]"
);

const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
let lists =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || listsTemplate;
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

listContainer.addEventListener("click", (e) => {
  setSelectedListId(e, "li", e.target.dataset.listId);
});

function setSelectedListId(e, elem, id) {
  if (checkElem(e, elem)) {
    selectedListId = id;
    saveAndRender();
  }
}

function checkElem(e, elem) {
  return e.target.tagName.toLowerCase() === elem;
}

tasksContainer.addEventListener("click", (e) => {
  if (checkElem(e, "input")) {
    const selectedList = selectElem(lists, selectedListId);
    const selectedTask = selectElem(selectedList.tasks, e.target.id);
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
});

clearCompleteTasksButton.addEventListener("click", (e) => {
  const selectedList = selectElem(lists, selectedListId);
  const allTasksInSelectedList = selectedList.tasks;
  selectedList.tasks = getEverythingNotCompleted(allTasksInSelectedList);
  saveAndRender();
});

function getEverythingNotCompleted(data) {
  return data.filter((x) => !x.complete);
}

deleteListButton.addEventListener("click", (e) => {
  lists = getEverythingNotSelected(lists, selectedListId);
  selectedListId = null;
  saveAndRender();
});

function getEverythingNotSelected(data, selectedElem) {
  return data.filter((x) => x.id !== selectedElem);
}

newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const listName = newListInput.value;
  if (isEmptyOrSpaces(listName)) return;
  const list = createList(listName);
  newListInput.value = null;
  lists.push(list);
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = newTaskInput.value;
  const taskDate = processDate(newTaskDate.value);

  if (isEmptyOrSpaces(taskName)) return;
  const task = createTask(taskName, taskDate);
  newTaskInput.value = null;
  newTaskDate.value = null;
  const selectedList = selectElem(lists, selectedListId);
  selectedList.tasks.push(task);
  saveAndRender();
});

function processDate(date) {
  return date === "" ? " " : formatDate(date);
}

function formatDate(date) {
  return format(parseISO(date), "MM/dd/yyyy");
}

function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

function generateId() {
  return Date.now().toString();
}

function createList(name) {
  return {
    id: generateId(),
    name,
    tasks: [],
  };
}

function createTask(name, date) {
  return {
    id: generateId(),
    name,
    complete: false,
    date,
  };
}

function saveAndRender() {
  save();
  render();
}

function save() {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() {
  clearElement(listContainer);
  renderLists();

  const selectedList = selectElem(lists, selectedListId);
  if (selectedListId == null) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    listTitleElement.textContent = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function selectElem(data, selectedId) {
  return data.find((x) => x.id === selectedId);
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach((task) => {
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    const taskName = taskElement.getElementById("task");
    const taskDate = taskElement.getElementById("date");
    label.htmlFor = task.id;
    taskName.append(task.name);
    taskDate.append(task.date);
    tasksContainer.appendChild(taskElement);
  });
}

function renderTaskCount(selectedList) {
  const incompleteTasksCount = taskCount(selectedList.tasks);
  const taskString = taskCountGrammar(incompleteTasksCount);
  listCountElement.textContent = `${incompleteTasksCount} ${taskString} remaining`;
}

function taskCountGrammar(num) {
  return num === 1 ? "task" : "tasks";
}

function taskCount(data) {
  return data.filter((x) => !x.complete).length;
}

function renderLists() {
  lists.forEach((list) => {
    const listElement = document.createElement("li");
    listElement.dataset.listId = list.id;
    listElement.classList.add("list-name");
    listElement.textContent = list.name;
    highlightSelectedList(list.id, selectedListId, listElement);
    listContainer.appendChild(listElement);
  });
}

function highlightSelectedList(id, elemId, elem) {
  if (id === elemId) {
    return elem.classList.add("active-list");
  }
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

render();
