import { useState, useEffect, useCallback } from 'react';
import { fetchGames, searchGames, closeGame } from './AdminGamesPage.service';

export function useAdminGames() {
    const [games, setGames]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [search, setSearch]       = useState('');
    const [alert, setAlert]         = useState(null);
    const [searching, setSearching] = useState(false);

    const loadGames = useCallback(async () => {
        const { data, ok } = await fetchGames();
        if (ok) setGames(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { loadGames(); }, [loadGames]);

    const handleSearch = async () => {
        if (!search.trim()) { loadGames(); return; }
        setSearching(true);
        const { data, ok } = await searchGames(search);
        if (ok) setGames(Array.isArray(data) ? data : []);
        setSearching(false);
    };

    const handleClearSearch = () => { setSearch(''); loadGames(); };

    const handleClose = async (id) => {
        const { data, ok } = await closeGame(id);
        if (ok) {
            setGames(gs => gs.map(g => g.id === id ? { ...g, status: 'ABORTED' } : g));
            setAlert({ type: 'success', msg: 'Game room closed successfully' });
            setTimeout(() => setAlert(null), 3000);
        } else {
            setAlert({ type: 'error', msg: data?.message || 'Failed to close game' });
        }
    };

    const stats = {
        total:  games.length,
        active: games.filter(g => g.status === 'ACTIVE').length,
        done:   games.filter(g => g.status === 'FINISHED').length,
    };

    return {
        games, loading, search, setSearch, alert, searching,
        loadGames, handleSearch, handleClearSearch, handleClose, stats,
    };
}
