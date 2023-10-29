import { Router } from 'express';
import jwt from 'jsonwebtoken';
import requireAuth from '../controllers/auth.js';
import userModel from '../dao/models/users.js';
import { createHash, isValidPassword } from '../utils.js'
import config from '../config/config.js';
import cookieParser from 'cookie-parser';

const ADMIN_EMAIL = config.adminEmail
const ADMIN_PASSWORD = config.adminPassword

const router = Router();

router.use(cookieParser());

router.get("/", (req, res) => {
    return res.json({ message: "Hello World (public content)" });
});

router.post("/login", async (req, res) => {
    // Recuperar el usuario y password del cuerpo del formulario.
    const { email, password } = req.body;

    // Comprobar si el usuario existe localmente.
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const name = "Admin Coderhouse";
        const userRole = "admin";
        // Generar un token JWT con los datos 'name', 'email', 'role'
        const token = jwt.sign({ name, email, role: userRole }, "t0k3nJwtS3cr3t", {
            expiresIn: '1h', // Tiempo de expiración de 1 hora
        });
        // Establecer la cookie en el navegador del usuario
        return res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ status: "success", message: "Logged in successfully" });
    }

    // Si el usuario no existe localmente lo busca en la base de datos
    try {
        const user = await userModel.findOne({ email });

        if ((!user) || (!isValidPassword(user, password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const name = `${user.first_name} ${user.last_name}`;
        // Generar un token JWT con los datos 'name', 'email', 'role'
        const token = jwt.sign({ name: name, email, role: user.role }, "t0k3nJwtS3cr3t", {
            expiresIn: '1h',
        });
        // Establecer la cookie en el navegador del usuario
        return res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ status: "success", message: "Logged in successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    }

});


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
