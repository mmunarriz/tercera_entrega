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
  deleteProductPage,
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
router.delete("/:pid", deleteProductPage);

export default router;
