const chatbox = document.querySelector('.chatbox');
const chatInput = document.querySelector('.chat-input textarea');
const sendChatBtn = document.querySelector('.chat-input span');

let userMessage = null;

const createChatLi = (message, className) => {
  // Create a chat <li> element with passed message and className
  const chatLi = document.createElement('li');
  chatLi.classList.add('chat', `${className}`);
  const chatContent =
    className === 'outgoing'
      ? '<p></p>'
      : '<span class="material-symbols-outlined">smart_toy</span><p></p>'; /* Add task icon after <p> tags */
  chatLi.innerHTML = chatContent;
  chatLi.querySelector('p').textContent = message;
  return chatLi; // return chat <li> element
};

const displayTasks = (tasks, msgElement) => {
  Object.keys(tasks).forEach(index => {
    const task = tasks[index];
    const title = task.title;
    msgElement.textContent = title;
  });
};

const getResponse = (chatElement) => {
  const messageElement = chatElement.querySelector('p');
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_input: userMessage })
  };

  // Send POST request to chat_bot route & get json response
  // set the reponse as paragraph text
  const response = fetch('/chatbot', requestOptions)
    .catch(() => {
      messageElement.textContent =
        'Oops! Something went wrong. Please try again.';
    });
  const tasks = response.json();
  displayTasks(tasks, messageElement);
  chatbox.scrollTo(0, chatbox.scrollHeight);
};

const handleChat = () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea
  chatInput.value = '';

  // Append the user's message to the chatbox
  chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Display 'Thinking...' message while waiting for the response
    const incomingChatLi = createChatLi('Thinking...', 'incoming');
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    getResponse(incomingChatLi);
  }, 600);
};

chatInput.addEventListener('keydown', (e) => {
  // If Enter key is pressed without Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener('click', handleChat);
