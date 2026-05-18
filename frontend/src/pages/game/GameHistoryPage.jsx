import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGameHistory } from './GameHistoryPage.hooks';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/LoadingSpinner';

const RESULT_STYLES = {
  win:     'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
  lose:    'bg-red-900/40 text-red-400 border-red-700/50',
  draw:    'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
  aborted: 'bg-slate-700/40 text-slate-400 border-slate-600/50',
};

const RESULT_EMOJI = { win: '🏆', lose: '💀', draw: '🤝', aborted: '🚫' };

export default function GameHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    games, loading, search, setSearch, filters,
    handleSearch, handleReset, handleFilter, formatDate, duration,
  } = useGameHistory();

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Game History</h1>
            <p className="section-subtitle">Your past matches</p>
          </div>
          <Button onClick={() => navigate('/game/setup')} size="sm">+ New Game</Button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-5">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-48">
              <input
                className="input-field text-sm"
                placeholder="Search opponent name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            {/* Result filter */}
            <select className="input-field text-sm w-auto" value={filters.result} onChange={e => handleFilter('result', e.target.value)}>
              <option value="">All Results</option>
              <option value="win">Win 🏆</option>
              <option value="lose">Lose 💀</option>
              <option value="draw">Draw 🤝</option>
              <option value="aborted">Aborted 🚫</option>
            </select>
            {/* Game type */}
            <select className="input-field text-sm w-auto" value={filters.gameType} onChange={e => handleFilter('gameType', e.target.value)}>
              <option value="">All Types</option>
              <option value="SINGLE_PLAYER">vs AI</option>
              <option value="TWO_PLAYER">Local 2P</option>
              <option value="ONLINE">Online</option>
            </select>
            {/* Sort */}
            <select className="input-field text-sm w-auto" value={filters.sort} onChange={e => handleFilter('sort', e.target.value)}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            <Button size="sm" onClick={handleSearch}>Search</Button>
            <Button size="sm" variant="secondary" onClick={handleReset}>Reset</Button>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex items-center gap-2 flex-1 min-w-48">
              <label className="text-xs text-slate-500 whitespace-nowrap">From:</label>
              <input type="date" className="input-field text-sm" value={filters.startDate} onChange={e => handleFilter('startDate', e.target.value)} />
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-48">
              <label className="text-xs text-slate-500 whitespace-nowrap">To:</label>
              <input type="date" className="input-field text-sm" value={filters.endDate} onChange={e => handleFilter('endDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12"><PageLoader /></div>
        ) : games.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-slate-400 text-lg font-semibold">No games found</p>
            <p className="text-slate-500 text-sm mt-1">Play your first game to see history here</p>
            <Button className="mt-5" onClick={() => navigate('/game/setup')}>Play Now</Button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="table-header">Result</th>
                    <th className="table-header">Opponent</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Started</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {games.map(g => {
                    const opponent = g.player1 === user?.username ? g.player2 : g.player1;
                    const r = g.result || 'aborted';
                    return (
                      <tr key={g.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="table-cell">
                          <span className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-2.5 py-0.5 rounded-full ${RESULT_STYLES[r] || RESULT_STYLES.aborted}`}>
                            {RESULT_EMOJI[r]} {r?.charAt(0).toUpperCase() + r?.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell font-medium text-white">{opponent || '—'}</td>
                        <td className="table-cell">
                          <span className="text-xs text-slate-400">
                            {g.gameType === 'SINGLE_PLAYER' ? '🤖 vs AI' : g.gameType === 'TWO_PLAYER' ? '👥 Local' : '🌐 Online'}
                          </span>
                        </td>
                        <td className="table-cell text-slate-400 text-xs whitespace-nowrap">{formatDate(g.startTime)}</td>
                        <td className="table-cell text-slate-400 text-xs">{duration(g.startTime, g.endTime)}</td>
                        <td className="table-cell">
                          {user?.isPremium ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/game/${g.id}/replay`)}
                            >
                              ▶ Replay
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-600 flex items-center gap-1">⭐ Premium</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
              {games.length} game{games.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
