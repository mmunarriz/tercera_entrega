const socket = io();
let user;
let chatBox = document.getElementById('chatBox');

Swal.fire({
    title: "Identificate",
    input: "text",
    text: "Ingresa el correo para identificarte",
    inputValidator: (value) => {
        return !value && 'Necesitas escribir un correo de usuario'
    },
    allowOutsideClick: false,
}).then(result => {
    user = result.value
    socket.emit('authenticated', user);
})

chatBox.addEventListener('keyup', evt => {
    if (evt.key === "Enter") {
        if (chatBox.value.trim().length > 0) {
            socket.emit('message', { user: user, message: chatBox.value })
            chatBox.value = "";
        }
    }
})

socket.on('messageLogs', data => {
    if (!user) return;
    let log = document.getElementById('messageLogs');
    let messages = "";
    data.forEach(message => {
        messages = messages + `${message.user} dice: ${message.message} </br>`
    })
    log.innerHTML = messages;
})
socket.on('newUserConnected', user => {
    if (!user) return
    Swal.fire({
        toast: true,
        position: "top-right",
        text: "Nuevo usuario conectado",
        title: `${user} se ha unido al chat`,
        timer: 3000,
        showConfirmButton: false
    })
})