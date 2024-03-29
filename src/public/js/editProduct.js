const form = document.getElementById('editProductForm');
const productId = form.querySelector('[name="pid"]');
const pid = productId.value;

form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const obj = {};
    data.forEach((value, key) => obj[key] = value);
    fetch(`/products/${pid}`, {
        method: 'PUT',
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
                alert("Successfully updated product");
                window.location.href = '/products';
            } else if (data.status === "error") {
                alert(data.error);
                window.location.href = '/products';
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });


})