import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getSocket, connectSocket, disconnectSocket,
    emitGetRooms, emitCreateRoom, emitJoinRoom, emitLeaveRoom, emitSelectMarker,
} from './OnlineArenaPage.service';

const MARKERS = ['X', 'O', '★', '♦', '♥', '♣'];

export function useOnlineArena() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [boardSize, setBoardSize] = useState(10);
    const [player1Marker, setPlayer1Marker] = useState('X');
    const [creating, setCreating] = useState(false);

    // State for P2 marker selection after joining a room
    const [joiningRoom, setJoiningRoom] = useState(null); // game object from server
    const [p2Marker, setP2Marker] = useState('O');
    const [selectingMarker, setSelectingMarker] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const existing = getSocket();
        if (existing && !existing.connected) {
            disconnectSocket();
        }

        const socket = connectSocket(token);

        const onConnect = () => {
            setConnected(true);
            setError('');
            emitGetRooms();
        };

        const onConnectError = (err) => {
            setConnected(false);
            setError('Failed to connect: ' + err.message);
        };

        const onRoomsList = (list) => setRooms(list);

        const onRoomCreated = (game) => {
            setCreating(false);
            setShowCreateForm(false);
            navigate(`/game/${game.id}`, { state: { game, online: true, isHost: true } });
        };

        // P2 receives this after joinRoom — show marker picker
        const onMarkerSelection = (game) => {
            setJoiningRoom(game);
            // Pre-select a marker that differs from P1's
            const fallback = MARKERS.find(m => m !== game.player1?.marker) || 'O';
            setP2Marker(fallback);
        };

        // Both players receive this when game starts (after P2 selects marker)
        const onGameStarted = (game) => {
            navigate(`/game/${game.id}`, { state: { game, online: true, isHost: false } });
        };

        const onError = ({ message }) => {
            setError(message);
            setCreating(false);
            setSelectingMarker(false);
        };

        socket.on('connect', onConnect);
        socket.on('connect_error', onConnectError);
        socket.on('roomsList', onRoomsList);
        socket.on('roomCreated', onRoomCreated);
        socket.on('markerSelection', onMarkerSelection);
        socket.on('gameStarted', onGameStarted);
        socket.on('error', onError);

        if (socket.connected) {
            setConnected(true);
            emitGetRooms();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
            socket.off('roomsList', onRoomsList);
            socket.off('roomCreated', onRoomCreated);
            socket.off('markerSelection', onMarkerSelection);
            socket.off('gameStarted', onGameStarted);
            socket.off('error', onError);
        };
    }, [navigate]);

    const handleCreateRoom = useCallback(() => {
        setError('');
        setCreating(true);
        emitCreateRoom({ boardSize, player1Marker });
    }, [boardSize, player1Marker]);

    const handleJoinRoom = useCallback((gameId) => {
        const socket = getSocket();
        if (!socket) return;
        setError('');
        emitJoinRoom(gameId);
    }, []);

    const handleConfirmMarker = useCallback(() => {
        if (!joiningRoom) return;
        if (p2Marker === joiningRoom.player1?.marker) {
            setError('Marker must be different from your opponent\'s');
            return;
        }
        setError('');
        setSelectingMarker(true);
        emitSelectMarker(joiningRoom.id, p2Marker);
    }, [joiningRoom, p2Marker]);

    const handleCancelJoin = useCallback(() => {
        if (joiningRoom) emitLeaveRoom(joiningRoom.id);
        setJoiningRoom(null);
        setSelectingMarker(false);
    }, [joiningRoom]);

    const availableP2Markers = joiningRoom
        ? MARKERS.filter(m => m !== joiningRoom.player1?.marker)
        : MARKERS;

    return {
        rooms, connected, error,
        showCreateForm, setShowCreateForm,
        boardSize, setBoardSize,
        player1Marker, setPlayer1Marker,
        creating, handleCreateRoom,
        handleJoinRoom,
        joiningRoom, p2Marker, setP2Marker, selectingMarker,
        handleConfirmMarker, handleCancelJoin,
        user, MARKERS, availableP2Markers,
    };
}
