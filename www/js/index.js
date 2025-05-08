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
  console.log("requestDelete called", id);
  deleteTargetId = id;

  if (navigator.notification && navigator.notification.confirm) {
    navigator.notification.confirm(
      "Are you sure you want to delete this task?",
      (buttonIndex) => {
        if (buttonIndex === 1) {
          confirmDelete();
        } else {
          deleteTargetId = null;
        }
      },
      "Delete Confirmation",
      ["Delete", "Cancel"]
    );
  } else {
    // Fallback for browser environment
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (isConfirmed) {
      confirmDelete();
    } else {
      deleteTargetId = null;
    }
  }
}

function confirmDelete() {
  tasks = tasks.filter((t) => t.id !== deleteTargetId);
  deleteTargetId = null;
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

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  if (navigator.notification && navigator.notification.prompt) {
    navigator.notification.prompt(
      "Edit the task:",
      (result) => {
        if (result.buttonIndex === 1 && result.input1.trim() !== "") {
          task.text = result.input1.trim();
          saveTasks();
          renderTasks();
        }
      },
      "Edit Task",
      ["Save", "Cancel"],
      task.text
    );
  } else {
    // Fallback for browser environment
    const newText = prompt("Edit the task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      task.text = newText.trim();
      saveTasks();
      renderTasks();
    }
  }
}

function renderTasks() {
  const todoList = $("#todoList").empty();
  const doneList = $("#doneList").empty();

  tasks.forEach((task) => {
    const $li = $(
      `<li class="p-3 bg-gray-200 dark:bg-gray-700 rounded">${task.text}</li>`
    ).attr("data-id", task.id);

    $li.on("swiperight", () => requestDelete(task.id));
    if (!task.done) {
      $li.on("swipeleft", () => markAsDone(task.id));
      $li.on("click", () => editTask(task.id)); // Double-clic pour modifier
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
