const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const authService = require('../../modules/auth/auth.service');
const { registerGameSocket } = require('./game.socket');

let io;

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const blacklisted = await authService.isTokenBlacklisted(token);
            if (blacklisted) return next(new Error('Token has been revoked. Please log in again.'));
            socket.user = decoded;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                next(new Error('Session expired. Please log in again.'));
            } else {
                next(new Error('Invalid token. Please log in again.'));
            }
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] Connected: ${socket.user.username} (${socket.id})`);
        const gameRepository = require('../../modules/game/game.repository');
        gameRepository.deleteUserWaitingRooms(socket.user.userId).catch(err =>
            console.error('[Socket] Stale room cleanup error:', err.message)
        );
        registerGameSocket(io, socket);
        socket.on('disconnect', () => {
            console.log(`[Socket] Disconnected: ${socket.user.username} (${socket.id})`);
        });
    });

    return io;
}

function getIO() {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
}

module.exports = { initSocket, getIO };
