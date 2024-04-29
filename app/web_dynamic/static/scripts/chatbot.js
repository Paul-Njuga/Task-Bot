const chatbox = document.querySelector('.chatbox');
const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input span');

let userMessage = null;

const createChatLi = (message, className) => {
  /* Create a chat <li> element with passed message and className */
  const chatLi = document.createElement('li');
  chatLi.classList.add('chat', `${className}`);
  const chatContent =
    className === 'outgoing'
      ? '<p></p>'
      : '<span class="material-symbols-outlined">smart_toy</span><p></p>'; /* Add task icon after <p> tags */
  chatLi.innerHTML = chatContent;
  chatLi.querySelector('p').textContent = message;
  return chatLi;
};

const getResponse = () => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_input: userMessage })
  };

  /* Display 'Thinking...' message while waiting for the response */
  const pre = createChatLi('Thinking...', 'incoming');
  chatbox.appendChild(pre);
  const messageElement = pre.querySelector('p');

  /*
  Send POST request to chat_bot route & get json response
  JSON format = {0 : {'title': 'Task title', 'summary': 'Task summary'}}
  */
  fetch('/chatbot', requestOptions).then(res => res.json()).then(data => {
    const thinkingMessage = chatbox.querySelector('.incoming:last-of-type');
    if (thinkingMessage) {
      chatbox.removeChild(thinkingMessage);
    }
    Object.keys(data).forEach(index => {
      /* Create a new <p> element for each task received */
      const newTaskElement = createChatLi(data[index].title, 'incoming');
      newTaskElement.setAttribute('data-name', data[index].summary);

      /* Append a button to the paragraph */
      const taskParagraph = newTaskElement.querySelector('p');
      const button = document.createElement('button');
      button.classList.add('add-task-btn');
      const image = document.createElement('img');
      image.src = '../static/svg/add.svg';
      image.alt = '';
      image.classList.add('add-task-img');
      button.appendChild(image);
      taskParagraph.insertAdjacentElement('afterend', button);

      /* Handle click btn op */
      button.addEventListener('click', () => {
        const taskTitle = newTaskElement.querySelector('p').textContent;
        const taskDescription = newTaskElement.getAttribute('data-name');

        /* Send task details to the add-task route */
        sendTaskToServer(taskTitle, taskDescription);
      });

      /* Append the <li> to the chatbox */
      chatbox.appendChild(newTaskElement);
    });
  }).catch(() => {
    messageElement.textContent = 'Oops! Something went wrong. Please try again.';
  }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
};

const sendTaskToServer = (taskTitle, taskDescription) => {
  fetch('/add_gen_task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: taskTitle, description: taskDescription })
  })
    .then(response => {
      if (response.ok) {
        const genTskBtn = document.querySelector('.add-task-btn');
        genTskBtn.image.src = '../static/svg/add-gen-task.svg';
      }
    })
    .catch(error => {
      console.error('Error adding task:', error);
    });
};

const handleChat = () => {
  userMessage = chatInput.value.trim(); /* Get user entered message and remove extra whitespace */
  if (!userMessage) return;

  /* Clear the input textarea */
  chatInput.value = '';

  /* Append the user's message to the chatbox */
  chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    chatbox.scrollTo(0, chatbox.scrollHeight);
    getResponse();
  }, 600);
};

chatInput.addEventListener('keydown', (e) => {
  /*
  If Enter key is pressed without Shift key,
  and the window width is greater than 800px,
  handle the chat
  */
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener('click', handleChat);
