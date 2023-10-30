import { Router } from 'express';
import { getHomePage, getLoginPage, getRegisterPage, logoutUser } from '../controllers/views.js';
import { getProfilePage, getCurrentPage, getChatPage } from '../controllers/views.js';

const router = Router();

// Rutas de acceso
router.get('/', getHomePage);
router.get('/login', getLoginPage);
router.get('/register', getRegisterPage);

// Rutas que requieren estar autenticado
router.get('/profile', getProfilePage);
router.get('/current', getCurrentPage);
router.get('/chat', getChatPage);
router.get('/logout', logoutUser);


export default router;