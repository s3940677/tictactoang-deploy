import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGame, sendMove, abortGame } from './GameBoardPage.service';
import { socketService } from '../../services/socket.service';

export function useGameBoard(id, initialGame, user, isOnline) {
    const navigate = useNavigate();
    const [game, setGame] = useState(initialGame || null);
    const [loading, setLoading] = useState(!initialGame);
    const [aiThinking, setAiThinking] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showAbortModal, setShowAbortModal] = useState(false);
    const [moveError, setMoveError] = useState('');
    const aiTimeoutRef = useRef(null);

    useEffect(() => {
        if (!game) {
            fetchGame(id).then(({ data, ok }) => {
                if (ok) setGame(data);
                setLoading(false);
            });
        }
    }, [id]);

    // Apply AI first move if backend returned one
    useEffect(() => {
        if (initialGame?.firstAiMove && game) {
            const move = initialGame.firstAiMove;
            const r = move.row ?? move[0];
            const c = move.col ?? move[1];
            if (r !== undefined && c !== undefined) {
                setGame(prev => {
                    if (!prev) return prev;
                    const board = prev.board.map(row => [...row]);
                    board[r][c] = prev.player2.marker;
                    return { ...prev, board, currentTurn: 'player1' };
                });
            }
        }
    }, []);

    // Only show the winner/abort overlay for terminal states — never for WAITING
    useEffect(() => {
        if (game?.status === 'FINISHED' || game?.status === 'ABORTED') {
            setShowOverlay(true);
        }
    }, [game?.status]);

    const isWinCell = (r, c) => game?.winningCells?.some(wc => wc.row === r && wc.col === c);

    const handleCellClick = useCallback(async (r, c) => {
        if (!game || game.status !== 'ACTIVE') return;
        if (game.board[r][c] !== null && game.board[r][c] !== undefined && game.board[r][c] !== '') return;
        if (aiThinking) return;

        setMoveError('');

        if (isOnline) {
            const socket = socketService.getSocket();
            if (!socket) return;
            const isPlayer1 = game.player1?.username === user?.username;
            const mySlot = isPlayer1 ? 'player1' : 'player2';
            if (mySlot !== game.currentTurn) return;
            socket.emit('makeMove', { gameId: id, row: r, col: c });
            return;
        }

        const isSP = game.gameType === 'SINGLE_PLAYER';
        if (isSP && game.currentTurn !== 'player1') return;

        const { data, ok } = await sendMove(id, r, c);
        if (!ok) { setMoveError(data?.message || 'Invalid move'); return; }
        setGame(data.game);
        if (data.game.status !== 'ACTIVE') { setShowOverlay(true); return; }

        if (isSP && data.aiMove) {
            setAiThinking(true);
            aiTimeoutRef.current = setTimeout(async () => {
                const { row: ar, col: ac } = data.aiMove;
                setGame(prev => {
                    if (!prev) return prev;
                    const board = prev.board.map(row => [...row]);
                    board[ar][ac] = prev.player2.marker;
                    return { ...prev, board, currentTurn: 'player1', moves: [...prev.moves, { player: 'player2', row: ar, col: ac }] };
                });
                const { data: refreshed } = await fetchGame(id);
                if (refreshed) {
                    setGame(refreshed);
                    if (refreshed.status !== 'ACTIVE') setShowOverlay(true);
                }
                setAiThinking(false);
            }, 600);
        }
    }, [game, id, aiThinking, isOnline, user]);

    useEffect(() => () => clearTimeout(aiTimeoutRef.current), []);

    // Opens the styled confirmation modal
    const handleAbort = () => setShowAbortModal(true);

    // Called when user confirms they want to leave/abort
    const handleAbortConfirm = async () => {
        setShowAbortModal(false);
        if (isOnline) {
            socketService.getSocket()?.emit('leaveRoom', { gameId: id });
            navigate('/arena');
            return;
        }
        const { data, ok } = await abortGame(id);
        if (ok) { setGame(data.game); setShowOverlay(true); }
    };

    return {
        game, setGame, loading, aiThinking,
        showOverlay, setShowOverlay,
        showAbortModal, setShowAbortModal,
        moveError, isWinCell, handleCellClick,
        handleAbort, handleAbortConfirm, navigate,
    };
}

export function useOnlineGameSocket(gameId, isOnline, setGame, setShowOverlay) {
    const [adminClosed, setAdminClosed] = useState(false);

    useEffect(() => {
        if (!isOnline) return;
        const token = localStorage.getItem('token');
        const socket = socketService.connect(token);

        const onPlayerJoined = (game) => setGame(game);
        const onGameStarted = (game) => setGame(game);
        const onGameUpdate = (game) => setGame(game);
        const onGameEnd = (game) => { setGame(game); setShowOverlay(true); };
        const onRoomClosed = () => setAdminClosed(true);
        const onError = ({ message }) => console.error('[Socket]', message);

        socket.on('playerJoined', onPlayerJoined);
        socket.on('gameStarted', onGameStarted);
        socket.on('gameUpdate', onGameUpdate);
        socket.on('gameEnd', onGameEnd);
        socket.on('roomClosed', onRoomClosed);
        socket.on('error', onError);

        return () => {
            socket.off('playerJoined', onPlayerJoined);
            socket.off('gameStarted', onGameStarted);
            socket.off('gameUpdate', onGameUpdate);
            socket.off('gameEnd', onGameEnd);
            socket.off('roomClosed', onRoomClosed);
            socket.off('error', onError);
        };
    }, [gameId, isOnline]);

    return { adminClosed };
}
