document.getElementById('palm-tos-button').addEventListener('click', function() {
    var chatContainer = document.getElementById('chat-container');
    var palmTosContainer = document.getElementById('palm-tos-container');
    var settingsContainer = document.getElementById('settings-container')

  

    chatContainer.style.display="block"
    settingsContainer.style.display="none"

});
var apikeya = document.getElementById('api-key-input')

document.getElementById('save-button').addEventListener('click', function() {

    var apikey = document.getElementById('api-key-input').value
    chrome.runtime.sendMessage({ action: 'configapi', text: apikey });

});


document.getElementById('settings-icon').addEventListener('click', function() {
    var chatContainer = document.getElementById('chat-container');
    var palmTosContainer = document.getElementById('palm-tos-container');
    var settingsContainer = document.getElementById('settings-container')

  

    chatContainer.style.display="none"
    settingsContainer.style.display="block"


});






document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    function appendMessage(content, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add(isUser ? 'user-message' : 'assistant-message');
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
    }

    chrome.runtime.onMessage.addListener(function(action,sender,sendResponse) {
        if(action.action == "addMessage"){
            appendMessage(action.textUser, true);
            appendMessage(action.textResponse, false);
        }
    });

    sendButton.addEventListener('click', function() {
        const userMessage = userInput.value;

        if(userInput.value!=""){
        appendMessage(userMessage, true);
        userInput.value = '';
        

        // Send user message to background script
        chrome.runtime.sendMessage({ action: 'palm', text: userMessage },function(response) {
            // Handle response from background script
            console.log('Response received:', response);
            const assistantResponse = response !== undefined && response !== null ? response : 'No response received';

            appendMessage(assistantResponse, false);

            // Clear the input field
            userInput.value = '';
        });
    }
    });
});
