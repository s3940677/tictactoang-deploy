import { useState, useEffect, useRef, useCallback } from 'react';
import { getSocket, onMessage, offMessage, emitMessage } from './ChatBox.service';

export function useChatMessages(gameId) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);

    useEffect(() => {
        const socket = getSocket();
        if (!socket || !gameId) return;

        const handleMessage = (msg) => {
            setMessages(prev => [...prev, msg]);
        };

        onMessage(handleMessage);
        return () => offMessage(handleMessage);
    }, [gameId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(() => {
        if (!input.trim()) return;
        emitMessage(gameId, input.trim());
        setInput('');
    }, [input, gameId]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    return { messages, input, setInput, sendMessage, handleKeyDown, bottomRef };
}
