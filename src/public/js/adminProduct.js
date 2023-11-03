function editarProducto(_id) {
  fetch(`/products/${_id}`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else {
        console.error('Error en el registro');
      }
    })
    .then((data) => {
      if (data.status === 'success') {
        
        const product = data.product;
        const user = data.user;
    
        // Serializa el objeto 'product' a JSON
        const productJSON = JSON.stringify(product);
        const encodedProduct = encodeURIComponent(productJSON);

        // Redirigir a la página de edición del producto
        window.location.href = `edit_product?product=${encodedProduct}`;
      } else {
        // Manejar el caso en el que no se encuentra el producto
        console.error('Producto no encontrado');
      }
    })
    .catch((error) => {
      // Manejar errores de la solicitud
      console.error('Error al obtener el producto:', error);
    });
}

function eliminarProducto(_id) {
  // Lógica para eliminar un producto
  window.location.href = '/products';
}