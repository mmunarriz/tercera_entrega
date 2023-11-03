import { cookieExtractor } from "../utils.js";
import productsModel from "../dao/models/products.js";
import Products from "../dao/dbManagers/products.js";
import requireAuth from "./auth.js";

const productsManager = new Products();

// Controlador para la vista de productos
export async function getProductsPage(req, res) {
  // Verifica la autenticación
  requireAuth(req, res, async () => {
    try {
      // Recupera el token de la cookie "access_token"
      const user = cookieExtractor(req);

      if (!user) {
        return res
          .status(401)
          .json({ status: "error", message: "Token not provided" });
      }
      const { name, email, role } = user;

      const { page = 1 } = req.query;
      const result = await productsModel.paginate(
        {},
        { limit: 5, page, lean: true }
      );
      const { docs, hasPrevPage, hasNextPage, nextPage, prevPage } = result;
      const products = docs;

      let render_page = "products";
      if (user.role === "admin") {
        render_page = "admin_products";
      }

      res.render(render_page, {
        user,
        products,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  });
}

// Controlador para la vista de un producto
export async function getProduct(req, res) {
  // Verifica la autenticación
  requireAuth(req, res, async () => {
    try {
      // Recupera el token de la cookie "access_token"
      const user = cookieExtractor(req);

      if (!user) {
        return res
          .status(401)
          .json({ status: "error", message: "Token not provided" });
      }
      const { name, email, role } = user;
      const productId = req.params.pid;
      const product = await productsManager.getProductById(productId);

      let render_page = "products";
      if (user.role === "admin") {
        render_page = "edit_product";
      }

      if (product) {
        // console.log(product);
        res.render(render_page, {
          product,
        });
      } else {
        res
          .status(400)
          .json({
            status: "error",
            error: "Producto no encontrado",
          });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        error: "No se pudieron obtener productos debido a un error interno",
      });
    }
  });
}

// Controlador para la vista de agregar un producto
export function getAddProdPage(req, res) {
  // Verifica la autenticación
  requireAuth(req, res, () => {
    // Recupera el token de la cookie "access_token"
    const user = cookieExtractor(req);

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Token not provided" });
    }
    const { name, email, role } = user;
    if (user.role === "admin") {
      res.render("add_product", { user });
    } else {
      res.render("products", { user });
    }
  });
}

// Controlador para la vista de agregar productos
export async function addProductPage(req, res) {
  // Verifica la autenticación
  requireAuth(req, res, async () => {
    try {
      // Recupera el token de la cookie "access_token"
      const user = cookieExtractor(req);

      if (!user) {
        return res
          .status(401)
          .json({ status: "error", message: "Token not provided" });
      }
      const { name, email, role } = user;

      // Recibe un objeto JSON con los datos del nuevo producto
      // Verifica que los campos obligatorios estén presentes
      const requiredFields = [
        "title",
        "description",
        "category",
        "price",
        "code",
        "stock",
      ];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new Error(`El campo '${field}' es obligatorio.`);
        }
      }

      // Verifica si el "code" recibido ya existe en algún producto en la base de datos
      const newProductCode = req.body.code;
      const isCodeExist = await productsManager.isProductCodeExist(
        newProductCode
      );

      if (isCodeExist) {
        throw new Error("Ya existe un producto con el mismo código.");
      }

      const newProduct = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        price: req.body.price,
        code: req.body.code,
        stock: req.body.stock,
        thumbnails: req.body.thumbnails,
      };

      // Agregar el nuevo producto a la base de datos
      const result = await productsManager.saveProduct(newProduct);

      res.status(200).send({ status: "success", payload: result });
    } catch (error) {
      res.status(400).send({ status: "error", error: error.message });
    }
  });
}

// Controlador para la vista de editar productos
export async function editProductPage(req, res) {
  // Verifica la autenticación
  requireAuth(req, res, async () => {
    try {
      const productId = req.params.pid;
      const updatedProductData = req.body;

      // Verifica si el producto con el ID dado existe
      const existingProduct = await productsManager.getProductById(productId);

      if (!existingProduct) {
        return res
          .status(404)
          .send({ status: "error", error: "Producto no encontrado" });
      }

      // Verifica si el código actualizado ya existe en otro producto (excepto el producto actual)
      if (updatedProductData.code !== existingProduct.code) {
        const isCodeExist = await productsManager.isProductCodeExist(
          updatedProductData.code
        );
        if (isCodeExist) {
          return res.status(400).send({
            status: "error",
            error: "El código ya está en uso por otro producto",
          });
        }
      }

      // Actualiza el producto en la base de datos
      const result = await productsManager.updateProduct(
        productId,
        updatedProductData
      );

      res.status(200).send({
        status: "success",
        message: "Producto actualizado exitosamente",
      });
    } catch (error) {
      res.status(400).send({ status: "error", error: error.message });
    }
  });
}
