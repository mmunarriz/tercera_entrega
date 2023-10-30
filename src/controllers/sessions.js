import jwt from 'jsonwebtoken';
import userModel from '../dao/models/users.js';
import { createHash, isValidPassword } from '../utils.js';
import config from '../config/config.js';


const ADMIN_EMAIL = config.adminEmail;
const ADMIN_PASSWORD = config.adminPassword;

// Controlador para el registro de usuarios
export async function registerUser(req, res) {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        // Verifica los campos obligatorios en la solicitud.
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ status: "error", error: "Missing required fields" });
        }

        // Verifica si el "email" ya existe en la DB
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ status: "error", error: "User already exists" });
        }

        // Crea el usuario en la DB
        const user = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password)
        };
        const result = await userModel.create(user);
        return res.status(200).json({ status: "success", message: "User registered" });
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({ status: "error", error: "Internal Server Error" });
    }
}

// Controlador para el inicio de sesion
export async function loginUser(req, res) {
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

}

