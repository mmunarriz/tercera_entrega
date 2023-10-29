import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

// handlebars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

// bcrypt
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)


// Extraer data de cookies
export const cookieExtractor = (req) => {
    let token = req.cookies.access_token;
    if (!token) {
        return null;
    }
    try {
        // Decodificar el token
        const decoded = jwt.verify(token, "t0k3nJwtS3cr3t");
        // Eliminar los campos "iat" y "exp"
        const { iat, exp, ...userData } = decoded;
        return userData; // Retornar los datos del token sin "iat" y "exp"
    } catch (error) {
        return null;
    }
}
