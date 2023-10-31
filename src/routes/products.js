import { Router } from 'express';
import Products from '../dao/dbManagers/products.js';
import { getProductsPage, getAddProdPage, addProductPage } from '../controllers/products.js';

const productsManager = new Products();
const router = Router();

// Obtener productos
router.get('/', getProductsPage);

// Vista para agregar un producto
router.get('/add_product', getAddProdPage);

// Agregar un producto
router.post('/', addProductPage);

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedProductData = req.body;

        // Verifica si el producto con el ID dado existe
        const existingProduct = await productsManager.getProductById(productId);

        if (!existingProduct) {
            return res.status(404).send({ status: "error", error: "Producto no encontrado" });
        }

        // Verifica si el código actualizado ya existe en otro producto (excepto el producto actual)
        if (updatedProductData.code !== existingProduct.code) {
            const isCodeExist = await productsManager.isProductCodeExist(updatedProductData.code);
            if (isCodeExist) {
                return res.status(400).send({ status: "error", error: "El código ya está en uso por otro producto" });
            }
        }

        // Actualiza el producto en la base de datos
        const result = await productsManager.updateProduct(productId, updatedProductData);

        res.status(200).send({ status: "success", message: "Producto actualizado exitosamente" });
    } catch (error) {
        res.status(400).send({ status: "error", error: error.message });
    }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;

        // Verifica si el producto con el ID dado existe
        const existingProduct = await productsManager.getProductById(productId);

        if (!existingProduct) {
            return res.status(404).send({ status: "error", error: "Producto no encontrado" });
        }

        // Elimina el producto de la base de datos
        await productsManager.deleteProduct(productId);

        res.status(200).send({ status: "success", message: "Producto eliminado exitosamente" });
    } catch (error) {
        res.status(400).send({ status: "error", error: error.message });
    }
});

export default router;
