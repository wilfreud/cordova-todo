document.documentElement.classList.toggle("light");
let tasks = [];
let deleteTargetId = null;

document.addEventListener("deviceready", init);
document.addEventListener("DOMContentLoaded", init);

function init() {
  console.log("init called");
  $("#addBtn").on("click", addTask);
  $("#resetBtn").on("click", resetTasks);
  $("#confirmDelete").on("click", confirmDelete);
  $("#cancelDelete").on("click", () => {
    $("#confirmDeletePopup").popup("close");
    deleteTargetId = null;
  });

  $("#taskInput").on("keypress", (e) => {
    if (e.which === 13) addTask();
  });

  loadTasks();
  renderTasks();
}

function addTask() {
  const input = $("#taskInput");
  const text = input.val().trim();
  if (!text) return;

  tasks.push({ id: uuidv4(), text, done: false });
  input.val("");
  input.focus();
  saveTasks();
  renderTasks();
}

function markAsDone(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = true;
  saveTasks();
  renderTasks();
}

function requestDelete(id) {
  deleteTargetId = id;
  $("#confirmDeletePopup").popup("open");
}

function confirmDelete() {
  tasks = tasks.filter((t) => t.id !== deleteTargetId);
  deleteTargetId = null;
  $("#confirmDeletePopup").popup("close");
  saveTasks();
  renderTasks();
}

function resetTasks() {
  console.log("resetTasks called");
  tasks = [];
  saveTasks();
  renderTasks();
  $("#taskInput").focus();
}

function renderTasks() {
  const todoList = $("#todoList").empty();
  const doneList = $("#doneList").empty();

  tasks.forEach((task) => {
    const $li = $(
      `<li class="p-3 bg-gray-200 dark:bg-gray-700 rounded">${task.text}</li>`
    ).attr("data-id", task.id);

    if (!task.done) {
      $li.on("swipeleft", () => markAsDone(task.id));
      $li.on("swiperight", () => requestDelete(task.id));
      todoList.append($li);
    } else {
      doneList.append($li);
    }
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const raw = localStorage.getItem("tasks");
  tasks = raw ? JSON.parse(raw) : [];
}

window.onload = () => {
  init();
};
