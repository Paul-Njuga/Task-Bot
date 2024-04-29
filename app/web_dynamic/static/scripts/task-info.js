$(document).ready(function () {
  /* On form submission for adding a new task */
  $('.new-subtask').on('submit', function (event) {
    event.preventDefault();
    const form = $(this);
    const taskId = form.data('task-id');

    $.ajax({
      type: 'POST',
      url: `/add_subtask/${taskId}`,
      data: form.serialize(),
      success: function (newSubTask) {
        addSubTaskToTaskList(newSubTask);
        /* Clear the form inputs using the reset method */
        form[0].reset();
      },
      error: function (error) {
        console.error('Error adding new task: ' + JSON.stringify(error));
      }
    });
  });

  $('.subtask-item').on('change', function () {
    const taskId = $(this).data('task-id');
    const subtaskId = $(this).attr('id');
    const isCompleted = $(this).prop('checked');
    const listItem = $(this).closest('li'); /* Store list item */

    if (isCompleted) {
      /* AJAX call to update task completion status */
      $.ajax({
        type: 'POST',
        url: `/update_subtask/${taskId}/${subtaskId}`,
        data: { status: true },
        success: function (response) {
          /* Log success message */
          console.log(response);
        },
        error: function (error) {
          console.error('Error updating task: ' + JSON.stringify(error));
          /* Uncheck checkbox if error */
          $(listItem).find('.subtask-item').prop('checked', false);
        }
      });
    } else {
      /* AJAX call to uncheck task completion status */
      $.ajax({
        type: 'POST',
        url: `/update_subtask/${taskId}/${subtaskId}`,
        data: { status: false }, // Set the task as incomplete
        success: function (response) {
          console.log(response);
        },
        error: function (error) {
          console.error('Error updating task: ' + JSON.stringify(error));
          $(listItem).find('.subtask-item').prop('checked', true);
        }
      });
    }
  });

  /* Add a dynamic event delegation click event listener to the delete-task-btn */
  $('.wrapper').on('click', '.delete-task-btn', function () {
    // Todo: Remember to add an alert to confirm deletion
    const taskId = $(this).data('task-id');

    /* AJAX to send a request to the Flask route for deleting a task */
    $.ajax({
      url: `/delete_task/${taskId}`,
      type: 'DELETE',
      success: function (response) {
        console.log(response);
        /* Remove the task from the DOM based on taskId */
        $(`#task-list #${taskId}`).fadeOut(100, function () {
          $(this).remove();
        });

        /* Close the task panel */
        $('.wrapper').removeClass('task-panel-open');
      },
      error: function (error) {
        console.error('Error deleting task: ' + JSON.stringify(error));
      }
    });
  });
});

function addSubTaskToTaskList (newSubTask) {
  const isChecked = newSubTask.completed ? 'checked' : '';
  const isCompleted = newSubTask.completed ? 'text-decoration: line-through;' : ''; /* Apply text decoration for completed tasks */
  const newItem = `<li>
    <div class="subtask">
      <input class="subtask-item" type="checkbox" id="${newSubTask.id}" data-name="${newSubTask.title}" ${isChecked}/>
      <label for="${newSubTask.id}" style="${isCompleted}" >
        <span class="subtask-label-text">${newSubTask.title}</span>
      </label>
      <button class="delete-subtask-btn">
        <img src="../static/svg/subtask-bin.svg" alt="" class="delete-subtask">
      </button>
    </div>
  </li>`;
  $('#subtask-list').prepend(newItem);
}
