const socket = io();
let chatBox = document.getElementById('chatBox');
let user = document.getElementById('userEmail').textContent;

chatBox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            socket.emit('message', { user: user, message: chatBox.value });
            chatBox.value = "";
        }
    }
});

socket.on('messageLogs', data => {
    if (!user) return;
    let log = document.getElementById('messageLogs');
    let messages = "";
    data.forEach(message => {
        messages = messages + `${message.user} dice: ${message.message} </br>`;
    });
    log.innerHTML = messages;
});

