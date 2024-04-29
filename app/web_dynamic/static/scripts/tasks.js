/* jQuery for handling radio input change */
$(document).ready(function () {
  setTimeout(function() {
    $('#opt-1').trigger('change');
  }, 10);
  $('input[name="nav"]').on('change', function () {
    const status = $(this).attr('id') === 'opt-1' ? false : true;

    $.ajax({
      url: '/get_tasks',
      type: 'GET',
      data: { status: status },
      success: function (data) {
        showHideAddTaskSection(status);
        updateTaskList(data);
      },
      error: function (error) {
        console.error('Error fetching tasks: ' + JSON.stringify(error));
      }
    });
  });

  /* On form submission for adding a new task */
  $('.new-task').on('submit', function (event) {
    event.preventDefault();
    const form = $(this);

    $.ajax({
      type: 'POST',
      url: '/add_task',
      /* Serialize form data */
      data: form.serialize(),
      success: function (newTask) {
        addTaskToTaskList(newTask);
        /* Clear the form inputs using the reset method */
        form[0].reset();
      },
      error: function (error) {
        console.error('Error adding new task: ' + JSON.stringify(error));
      }
    });
  });
});

function addTaskToTaskList (newTask) {
  const newItem = `<li>
    <div class="task">
      <input class="task-item" type="checkbox" id="${newTask.id}" data-name="${newTask.title}" />
      <label for="${newTask.id}" >
        <span class="task-label-text">${newTask.title}</span>
      </label>
      <button class="task-menu-open">
        <img src="../static/svg/subtasks.svg" alt="" class="dotmenu-subtasks">
      </button>
    </div>
  </li>`;
  $('#task-list').append(newItem);
}

/* Function to show/hide 'add-task' section based on the completion status */
function showHideAddTaskSection (status) {
  const addTaskSection = $('#add-task-section');
  if (!status) {
    addTaskSection.show(); /* Show 'add-task' section for 'opt-1' */
  } else {
    addTaskSection.hide(); /* Hide 'add-task' section for 'opt-2' */
  }
}

// Function to update the task list dynamically
function updateTaskList (data) {
  const taskList = $('#task-list');
  taskList.empty(); /* Clear the task list */
  /* Append tasks dynamically based on the received data */
  data.forEach(task => {
    const isChecked = task.completed ? 'checked' : '';
    const isCompleted = task.completed ? 'text-decoration: line-through;' : ''; /* Apply text decoration for completed tasks */
    const listItem = `<li>
      <div class="task">
        <input class="task-item" type="checkbox" id="${task.id}" data-name="${task.title}" ${isChecked} />
        <label for="${task.id}" style="${isCompleted}">
          <span class="task-label-text">${task.title}</span>
        </label>
        <button class="task-menu-open">
          <img src="../static/svg/subtasks.svg" alt="" class="dotmenu-subtasks">
        </button>
      </div>
    </li>`;
    taskList.append(listItem);
  });

  $('.task-item').on('change', function () {
    const taskId = $(this).attr('id');
    const isCompleted = $(this).prop('checked');
    const listItem = $(this).closest('li'); /* Store list item */

    if (isCompleted) {
      /* AJAX call to update task completion status */
      $.ajax({
        type: 'POST',
        url: '/update_task/' + taskId,
        data: { status: true },
        success: function (response) {
          /* Log success message */
          console.log(response);
          /* Fade out if successful */
          listItem.fadeOut(100);
        },
        error: function (error) {
          console.error('Error updating task: ' + JSON.stringify(error));
          /* Uncheck checkbox if error */
          $(listItem).find('.task-item').prop('checked', false);
        }
      });
    } else {
      /* AJAX call to uncheck task completion status */
      $.ajax({
        type: 'POST',
        url: '/update_task/' + taskId,
        data: { status: false }, // Set the task as incomplete
        success: function (response) {
          console.log(response);
          listItem.fadeOut(100);
        },
        error: function (error) {
          console.error('Error updating task: ' + JSON.stringify(error));
          $(listItem).find('.task-item').prop('checked', true);
        }
      });
    }
  });
}
