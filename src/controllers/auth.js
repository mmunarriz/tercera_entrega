import jwt from 'jsonwebtoken';

const requireAuth = (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.sendStatus(403);
    }
    try {
        const data = jwt.verify(token, "t0k3nJwtS3cr3t");
        req.userEmail = data.email;
        req.userRole = data.role;
        return next();
    } catch {
        return res.sendStatus(403);
    }
};

export default requireAuth;
