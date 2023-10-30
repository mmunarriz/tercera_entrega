import { cookieExtractor } from '../utils.js';
import productsModel from '../dao/models/products.js';
import requireAuth from './auth.js';


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