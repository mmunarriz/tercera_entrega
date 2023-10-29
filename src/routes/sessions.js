import { Router } from 'express';
import jwt from 'jsonwebtoken';
import requireAuth from '../controllers/auth.js';
import config from '../config/config.js';
import cookieParser from 'cookie-parser';

const ADMIN_EMAIL = config.adminEmail
const ADMIN_PASSWORD = config.adminPassword

const router = Router();

router.use(cookieParser());

router.get("/", (req, res) => {
    return res.json({ message: "Hello World (public content)" });
});

router.post("/login", (req, res) => {
    // Recupera el usuario y contraseña del cuerpo del formulario.
    const { email, password } = req.body;

    // Comprueba si el email y las credenciales son válidas.
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {

        const name = "Admin Coderhouse";
        const userRole = "admin";
        // Genera un token JWT y establece la cookie.
        const token = jwt.sign({ name, email, role: userRole }, "t0k3nJwtS3cr3t", {
            expiresIn: '1h', // Tiempo de expiración de 1 hora
        });

        return res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ status: "success", message: "Logged in successfully" });
    } else {
        // Credenciales incorrectas, puedes devolver un mensaje de error.
        return res.status(401).json({ status: "error", message: "Invalid credentials" });
    }
});


// router.get("/protected", requireAuth, (req, res) => {
//     return res.json({ user: { email: req.userEmail, role: req.userRole } });
// });


router.get("/protected", requireAuth, (req, res) => {
    // Recupera el token de la cookie "access_token"
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(401).json({ status: "error", message: "Token not provided" });
    }
    try {
        // Decodificar el token
        const decoded = jwt.verify(token, "t0k3nJwtS3cr3t");
        // Eliminar los campos "iat" y "exp"
        const { iat, exp, ...userData } = decoded;
        return res.json(userData); // Retornar los datos del token sin "iat" y "exp"
    } catch (error) {
        return res.status(401).json({ status: "error", message: "Invalid token" });
    }
});


router.get("/logout", requireAuth, (req, res) => {
    return res
        .clearCookie("access_token")
        .status(200)
        .json({ message: "Successfully logged out" });
});

export default router;
