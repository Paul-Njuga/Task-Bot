$(document).ready(function () {
  $('.wrapper').on('click', '.dotmenu-subtasks', function () {
    document.querySelector('.wrapper').classList.add('task-panel-open');
    document.querySelector('.wrapper').classList.remove('chatbot-panel-open');
    /* Get the task ID associated with the clicked button */
    const taskId = $(this).closest('li').find('.task-item').attr('id');

    /* Make an AJAX request to fetch task details from the server */
    $.ajax({
      url: `/get_task_info/${taskId}`,
      method: 'GET',
      success: function (data) {
        /* Replace the content of the task-section with the loaded HTML */
        $('.task-container').html(data);
      },
      error: function (error) {
        console.error('Error fetching task details:', error);
      }
    });
  });
  $('.wrapper').on('click', '.close-task', function () {
    document.querySelector('.wrapper').classList.remove('task-panel-open');
  });
});
