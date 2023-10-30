import { Router } from 'express';
import Carts from '../dao/dbManagers/carts.js';
import Products from '../dao/dbManagers/products.js';
import cartsModel from "../dao/models/carts.js";

const cartsManager = new Carts();
const productsManager = new Products();
const router = Router();

// Crear un nuevo carrito
router.post("/", async (req, res) => {
    try {
        const newCarrito = { products: [] };

        // Guardar el nuevo carrito en la base de datos
        const result = await cartsManager.saveCart(newCarrito);

        res.status(200).send({ message: "Carrito agregado exitosamente", newCarritoId: result._id });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Listar los productos de un carrito especifico
router.get("/:cid", async (req, res) => {
    try {
        // Obtener el ID del carrito de los params de la ruta
        const cid = req.params.cid; // El ID se recibe como string

        // Obtener el carrito por su ID desde la base de datos con populate
        const carrito = await cartsManager.getCartById(cid);

        if (carrito) {
            // Populate para poblar los productos relacionados
            await cartsModel.populate(carrito, { path: 'products.product' });
            res.status(200).send(carrito);
        } else {
            res.status(404).send({ error: "Carrito no encontrado" });
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Agregar producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
    try {
        // Obtener el ID del producto y del carrito de los parámetros de la ruta
        const productId = req.params.pid;
        const carritoId = req.params.cid;

        // Verificar si el producto existe
        const existingProduct = await productsManager.getProductById(productId);

        if (!existingProduct) {
            return res.status(404).send({ message: "Producto inexistente" });
        }

        // Obtener la cantidad del producto
        const { quantity } = req.body;

        // Obtener el carrito por su ID desde la base de datos
        const carrito = await cartsManager.getCartById(carritoId);

        if (!carrito) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        // Agregar un nuevo objeto de producto al arreglo "products" dentro del carrito
        // Verificar si el producto ya existe en el carrito
        let existingProductIndex = -1;
        carrito.products.forEach((productInCart, index) => {
            if (productInCart.product.toString() === productId) {
                existingProductIndex = index;
            }
        });

        if (existingProductIndex !== -1) {
            // Si el producto ya existe, incrementar el campo quantity
            carrito.products[existingProductIndex].quantity += quantity;
        } else {
            // Si el producto no existe, agregarlo al carrito
            carrito.products.push({ product: productId, quantity });
        }

        // Guardar los datos del carrito actualizado en la base de datos
        await cartsManager.updateCart(carritoId, carrito);

        res.status(200).send({ message: "Producto agregado al carrito exitosamente" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
    try {
        // Obtener el ID del producto y del carrito de los parámetros de la ruta
        const productId = req.params.pid;
        const carritoId = req.params.cid;

        // Obtener el carrito por su ID desde la base de datos
        const carrito = await cartsManager.getCartById(carritoId);

        if (!carrito) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        // Buscar el índice del producto en el carrito
        const productIndex = carrito.products.findIndex(prod => prod.product === productId);

        if (productIndex === -1) {
            return res.status(404).send({ message: "Producto no encontrado en el carrito" });
        }

        // Eliminar el producto del carrito
        carrito.products.splice(productIndex, 1);

        // Actualizar el carrito en la base de datos
        await cartsManager.updateCart(carritoId, carrito);

        res.status(200).send({ message: "Producto eliminado del carrito exitosamente" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Validar si los productos existen en la base de datos
const validateProducts = async (products) => {
    const invalidProducts = [];

    for (const product of products) {
        const existingProduct = await productsManager.getProductById(product.product);
        if (!existingProduct) {
            invalidProducts.push(product.product);
        }
    }

    return invalidProducts;
};

// Actualizar todo el carrito con un nuevo arreglo de productos
router.put("/:cid", async (req, res) => {
    try {
        // Obtener el ID del carrito de los parametros de la ruta
        const carritoId = req.params.cid;

        // Obtener el nuevo arreglo de productos desde req.body
        const { products } = req.body;

        // Verificar si products es un arreglo valido
        if (!Array.isArray(products)) {
            return res.status(400).send({ message: "El cuerpo de la solicitud debe contener un arreglo de productos" });
        }

        // Validar si los productos recibidos son validos
        const invalidProducts = await validateProducts(products);

        if (invalidProducts.length > 0) {
            return res.status(404).send({ message: "Algunos productos no existen en la base de datos", invalidProducts });
        }

        // Obtener el carrito por su ID desde la base de datos
        const carrito = await cartsManager.getCartById(carritoId);

        if (!carrito) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        // Reemplazar el arreglo de productos en el carrito con el nuevo arreglo
        carrito.products = products;

        // Actualizar el carrito en la base de datos
        await cartsManager.updateCart(carritoId, carrito);

        res.status(200).send({ message: "Carrito actualizado exitosamente" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


// Actualizar la cantidad de ejemplares de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
    try {
        // Obtener el ID del producto y del carrito de los parámetros de la ruta
        const productId = req.params.pid;
        const carritoId = req.params.cid;

        // Obtener la cantidad actualizada del producto desde req.body
        const { quantity } = req.body;

        // Verificar si la cantidad es un número positivo
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).send({ message: "La cantidad debe ser un número positivo" });
        }

        // Obtener el carrito por su ID desde la base de datos
        const carrito = await cartsManager.getCartById(carritoId);

        if (!carrito) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        // Buscar el producto en el carrito
        const productInCart = carrito.products.find(prod => prod.product === productId);

        if (!productInCart) {
            return res.status(404).send({ message: "Producto no encontrado en el carrito" });
        }

        // Actualizar la cantidad del producto en el carrito
        productInCart.quantity = quantity;

        // Actualizar el carrito en la base de datos
        await cartsManager.updateCart(carritoId, carrito);

        res.status(200).send({ message: "Cantidad de ejemplares del producto actualizada exitosamente" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Eliminar todos los productos de un carrito
router.delete("/:cid", async (req, res) => {
    try {
        // Obtener el ID del carrito de los parámetros de la ruta
        const carritoId = req.params.cid;

        // Obtener el carrito por su ID desde la base de datos
        const carrito = await cartsManager.getCartById(carritoId);

        if (!carrito) {
            return res.status(404).send({ message: "Carrito no encontrado" });
        }

        // Vaciar el arreglo de productos en el carrito
        carrito.products = [];

        // Actualizar el carrito en la base de datos
        await cartsManager.updateCart(carritoId, carrito);

        res.status(200).send({ message: "Carrito vaciado exitosamente" });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});


export default router;
