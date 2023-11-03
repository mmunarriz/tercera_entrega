import { Router } from "express";
import Products from "../dao/dbManagers/products.js";
import {
  getProductsPage,
  getAddProdPage,
  addProductPage,
} from "../controllers/products.js";
import {
  getProduct,
  editProductPage,
} from "../controllers/products.js";

const productsManager = new Products();
const router = Router();

// Obtener productos
router.get("/", getProductsPage);

// Vista para agregar un producto
router.get("/add_product", getAddProdPage);

// Agregar un producto
router.post("/", addProductPage);

// Listar un producto específico por ID
router.get("/:pid", getProduct);

// Editar un producto
router.put("/:pid", editProductPage);

// Eliminar un producto
router.delete("/:pid", async (req, res) => {
  try {
    const productId = req.params.pid;

    // Verifica si el producto con el ID dado existe
    const existingProduct = await productsManager.getProductById(productId);

    if (!existingProduct) {
      return res
        .status(404)
        .send({ status: "error", error: "Producto no encontrado" });
    }

    // Elimina el producto de la base de datos
    await productsManager.deleteProduct(productId);

    res
      .status(200)
      .send({ status: "success", message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(400).send({ status: "error", error: error.message });
  }
});

export default router;
