const gameService = require('./game.service');

module.exports = {
    // Used by profile module
    findUserGames: (userId) => gameService.getGameHistory(userId),
    searchUserGames: (userId, query) => gameService.searchGameHistory(userId, query),
    filterUserGames: (userId, filters) => gameService.filterGameHistory(userId, filters),

    // Used by admin module
    findAllOnlineGames: () => gameService.getOnlineGames(),
    searchOnlineGames: (query) => gameService.searchOnlineGamesAdmin(query),
    adminCloseGame: (gameId) => gameService.adminAbortGame(gameId),
};
