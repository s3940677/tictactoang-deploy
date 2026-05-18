const adminRepository = require('./admin.repository');
const gameInterface = require('../game/game.interface');

class AdminService {
    async getAllPlayers() {
        return await adminRepository.findAllPlayers();
    }

    async toggleUserStatus(adminId, targetUserId, status) {
        if (adminId === targetUserId) {
            throw new Error('Admins cannot change their own status');
        }

        const user = await adminRepository.findUserById(targetUserId);
        if (!user) throw new Error('User not found');

        return await adminRepository.updateStatus(targetUserId, status);
    }

    async getOnlineGames() {
        return await gameInterface.findAllOnlineGames();
    }

    async searchOnlineGames(query) {
        return await gameInterface.searchOnlineGames(query);
    }

    async closeGameRoom(gameId) {
        return await gameInterface.adminCloseGame(gameId);
    }
}

module.exports = new AdminService();
