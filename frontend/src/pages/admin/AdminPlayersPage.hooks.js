import { useState, useEffect } from 'react';
import { fetchPlayers, setPlayerStatus } from './AdminPlayersPage.service';

export function useAdminPlayers() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [alert, setAlert]     = useState(null);

    useEffect(() => {
        fetchPlayers().then(({ data, ok }) => {
            if (ok) setPlayers(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, []);

    const handleToggle = async (id, status) => {
        const { data, ok } = await setPlayerStatus(id, status);
        if (ok) {
            setPlayers(ps => ps.map(p => p.id === id ? data.user : p));
            setAlert({ type: 'success', msg: `Account ${status === 'ACTIVE' ? 'reactivated' : 'banned'} successfully` });
            setTimeout(() => setAlert(null), 3000);
        } else {
            setAlert({ type: 'error', msg: data?.message || 'Failed to update status' });
        }
    };

    const filtered = players.filter(p =>
        p.username.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total:   players.length,
        active:  players.filter(p => p.status === 'ACTIVE').length,
        banned:  players.filter(p => p.status === 'BANNED').length,
        premium: players.filter(p => p.isPremium).length,
    };

    return { players, loading, search, setSearch, alert, filtered, stats, handleToggle };
}
