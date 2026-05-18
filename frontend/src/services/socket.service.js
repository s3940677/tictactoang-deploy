import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const socketService = {
    connect(token) {
        if (socket?.connected) return socket;
        socket = io(BASE, {
            auth: { token },
            autoConnect: true,
            reconnectionAttempts: 5,
        });
        return socket;
    },

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    getSocket() {
        return socket;
    },

    isConnected() {
        return socket?.connected ?? false;
    },
};
