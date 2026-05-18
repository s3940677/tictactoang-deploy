const gameRepository = require('./game.repository');

const AI_NAMES = { EASY: 'EasyBot', MEDIUM: 'MedBot', HARD: 'HardBot' };

function createBoard(size) {
    return Array.from({ length: size }, () => Array(size).fill(null));
}

function getEmptyCells(board, size) {
    const cells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === null) cells.push([r, c]);
        }
    }
    return cells;
}

function isFull(board, size) {
    return getEmptyCells(board, size).length === 0;
}

const DIRECTIONS = [[0, 1], [1, 0], [1, 1], [1, -1]];

function checkWin(board, row, col, marker, size) {
    for (const [dr, dc] of DIRECTIONS) {
        const cells = [[row, col]];

        for (let step = 1; step < 5; step++) {
            const r = row + dr * step, c = col + dc * step;
            if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== marker) break;
            cells.push([r, c]);
        }
        for (let step = 1; step < 5; step++) {
            const r = row - dr * step, c = col - dc * step;
            if (r < 0 || r >= size || c < 0 || c >= size || board[r][c] !== marker) break;
            cells.push([r, c]);
        }

        if (cells.length >= 5) {
            return {
                won: true,
                winningCells: cells.slice(0, 5).map(([r, c]) => ({ row: r, col: c })),
            };
        }
    }
    return { won: false, winningCells: [] };
}

function getLineInfo(board, row, col, dr, dc, marker, size) {
    let count = 1;
    let openEnds = 0;

    let r = row + dr, c = col + dc;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === marker) {
        count++;
        r += dr;
        c += dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) openEnds++;

    r = row - dr; c = col - dc;
    while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === marker) {
        count++;
        r -= dr;
        c -= dc;
    }
    if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) openEnds++;

    return { count, openEnds };
}

function findThreatCell(board, marker, targetCount, minOpen, size) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== null) continue;
            board[r][c] = marker;
            for (const [dr, dc] of DIRECTIONS) {
                const { count, openEnds } = getLineInfo(board, r, c, dr, dc, marker, size);
                if (count >= targetCount && openEnds >= minOpen) {
                    board[r][c] = null;
                    return [r, c];
                }
            }
            board[r][c] = null;
        }
    }
    return null;
}

function findForkCell(board, marker, size) {
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] !== null) continue;
            board[r][c] = marker;
            let threats = 0;
            for (const [dr, dc] of DIRECTIONS) {
                const { count, openEnds } = getLineInfo(board, r, c, dr, dc, marker, size);
                if (count >= 3 && openEnds >= 2) threats++;
            }
            board[r][c] = null;
            if (threats >= 2) return [r, c];
        }
    }
    return null;
}

function isWinningMove(board, r, c, marker, size) {
    board[r][c] = marker;
    const { won } = checkWin(board, r, c, marker, size);
    board[r][c] = null;
    return won;
}

function getEasyMove(board, lastMove, size) {
    if (lastMove) {
        const { row, col } = lastMove;
        const adjacent = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr, c = col + dc;
                if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === null) {
                    adjacent.push([r, c]);
                }
            }
        }
        if (adjacent.length > 0) {
            return adjacent[Math.floor(Math.random() * adjacent.length)];
        }
    }
    const empty = getEmptyCells(board, size);
    return empty[Math.floor(Math.random() * empty.length)];
}

function getMediumMove(board, aiMarker, playerMarker, size) {
    const empty = getEmptyCells(board, size);

    for (const [r, c] of empty) {
        if (isWinningMove(board, r, c, aiMarker, size)) return [r, c];
    }
    for (const [r, c] of empty) {
        if (isWinningMove(board, r, c, playerMarker, size)) return [r, c];
    }
    const block4 = findThreatCell(board, playerMarker, 4, 1, size);
    if (block4) return block4;
    const blockFork = findForkCell(board, playerMarker, size);
    if (blockFork) return blockFork;
    return empty[Math.floor(Math.random() * empty.length)];
}

function getHardMove(board, aiMarker, playerMarker, size) {
    const empty = getEmptyCells(board, size);

    for (const [r, c] of empty) {
        if (isWinningMove(board, r, c, aiMarker, size)) return [r, c];
    }
    for (const [r, c] of empty) {
        if (isWinningMove(board, r, c, playerMarker, size)) return [r, c];
    }
    const attack4 = findThreatCell(board, aiMarker, 4, 1, size);
    if (attack4) return attack4;
    const block4 = findThreatCell(board, playerMarker, 4, 1, size);
    if (block4) return block4;
    const blockFork = findForkCell(board, playerMarker, size);
    if (blockFork) return blockFork;
    const attack3 = findThreatCell(board, aiMarker, 3, 2, size);
    if (attack3) return attack3;
    return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board, aiMarker, playerMarker, difficulty, lastPlayerMove, size) {
    if (difficulty === 'EASY') return getEasyMove(board, lastPlayerMove, size);
    if (difficulty === 'MEDIUM') return getMediumMove(board, aiMarker, playerMarker, size);
    return getHardMove(board, aiMarker, playerMarker, size);
}

class GameService {
    async createGame(userId, username, {
        gameType,
        boardSize = 10,
        player2Username,
        player1Marker = 'X',
        player2Marker = 'O',
        aiDifficulty = 'EASY',
        firstPlayer = 'player1',
    }) {
        const size = [10, 15].includes(boardSize) ? boardSize : 10;
        const board = createBoard(size);

        let player2;
        let aiDiff = null;

        if (gameType === 'SINGLE_PLAYER') {
            aiDiff = ['EASY', 'MEDIUM', 'HARD'].includes(aiDifficulty) ? aiDifficulty : 'EASY';
            player2 = {
                userId: null,
                username: AI_NAMES[aiDiff],
                marker: player2Marker,
                isAI: true,
            };
        } else {
            player2 = {
                userId: null,
                username: player2Username || 'Player 2',
                marker: player2Marker,
                isAI: false,
            };
        }

        const currentTurn = firstPlayer === 'player2' ? 'player2' : 'player1';

        const gameData = {
            gameType,
            boardSize: size,
            player1: { userId, username, marker: player1Marker },
            player2,
            aiDifficulty: aiDiff,
            board,
            currentTurn,
            startTime: new Date(),
        };

        let firstAiMove = null;
        if (gameType === 'SINGLE_PLAYER' && currentTurn === 'player2') {
            const center = Math.floor(size / 2);
            board[center][center] = player2Marker;
            gameData.moves = [{ player: 'player2', row: center, col: center }];
            gameData.currentTurn = 'player1';
            firstAiMove = { row: center, col: center };
        }

        const game = await gameRepository.createGame(gameData);
        return { game, firstAiMove };
    }

    async getGame(gameId) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Game not found');
        return game;
    }

    async makeMove(gameId, userId, row, col) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Game not found');
        if (game.status !== 'ACTIVE') throw new Error('Game is not active');

        const isPlayer1 = game.player1.userId?.toString() === userId.toString();
        if (!isPlayer1) throw new Error('You are not authorized to make moves in this game');

        if (row < 0 || row >= game.boardSize || col < 0 || col >= game.boardSize) {
            throw new Error('Move is out of bounds');
        }
        if (game.board[row][col] !== null) {
            throw new Error('Cell is already occupied');
        }

        const currentPlayer = game.currentTurn;
        const marker = game[currentPlayer].marker;

        game.board[row][col] = marker;
        game.moves.push({ player: currentPlayer, row, col });
        game.markModified('board');

        const winResult = checkWin(game.board, row, col, marker, game.boardSize);
        if (winResult.won) {
            game.status = 'FINISHED';
            game.winner = currentPlayer;
            game.winningCells = winResult.winningCells;
            game.endTime = new Date();
            await game.save();
            return { game, aiMove: null };
        }

        if (isFull(game.board, game.boardSize)) {
            game.status = 'FINISHED';
            game.winner = 'draw';
            game.endTime = new Date();
            await game.save();
            return { game, aiMove: null };
        }

        game.currentTurn = currentPlayer === 'player1' ? 'player2' : 'player1';

        let aiMove = null;
        if (game.gameType === 'SINGLE_PLAYER' && game.currentTurn === 'player2') {
            const lastPlayerMove = { row, col };
            const [aiRow, aiCol] = getAIMove(
                game.board,
                game.player2.marker,
                game.player1.marker,
                game.aiDifficulty,
                lastPlayerMove,
                game.boardSize
            );

            game.board[aiRow][aiCol] = game.player2.marker;
            game.moves.push({ player: 'player2', row: aiRow, col: aiCol });
            game.markModified('board');
            aiMove = { row: aiRow, col: aiCol };

            const aiWin = checkWin(game.board, aiRow, aiCol, game.player2.marker, game.boardSize);
            if (aiWin.won) {
                game.status = 'FINISHED';
                game.winner = 'player2';
                game.winningCells = aiWin.winningCells;
                game.endTime = new Date();
                await game.save();
                return { game, aiMove };
            }

            if (isFull(game.board, game.boardSize)) {
                game.status = 'FINISHED';
                game.winner = 'draw';
                game.endTime = new Date();
                await game.save();
                return { game, aiMove };
            }

            game.currentTurn = 'player1';
        }

        await game.save();
        return { game, aiMove };
    }

    async abortGame(gameId, userId) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Game not found');
        if (game.status !== 'ACTIVE') throw new Error('Game is not active');

        const isPlayer1 = game.player1.userId?.toString() === userId.toString();
        if (!isPlayer1) throw new Error('You are not authorized to abort this game');

        game.status = 'ABORTED';
        game.endTime = new Date();
        await game.save();
        return game;
    }

    async getGameHistory(userId) {
        return await gameRepository.findUserGames(userId);
    }

    async searchGameHistory(userId, query) {
        return await gameRepository.searchUserGames(userId, query);
    }

    async filterGameHistory(userId, filters) {
        return await gameRepository.filterUserGames(userId, filters);
    }

    async createOnlineRoom(userId, username, { boardSize = 10, player1Marker = 'X' } = {}) {
        const size = [10, 15].includes(boardSize) ? boardSize : 10;
        const board = createBoard(size);
        const game = await gameRepository.createGame({
            gameType: 'ONLINE',
            boardSize: size,
            player1: { userId, username, marker: player1Marker },
            player2: { userId: null, username: 'Waiting...', marker: '', isAI: false },
            board,
            status: 'WAITING',
            startTime: new Date(),
        });
        return game;
    }

    async joinOnlineRoom(gameId, userId, username) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Room not found');
        if (game.status !== 'WAITING') throw new Error('Room is not available');
        if (game.player1.userId?.toString() === userId.toString()) throw new Error('You cannot join your own room');
        if (game.player2.userId) throw new Error('Someone is already joining this room');

        game.player2.userId = userId;
        game.player2.username = username;
        await game.save();
        return game;
    }

    async setPlayer2MarkerAndStart(gameId, userId, marker) {
        const VALID_MARKERS = ['X', 'O', '★', '♦', '♥', '♣'];
        if (!VALID_MARKERS.includes(marker)) throw new Error('Invalid marker');

        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Room not found');
        if (game.status !== 'WAITING') throw new Error('Room is not available');
        if (game.player2.userId?.toString() !== userId.toString()) throw new Error('You are not player 2 in this room');
        if (game.player1.marker === marker) throw new Error('Marker must be different from your opponent\'s marker');

        game.player2.marker = marker;
        game.status = 'ACTIVE';
        game.currentTurn = 'player1';
        game.startTime = new Date();
        await game.save();
        return game;
    }

    async makeOnlineMove(gameId, userId, row, col) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Game not found');
        if (game.status !== 'ACTIVE') throw new Error('Game is not active');
        if (game.gameType !== 'ONLINE') throw new Error('This method is for online games only');

        const isPlayer1 = game.player1.userId?.toString() === userId.toString();
        const isPlayer2 = game.player2.userId?.toString() === userId.toString();
        if (!isPlayer1 && !isPlayer2) throw new Error('You are not a participant in this game');

        const expectedSlot = game.currentTurn;
        const mySlot = isPlayer1 ? 'player1' : 'player2';
        if (mySlot !== expectedSlot) throw new Error('It is not your turn');

        if (row < 0 || row >= game.boardSize || col < 0 || col >= game.boardSize) throw new Error('Move is out of bounds');
        if (game.board[row][col] !== null) throw new Error('Cell is already occupied');

        const marker = game[mySlot].marker;
        game.board[row][col] = marker;
        game.moves.push({ player: mySlot, row, col });
        game.markModified('board');

        const winResult = checkWin(game.board, row, col, marker, game.boardSize);
        if (winResult.won) {
            game.status = 'FINISHED';
            game.winner = mySlot;
            game.winningCells = winResult.winningCells;
            game.endTime = new Date();
            await game.save();
            return game;
        }

        if (isFull(game.board, game.boardSize)) {
            game.status = 'FINISHED';
            game.winner = 'draw';
            game.endTime = new Date();
            await game.save();
            return game;
        }

        game.currentTurn = mySlot === 'player1' ? 'player2' : 'player1';
        await game.save();
        return game;
    }

    async getWaitingOnlineRooms() {
        return await gameRepository.findWaitingOnlineGames();
    }

    async getOnlineGames() {
        return await gameRepository.findOnlineGames();
    }

    async searchOnlineGamesAdmin(query) {
        return await gameRepository.searchOnlineGamesForAdmin(query);
    }

    async adminAbortGame(gameId) {
        const game = await gameRepository.findById(gameId);
        if (!game) throw new Error('Game not found');
        if (game.status !== 'ACTIVE') throw new Error('Game is not active');
        game.status = 'ABORTED';
        game.endTime = new Date();
        await game.save();
        return game;
    }
}

module.exports = new GameService();
