const form = document.getElementById('registerForm');

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);
    fetch('/sessions/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 400) {
                return response.json();
            } else {
                console.error('Error en el registro');
            }
        })
        .then(data => {
            if (data.status === "success") {
                alert("Successfully registered user");
                window.location.href = '/login';
            } else if (data.status === "error") { 
                alert(data.error);
                window.location.href = '/register';
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });


})