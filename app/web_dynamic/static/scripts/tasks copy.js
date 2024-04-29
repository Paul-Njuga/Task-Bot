/* jQuery for handling radio input change */
$(document).ready(function () {
  /* On form submission for adding a new task */
  $('.new-subtask').on('submit', function (event) {
    event.preventDefault();
    const form = $(this);
    const taskId = $(this).data('task-id');

    /* Disable submit button */
    form.find('button[type="submit"]').prop('disabled', true);

    $.ajax({
      type: 'POST',
      url: `/add_subtask/${taskId}`,
      /* Serialize form data */
      data: form.serialize(),
      success: function (newSubTask) {
        addTaskToTaskList(newSubTask);
        /* Clear the form inputs using the reset method */
        form[0].reset();
      },
      error: function (error) {
        console.error('Error adding new task: ' + JSON.stringify(error));
      },
      complete: function () {
        /* Re-enable submit button after completion */
        form.find('button[type="submit"]').prop('disabled', false);
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
});

function addTaskToTaskList (newSubTask) {
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
