$(document).ready(() => {
  document.querySelector('.dotmenu-subtasks').addEventListener('click', () => {
    document.querySelector('.wrapper').classList.add('task-panel-open');
    document.querySelector('.wrapper').classList.remove('chatbot-panel-open');
  });
  document.querySelector('.close-task').addEventListener('click', () => {
    document.querySelector('.wrapper').classList.toggle('task-panel-open');
  });
});
