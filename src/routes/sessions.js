import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { registerUser, loginUser } from '../controllers/sessions.js';


const router = Router();
router.use(cookieParser());


// Ruta para el registro de usuarios
router.post('/register', registerUser);

// Ruta para el inicio de sesion
router.post('/login', loginUser);


export default router;
