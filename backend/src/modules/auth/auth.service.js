const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authRepository = require('./auth.repository');

class AuthService {
    async register(userData) {
        const existingUser = await authRepository.findByEmailOrUsername(userData.email, userData.username);
        if (existingUser) {
            const field = existingUser.email === userData.email ? 'Email' : 'Username';
            throw new Error(`${field} already exists`);
        }
        return await authRepository.createUser(userData);
    }

    async login(identifier, password) {
        const user = await authRepository.findByEmailOrUsername(identifier, identifier);
        if (!user) throw new Error('Invalid username/email or password');

        const now = Date.now();
        if (user.lockUntil && user.lockUntil > now) {
            const remainingTime = Math.ceil((user.lockUntil - now) / 1000);
            throw new Error(`Account locked. Please try again in ${remainingTime} seconds`);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const attempts = (user.loginAttempts || 0) + 1;
            const lockUntil = attempts >= 5 ? now + 60000 : null;
            await authRepository.updateLoginAttempts(user._id, attempts, lockUntil);
            throw new Error('Invalid username/email or password');
        }

        if (user.status === 'BANNED') {
            throw new Error('Your account has been banned. Please contact support for more information.');
        }

        await authRepository.updateLoginAttempts(user._id, 0, null);

        const token = jwt.sign(
            { userId: user._id, role: user.role, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { token, user };
    }

    async logout(token) {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || !decoded.exp) throw new Error('Invalid token');
            const expiresAt = new Date(decoded.exp * 1000);
            await authRepository.blacklistToken(token, expiresAt);
        } catch (err) {
            if (!err.message.includes('Invalid token')) return;
            throw err;
        }
    }

    async isTokenBlacklisted(token) {
        return await authRepository.isTokenBlacklisted(token);
    }
}

module.exports = new AuthService();
