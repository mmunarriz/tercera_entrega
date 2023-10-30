import { Router } from 'express';
import { getHomePage, getLoginPage, getRegisterPage, getProfilePage, getCurrentPage, getProductsPage, logoutUser } from '../controllers/views.js';


const router = Router();

// Rutas de acceso
router.get('/', getHomePage);
router.get('/login', getLoginPage);
router.get('/register', getRegisterPage);

// Rutas que requieren estar autenticado
router.get('/profile', getProfilePage);
router.get('/current', getCurrentPage);
router.get('/products', getProductsPage);
router.get('/logout', logoutUser);


export default router;