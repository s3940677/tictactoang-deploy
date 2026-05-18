const User = require('../../shared/models/user.model');

class ProfileRepository {
    async findById(userId) {
        return await User.findById(userId).select('-password -loginAttempts -lockUntil');
    }

    async findByIdWithPassword(userId) {
        return await User.findById(userId);
    }

    async findConflict(userId, email, username) {
        return await User.findOne({
            _id: { $ne: userId },
            $or: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : []),
            ],
        });
    }

    async updateProfile(userId, fields) {
        return await User.findByIdAndUpdate(userId, fields, { new: true })
            .select('-password -loginAttempts -lockUntil');
    }

    async updatePassword(userId, newHashedPassword) {
        return await User.findByIdAndUpdate(
            userId,
            { password: newHashedPassword },
            { new: true }
        ).select('-password -loginAttempts -lockUntil');
    }

    async updateAvatar(userId, avatarPath) {
        return await User.findByIdAndUpdate(
            userId,
            { avatar: avatarPath },
            { new: true }
        ).select('-password -loginAttempts -lockUntil');
    }

    async updateWallet(userId, amount) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { wallet: amount } },
            { new: true }
        ).select('-password -loginAttempts -lockUntil');
    }

    async updatePremiumStatus(userId, isPremium, premiumExpiry) {
        return await User.findByIdAndUpdate(
            userId,
            { isPremium, premiumExpiry },
            { new: true }
        ).select('-password -loginAttempts -lockUntil');
    }
}

module.exports = new ProfileRepository();
