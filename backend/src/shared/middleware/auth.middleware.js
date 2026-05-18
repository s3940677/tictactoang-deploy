const jwt = require('jsonwebtoken');
const authService = require('../../modules/auth/auth.service');

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const blacklisted = await authService.isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: you do not have permission' });
        }
        next();
    };
};

module.exports = { verifyToken, authorize };
