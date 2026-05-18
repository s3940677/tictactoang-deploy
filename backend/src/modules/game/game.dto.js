function toAlgebraic(row, col, boardSize) {
    const colChar = String.fromCharCode(97 + col);
    const rowNum = boardSize - row;
    return `${colChar}${rowNum}`;
}

const gameStateDTO = (game) => ({
    id: game._id,
    gameType: game.gameType,
    boardSize: game.boardSize,
    board: game.board,
    player1: {
        username: game.player1.username,
        marker: game.player1.marker,
    },
    player2: {
        username: game.player2.username,
        marker: game.player2.marker,
        isAI: game.player2.isAI,
    },
    aiDifficulty: game.aiDifficulty,
    currentTurn: game.currentTurn,
    status: game.status,
    winner: game.winner,
    winningCells: game.winningCells,
    startTime: game.startTime,
    endTime: game.endTime,
    moves: game.moves,
});

const gameHistoryDTO = (game, userId) => {
    const isPlayer1 = game.player1.userId?.toString() === userId.toString();
    const mySlot = isPlayer1 ? 'player1' : 'player2';

    let result = 'aborted';
    if (game.status === 'FINISHED') {
        if (game.winner === 'draw') result = 'draw';
        else result = game.winner === mySlot ? 'win' : 'lose';
    }

    return {
        id: game._id,
        gameType: game.gameType,
        startTime: game.startTime,
        endTime: game.endTime,
        result,
        status: game.status,
        player1: game.player1.username,
        player2: game.player2.username,
    };
};

const replayDTO = (game) => ({
    id: game._id,
    gameType: game.gameType,
    boardSize: game.boardSize,
    player1: { username: game.player1.username, marker: game.player1.marker },
    player2: { username: game.player2.username, marker: game.player2.marker },
    status: game.status,
    winner: game.winner,
    winningCells: game.winningCells,
    startTime: game.startTime,
    endTime: game.endTime,
    moves: game.moves.map((m) => ({
        player: m.player,
        row: m.row,
        col: m.col,
        notation: toAlgebraic(m.row, m.col, game.boardSize),
        movedAt: m.movedAt,
    })),
});

const adminGameDTO = (game) => ({
    id: game._id,
    gameType: game.gameType,
    player1: game.player1.username,
    player2: game.player2.username,
    status: game.status,
    startTime: game.startTime,
    endTime: game.endTime,
});

module.exports = { gameStateDTO, gameHistoryDTO, replayDTO, adminGameDTO };
