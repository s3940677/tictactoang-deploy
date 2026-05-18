const gameService = require('./game.service');
const profileInterface = require('../profile/profile.interface');
const { gameStateDTO, gameHistoryDTO, replayDTO } = require('./game.dto');

class GameController {
    async createGame(req, res) {
        try {
            const userId = req.user.userId;
            const username = req.user.username;
            const { game, firstAiMove } = await gameService.createGame(userId, username, req.body);
            res.status(201).json({
                message: 'Game created successfully',
                game: gameStateDTO(game),
                firstAiMove,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getGame(req, res) {
        try {
            const game = await gameService.getGame(req.params.id);
            res.status(200).json(gameStateDTO(game));
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async makeMove(req, res) {
        try {
            const { row, col } = req.body;
            if (row === undefined || col === undefined) {
                return res.status(400).json({ message: 'row and col are required' });
            }
            const { game, aiMove } = await gameService.makeMove(
                req.params.id,
                req.user.userId,
                Number(row),
                Number(col)
            );
            res.status(200).json({ game: gameStateDTO(game), aiMove });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async abortGame(req, res) {
        try {
            const game = await gameService.abortGame(req.params.id, req.user.userId);
            res.status(200).json({ message: 'Game aborted', game: gameStateDTO(game) });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getReplay(req, res) {
        try {
            const game = await gameService.getGame(req.params.id);
            const userId = req.user.userId;

            const isParticipant =
                game.player1.userId?.toString() === userId ||
                game.player2.userId?.toString() === userId;
            if (!isParticipant) {
                return res.status(403).json({ message: 'You are not a participant in this game' });
            }

            const isPremium = await profileInterface.isUserPremium(userId);
            if (!isPremium) {
                return res.status(403).json({ message: 'Replay is a Premium feature. Please subscribe to access it.' });
            }

            res.status(200).json(replayDTO(game));
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getGameHistory(req, res) {
        try {
            const { search, startDate, endDate, result, gameType, sort } = req.query;
            const userId = req.user.userId;

            let games;
            if (search) {
                games = await gameService.searchGameHistory(userId, search);
            } else if (startDate || endDate || result || gameType || sort) {
                games = await gameService.filterGameHistory(userId, {
                    startDate, endDate, result, gameType, sortOrder: sort || 'desc',
                });
            } else {
                games = await gameService.getGameHistory(userId);
            }

            res.status(200).json(games.map((g) => gameHistoryDTO(g, userId)));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new GameController();
