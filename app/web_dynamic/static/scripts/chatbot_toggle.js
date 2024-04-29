$(document).ready(() => {
  document.querySelector('.open-chatbot').addEventListener('click', () => {
    document.querySelector('.wrapper').classList.toggle('chatbot-panel-open');
  });
  document.querySelector('.close-chatbot').addEventListener('click', () => {
    document.querySelector('.wrapper').classList.toggle('chatbot-panel-open');
  });
});
