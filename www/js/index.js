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

  // Animation pour la nouvelle tâche
  const newTask = $(`[data-id="${tasks[tasks.length - 1].id}"]`);
  newTask.hide().fadeIn(300);
}

function markAsDone(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = true;

  // Animation lors du marquage comme terminé
  const $taskElement = $(`li[data-id="${id}"]`);
  $taskElement.animate({ opacity: 0.5, marginLeft: "100%" }, 400, function () {
    saveTasks();
    renderTasks();
  });
}

function requestDelete(id) {
  console.log("requestDelete called", id);
  deleteTargetId = id;

  // Ajouter une classe visuelle pour indiquer que la tâche est sélectionnée pour suppression
  $(`li[data-id="${id}"]`)
    .addClass("delete-pending")
    .css("background-color", "#ffdddd");

  if (navigator.notification && navigator.notification.confirm) {
    navigator.notification.confirm(
      "Are you sure you want to delete this task?",
      (buttonIndex) => {
        if (buttonIndex === 1) {
          confirmDelete();
        } else {
          deleteTargetId = null;
          $(`li[data-id="${id}"]`)
            .removeClass("delete-pending")
            .css("background-color", "");
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
      $(`li[data-id="${id}"]`)
        .removeClass("delete-pending")
        .css("background-color", "");
    }
  }
}

function confirmDelete() {
  // Animation pour la suppression
  const $taskToDelete = $(`li[data-id="${deleteTargetId}"]`);
  $taskToDelete.slideUp(300, function () {
    tasks = tasks.filter((t) => t.id !== deleteTargetId);
    deleteTargetId = null;
    saveTasks();
    renderTasks();
  });
}

function resetTasks() {
  console.log("resetTasks called");
  // Animation pour le reset
  $("#todoList li, #doneList li").fadeOut(300, function () {
    tasks = [];
    saveTasks();
    renderTasks();
    $("#taskInput").focus();
  });
}

function editTask(id) {
  // Ajout d'une légère animation sur la tâche en cours de modification
  const $taskElement = $(`li[data-id="${id}"]`);
  $taskElement.fadeOut(100).fadeIn(100);

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
          // Mettre en évidence la tâche modifiée
          $(`li[data-id="${id}"]`).hide().fadeIn(300);
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
      // Mettre en évidence la tâche modifiée
      $(`li[data-id="${id}"]`).hide().fadeIn(300);
    }
  }
}

function renderTasks() {
  const todoList = $("#todoList").empty();
  const doneList = $("#doneList").empty();

  tasks.forEach((task) => {
    const $li = $(
      `<li class="p-3 bg-gray-200 dark:bg-gray-700 rounded transition-all duration-300">${task.text}</li>`
    ).attr("data-id", task.id);

    // Ajouter des gestionnaires d'évènements pour les animations de glissement
    $li.on("swiperight", function () {
      $(this).animate({ marginLeft: "50px", opacity: 0.7 }, 150, function () {
        $(this).animate({ marginLeft: "0px", opacity: 1 }, 150, function () {
          requestDelete(task.id);
        });
      });
    });

    if (!task.done) {
      $li.on("swipeleft", function () {
        $(this).animate(
          { marginLeft: "-50px", opacity: 0.7 },
          150,
          function () {
            $(this).animate(
              { marginLeft: "0px", opacity: 1 },
              150,
              function () {
                markAsDone(task.id);
              }
            );
          }
        );
      });
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
