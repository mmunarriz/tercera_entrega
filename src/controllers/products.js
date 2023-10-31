import { cookieExtractor } from '../utils.js';
import productsModel from '../dao/models/products.js';
import Products from '../dao/dbManagers/products.js';
import requireAuth from './auth.js';

const productsManager = new Products();

// Controlador para la vista de productos
export async function getProductsPage(req, res) {
    // Verifica la autenticación
    requireAuth(req, res, async () => {
        try {
            // Recupera el token de la cookie "access_token"
            const user = cookieExtractor(req);

            if (!user) {
                return res.status(401).json({ status: "error", message: "Token not provided" });
            }
            const { name, email, role } = user;

            const { page = 1 } = req.query;
            const result = await productsModel.paginate({}, { limit: 8, page, lean: true });
            const { docs, hasPrevPage, hasNextPage, nextPage, prevPage } = result;
            const products = docs;

            res.render('products', {
                user,
                products,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: "error", message: "Internal Server Error" });
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
            return res.status(401).json({ status: "error", message: "Token not provided" });
        }
        const { name, email, role } = user;
        if (user.role === 'admin') {
            res.render('add_product', { user });
        } else {
            res.render('products', { user });
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
                return res.status(401).json({ status: "error", message: "Token not provided" });
            }
            const { name, email, role } = user;

            // Recibe un objeto JSON con los datos del nuevo producto
            // Verifica que los campos obligatorios estén presentes
            const requiredFields = ["title", "description", "category", "price", "code", "stock"];
            for (const field of requiredFields) {
                if (!req.body[field]) {
                    throw new Error(`El campo '${field}' es obligatorio.`);
                }
            }

            // Verifica si el "code" recibido ya existe en algún producto en la base de datos
            const newProductCode = req.body.code;
            const isCodeExist = await productsManager.isProductCodeExist(newProductCode);

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
                thumbnails: req.body.thumbnails
            };

            // Agregar el nuevo producto a la base de datos
            const result = await productsManager.saveProduct(newProduct);

            res.status(200).send({ status: "success", payload: result });
        } catch (error) {
            res.status(400).send({ status: "error", error: error.message });
        }
    });
}