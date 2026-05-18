const User = require('../../shared/models/user.model');
const TokenBlacklist = require('../../shared/models/token-blacklist.model');

class AuthRepository {
    async findByEmailOrUsername(email, username) {
        return await User.findOne({
            $or: [{ email }, { username }],
        });
    }

    async createUser(userData) {
        return await User.create(userData);
    }

    async updateLoginAttempts(userId, attempts, lockUntil = null) {
        return await User.findByIdAndUpdate(userId, { loginAttempts: attempts, lockUntil });
    }

    async blacklistToken(token, expiresAt) {
        await TokenBlacklist.create({ token, expiresAt });
    }

    async isTokenBlacklisted(token) {
        const entry = await TokenBlacklist.findOne({ token });
        return !!entry;
    }
}

module.exports = new AuthRepository();
