const gameRepository = require('../../modules/game/game.repository');
const gameService = require('../../modules/game/game.service');
const { gameStateDTO } = require('../../modules/game/game.dto');

const chatRooms = new Map();

async function handleGameLeave(io, gameId, leavingUsername) {
    const game = await gameRepository.findById(gameId);
    if (!game) return;

    if (game.status === 'WAITING') {
        await game.deleteOne();
        broadcastRoomsList(io);
    } else if (game.status === 'ACTIVE') {
        game.status = 'ABORTED';
        game.endTime = new Date();
        await game.save();
        io.to(gameId).emit('gameEnd', gameStateDTO(game));
        chatRooms.delete(gameId);
    }
}

function registerGameSocket(io, socket) {
    const { userId, username } = socket.user;

    socket.on('getRooms', async () => {
        try {
            const rooms = await gameRepository.findWaitingOnlineGames();
            socket.emit('roomsList', rooms.map(gameStateDTO));
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('createRoom', async ({ boardSize = 10, player1Marker = 'X' } = {}) => {
        try {
            const game = await gameService.createOnlineRoom(userId, username, { boardSize, player1Marker });
            socket.join(game._id.toString());
            socket.gameId = game._id.toString();
            socket.emit('roomCreated', gameStateDTO(game));
            broadcastRoomsList(io);
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('joinRoom', async ({ gameId }) => {
        try {
            const game = await gameService.joinOnlineRoom(gameId, userId, username);
            socket.join(gameId);
            socket.gameId = gameId;
            // Notify P1 that an opponent has joined and is choosing their marker
            io.to(gameId).emit('playerJoined', gameStateDTO(game));
            // Send P2 the room info so they can pick a marker
            socket.emit('markerSelection', gameStateDTO(game));
            broadcastRoomsList(io);
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('selectMarker', async ({ gameId, marker }) => {
        try {
            const game = await gameService.setPlayer2MarkerAndStart(gameId, userId, marker);
            chatRooms.set(gameId, []);
            io.to(gameId).emit('gameStarted', gameStateDTO(game));
            broadcastRoomsList(io);
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('makeMove', async ({ gameId, row, col }) => {
        try {
            const game = await gameService.makeOnlineMove(gameId, userId, Number(row), Number(col));
            io.to(gameId).emit('gameUpdate', gameStateDTO(game));
            if (game.status !== 'ACTIVE') {
                io.to(gameId).emit('gameEnd', gameStateDTO(game));
                chatRooms.delete(gameId);
            }
        } catch (err) {
            socket.emit('error', { message: err.message });
        }
    });

    socket.on('sendMessage', ({ gameId, text, isSystem = false }) => {
        if (!text?.trim()) return;
        if (!chatRooms.has(gameId)) chatRooms.set(gameId, []);
        const msg = {
            username: isSystem ? 'System' : username,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            isSystem,
        };
        chatRooms.get(gameId).push(msg);
        io.to(gameId).emit('receiveMessage', msg);
    });

    socket.on('leaveRoom', async ({ gameId }) => {
        try {
            await handleGameLeave(io, gameId, username);
        } catch (err) {
            console.error('[Socket] leaveRoom error:', err.message);
        }
        socket.leave(gameId);
        socket.gameId = null;
    });

    socket.on('disconnect', async () => {
        if (!socket.gameId) return;
        try {
            await handleGameLeave(io, socket.gameId, username);
        } catch (err) {
            console.error('[Socket] Disconnect cleanup error:', err.message);
        }
    });
}

async function broadcastRoomsList(io) {
    try {
        const rooms = await gameRepository.findWaitingOnlineGames();
        io.emit('roomsList', rooms.map(gameStateDTO));
    } catch (err) {
        console.error('[Socket] broadcastRoomsList error:', err.message);
    }
}

module.exports = { registerGameSocket };
