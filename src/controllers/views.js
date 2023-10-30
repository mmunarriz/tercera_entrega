import { cookieExtractor } from '../utils.js';
import productsModel from '../dao/models/products.js';
import requireAuth from './auth.js';


// Controlador para la vista de inicio
export function getHomePage(req, res) {
    res.render('login');
}

// Controlador para la vista de inicio de sesión
export function getLoginPage(req, res) {
    const token = req.cookies.access_token;
    // Verificar si el usuario ya está logueado
    if (token) {
        return res.redirect('/products'); // Redireccionar a "/products" si ya está logueado
    }
    res.render('login');
}

// Controlador para la vista de registro
export function getRegisterPage(req, res) {
    const token = req.cookies.access_token;
    // Verificar si el usuario ya está logueado
    if (token) {
        return res.redirect('/products'); // Redireccionar a "/products" si ya está logueado
    }
    res.render('register');
}

// Controlador para la vista de perfil
export function getProfilePage(req, res) {
    // Verifica la autenticación
    requireAuth(req, res, () => {
        // Recupera el token de la cookie "access_token"
        const user = cookieExtractor(req);

        if (!user) {
            return res.status(401).json({ status: "error", message: "Token not provided" });
        }
        const { name, email, role } = user;
        res.render('profile', { user });
    });
}

// Controlador para la vista actual
export function getCurrentPage(req, res) {
    // Verifica la autenticación
    requireAuth(req, res, () => {
        // Recupera el token de la cookie "access_token"
        const user = cookieExtractor(req);

        if (!user) {
            return res.status(401).json({ status: "error", message: "Token not provided" });
        }
        const { name, email, role } = user;
        res.render('current', { user });
    });
}

// Controlador para la vista de chat
export function getChatPage(req, res) {
    // Verifica la autenticación
    requireAuth(req, res, () => {
        // Recupera el token de la cookie "access_token"
        const user = cookieExtractor(req);

        if (!user) {
            return res.status(401).json({ status: "error", message: "Token not provided" });
        }
        const { name, email, role } = user;
        res.render('chat', { user });
    });
}

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

// Controlador para la vista de cierre de sesión
export function logoutUser(req, res) {
    // Verifica la autenticación
    requireAuth(req, res, () => {
        return res
            .clearCookie("access_token")
            .status(200)
            .redirect("/login"); // Redireccionar al usuario a la vista de login
    });
}
