const User = require('../../shared/models/user.model');

class AdminRepository {
    async findAllPlayers() {
        return await User.find({ role: 'PLAYER' }).select('-password');
    }

    async findUserById(userId) {
        return await User.findById(userId).select('-password');
    }

    async updateStatus(userId, status) {
        return await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select('-password -__v');
    }
}

module.exports = new AdminRepository();
