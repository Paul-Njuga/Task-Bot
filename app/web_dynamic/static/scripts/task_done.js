document.addEventListener('change', async function (event) {
  const checkbox = event.target;

  /* Check if the changed element is a checkbox with the class 'task-item' */
  if (checkbox.matches('.task-item')) {
    /* Get the task ID associated with the checkbox */
    const taskId = checkbox.id;

    if (checkbox.checked) {
      /* Send a POST request to update the task's completion status */
      const response = await fetch(`/update_task/${taskId}`, {
        method: 'POST'
      });

      if (response.ok) {
        checkbox.checked = true;
      } else {
        console.error('Failed to update task completion status.');
      }
    }
  }
});
