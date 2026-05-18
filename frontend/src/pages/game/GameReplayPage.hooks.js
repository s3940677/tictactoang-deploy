import { useState, useEffect, useRef } from 'react';
import { fetchReplay } from './GameReplayPage.service';

function buildBoardAtStep(size, player1, player2, moves, stepIndex) {
    const board = Array.from({ length: size }, () => Array(size).fill(null));
    for (let i = 0; i <= stepIndex && i < moves.length; i++) {
        const m = moves[i];
        board[m.row][m.col] = m.player === 'player1' ? player1.marker : player2.marker;
    }
    return board;
}

export function useReplayPlayback(id, user) {
    const [replay, setReplay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState(-1);
    const [playing, setPlaying] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!user?.isPremium) { setLoading(false); return; }
        fetchReplay(id).then(({ data, ok }) => {
            if (ok) { setReplay(data); setStep(-1); }
            else setError(data?.message || 'Failed to load replay');
            setLoading(false);
        });
    }, [id, user]);

    useEffect(() => {
        if (playing && replay) {
            intervalRef.current = setInterval(() => {
                setStep(s => {
                    if (s >= replay.moves.length - 1) { setPlaying(false); return s; }
                    return s + 1;
                });
            }, 600);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [playing, replay]);

    const currentBoard = replay ? buildBoardAtStep(replay.boardSize, replay.player1, replay.player2, replay.moves, step) : null;
    const currentMove = replay && step >= 0 && step < replay.moves.length ? replay.moves[step] : null;
    const isWinStep = replay && step === replay.moves.length - 1 && replay.winningCells?.length > 0;

    const isWinCell = (r, c) => isWinStep && replay?.winningCells?.some(wc => wc.row === r && wc.col === c);
    const notation = (m) => m ? `${String.fromCharCode(97 + m.col)}${replay.boardSize - m.row}` : '';

    const goToStep = (s) => { setPlaying(false); setStep(Number(s)); };
    const stepBack = () => { setPlaying(false); setStep(s => Math.max(-1, s - 1)); };
    const stepForward = () => { setPlaying(false); setStep(s => replay ? Math.min(replay.moves.length - 1, s + 1) : s); };
    const resetPlayback = () => { setPlaying(false); setStep(-1); };
    const goToEnd = () => { setPlaying(false); setStep(replay ? replay.moves.length - 1 : -1); };
    const togglePlay = () => setPlaying(p => !p);

    return {
        replay, loading, error, step, playing, currentBoard, currentMove,
        isWinCell, notation, goToStep, stepBack, stepForward, resetPlayback, goToEnd, togglePlay,
    };
}
