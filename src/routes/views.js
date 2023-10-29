import { Router } from 'express';
import { cookieExtractor } from '../utils.js'
import productsModel from "../dao/models/products.js";
import requireAuth from "../controllers/auth.js"

const router = Router();

// Ruta de acceso libre
router.get('/', (req, res) => {
    res.render('login');
})

// Ruta de acceso libre
router.get('/home', (req, res) => {
    res.render('home');
})

// Ruta protegida: (solo accesible si el usuario no está autenticado)
router.get('/login', (req, res) => {
    const token = req.cookies.access_token;
    // Verificar si el usuario ya está logueado
    if (token) {
        return res.redirect('/products'); // Redireccionar a "/products" si ya está logueado
    }
    // Si no tiene una cookie vigente, permite el acceso a la vista de login
    res.render('login');
});

// Ruta protegida: (solo accesible si el usuario no está autenticado)
router.get('/register', (req, res) => {
    const token = req.cookies.access_token;
    // Verificar si el usuario ya está logueado
    if (token) {
        return res.redirect('/products'); // Redireccionar a "/products" si ya está logueado
    }
    // Si no tiene una cookie vigente, permite el acceso a la vista de login
    res.render('register');
});

// Ruta requiere estar autenticado
router.get('/profile', requireAuth, (req, res) => {
    // Recupera el token de la cookie "access_token"
    const user = cookieExtractor(req);

    if (!user) {
        return res.status(401).json({ status: "error", message: "Token not provided" });
    }
    const { name, email, role } = user;
    res.render('profile', { user });
})

// Ruta requiere estar autenticado
router.get('/current', requireAuth, (req, res) => {
    // Recupera el token de la cookie "access_token"
    const user = cookieExtractor(req);

    if (!user) {
        return res.status(401).json({ status: "error", message: "Token not provided" });
    }
    const { name, email, role } = user;
    res.render('current', { user });
})

router.get("/logout", requireAuth, (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .redirect("/login"); // Redireccionar al usuario a la vista de login
});

// Ruta requiere estar autenticado
router.get('/products', requireAuth, async (req, res) => {
    const { page = 1 } = req.query;
    const { docs, hasPrevPage, hasNextPage, nextPage, prevPage } = await productsModel.paginate({}, { limit: 8, page, lean: true });
    const products = docs;

    // Recupera el token de la cookie "access_token"
    const user = cookieExtractor(req);

    if (!user) {
        return res.status(401).json({ status: "error", message: "Token not provided" });
    }
    const { name, email, role } = user;

    res.render('products', {
        user,
        products,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage
    });
})

export default router;