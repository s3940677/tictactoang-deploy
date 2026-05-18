const mongoose = require('mongoose');

const moveSchema = new mongoose.Schema({
    player: { type: String, enum: ['player1', 'player2'], required: true },
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    movedAt: { type: Date, default: Date.now },
}, { _id: false });

const playerInfoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    username: { type: String, required: true },
    marker: { type: String, default: '' },
    isAI: { type: Boolean, default: false },
}, { _id: false });

const gameSchema = new mongoose.Schema({
    gameType: {
        type: String,
        enum: ['TWO_PLAYER', 'SINGLE_PLAYER', 'ONLINE'],
        required: true,
    },
    boardSize: { type: Number, enum: [10, 15], default: 10 },
    player1: { type: playerInfoSchema, required: true },
    player2: { type: playerInfoSchema, required: true },
    aiDifficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: null },
    board: { type: mongoose.Schema.Types.Mixed, required: true },
    moves: { type: [moveSchema], default: [] },
    currentTurn: { type: String, enum: ['player1', 'player2'], default: 'player1' },
    status: { type: String, enum: ['WAITING', 'ACTIVE', 'FINISHED', 'ABORTED'], default: 'ACTIVE' },
    winner: { type: String, enum: ['player1', 'player2', 'draw', null], default: null },
    winningCells: { type: [{ row: Number, col: Number }], default: [] },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
