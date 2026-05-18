import { useState, useEffect, useCallback } from 'react';
import { fetchHistory } from './GameHistoryPage.service';

const DEFAULT_FILTERS = { startDate: '', endDate: '', result: '', gameType: '', sort: 'desc' };

export function useGameHistory() {
    const [games, setGames]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const loadHistory = useCallback(async (params = {}) => {
        setLoading(true);
        const { data, ok } = await fetchHistory(params);
        if (ok) setGames(Array.isArray(data) ? data : []);
        setLoading(false);
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    const handleSearch = () => loadHistory({ search, ...filters });

    const handleReset = () => {
        setSearch('');
        setFilters(DEFAULT_FILTERS);
        loadHistory({});
    };

    const handleFilter = (key, value) => {
        const updated = { ...filters, [key]: value };
        setFilters(updated);
        loadHistory({ search, ...updated });
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';

    const duration = (start, end) => {
        if (!start || !end) return '—';
        const s = Math.floor((new Date(end) - new Date(start)) / 1000);
        if (s < 60) return `${s}s`;
        return `${Math.floor(s / 60)}m ${s % 60}s`;
    };

    return {
        games, loading, search, setSearch, filters,
        handleSearch, handleReset, handleFilter, formatDate, duration,
    };
}
