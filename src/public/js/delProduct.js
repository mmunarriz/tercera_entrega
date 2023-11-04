async function eliminarProducto(pid) {
  // Mostrar un cuadro de diálogo con botones de Aceptar y Cancelar
  let confirmacion = confirm("¿Desea eliminar este producto?");

  if (confirmacion) {
    try {
      const response = await fetch(`/products/${pid}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        const data = await response.json();
        if (data.status === "success") {
          alert("Producto eliminado con éxito");
          window.location.href = '/products';
        } else {
          alert("Error al eliminar el producto");
        }
      } else if (response.status === 400) {
        const data = await response.json();
        alert(data.error);
      } else {
        alert("Error en la solicitud");
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }
  } else {
    // Cancelar la eliminación del producto
    window.location.href = '/products';
  }
}
