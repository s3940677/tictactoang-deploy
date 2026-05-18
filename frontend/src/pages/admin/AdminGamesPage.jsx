import { useState } from 'react';
import { useAdminGames } from './AdminGamesPage.hooks';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import AdminLayout from '../../components/layout/AdminLayout';

const STATUS_STYLES = {
  ACTIVE:  'bg-emerald-900/40 text-emerald-400 border-emerald-700/50',
  FINISHED:'bg-slate-700/40 text-slate-400 border-slate-600/50',
  ABORTED: 'bg-red-900/40 text-red-400 border-red-700/50',
};

function CloseRoomModal({ game, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="card p-7 text-center max-w-sm w-full border-red-500/20">
        <div className="text-5xl mb-4">🛑</div>
        <h2 className="text-xl font-black text-white mb-1">Close Game Room?</h2>
        <p className="text-slate-400 text-sm mb-1">
          Room <span className="font-mono text-white font-bold">#{game.id?.slice(-6).toUpperCase()}</span>
        </p>
        <p className="text-slate-500 text-xs mb-6">
          {game.player1} vs {game.player2 || 'Waiting…'} · This will abort the game immediately.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>Close Room</Button>
        </div>
      </div>
    </div>
  );
}

function GameRow({ game, onClose }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onClose(game.id);
    setLoading(false);
    setShowModal(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString() : '—';
  const duration = (start, end) => {
    if (!start || !end) return 'Ongoing';
    const s = Math.floor((new Date(end) - new Date(start)) / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s/60)}m ${s%60}s`;
  };

  return (
    <tr className="hover:bg-slate-700/30 transition-colors border-b border-slate-700/40 last:border-0">
      <td className="table-cell font-mono text-xs text-slate-400">
        #{game.id?.slice(-6).toUpperCase()}
      </td>
      <td className="table-cell">
        <span className="text-white font-medium">{game.player1 || '—'}</span>
      </td>
      <td className="table-cell">
        <span className="text-white font-medium">{game.player2 || 'Waiting…'}</span>
      </td>
      <td className="table-cell text-xs text-slate-400 whitespace-nowrap">{formatDate(game.startTime)}</td>
      <td className="table-cell text-xs text-slate-400">{duration(game.startTime, game.endTime)}</td>
      <td className="table-cell">
        <span className={`inline-flex items-center border text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[game.status] || STATUS_STYLES.FINISHED}`}>
          {game.status}
        </span>
      </td>
      <td className="table-cell">
        {game.status === 'ACTIVE' && (
          <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
            Close Room
          </Button>
        )}
      </td>
      {showModal && (
        <CloseRoomModal
          game={game}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </tr>
  );
}

export default function AdminGamesPage() {
  const {
    games, loading, search, setSearch, alert, searching,
    loadGames, handleSearch, handleClearSearch, handleClose, stats,
  } = useAdminGames();

  return (
    <AdminLayout>
    <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="section-title">Game Rooms</h1>
            <p className="section-subtitle">Monitor and manage all game sessions</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadGames}>↺ Refresh</Button>
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} className="mb-4" />}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Games', value: stats.total, color: 'text-violet-400' },
            { label: 'Active Now', value: stats.active, color: 'text-emerald-400' },
            { label: 'Completed', value: stats.done, color: 'text-slate-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card p-4 mb-4">
          <div className="flex gap-2">
            <input
              className="input-field text-sm flex-1"
              placeholder="Search by player name or room ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button size="sm" loading={searching} onClick={handleSearch}>Search</Button>
            {search && (
              <Button variant="secondary" size="sm" onClick={handleClearSearch}>Clear</Button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12"><PageLoader /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="table-header">Room ID</th>
                    <th className="table-header">Player 1</th>
                    <th className="table-header">Player 2</th>
                    <th className="table-header">Started</th>
                    <th className="table-header">Duration</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {games.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-cell text-center py-10 text-slate-500">
                        No game rooms found
                      </td>
                    </tr>
                  ) : (
                    games.map(g => (
                      <GameRow key={g.id} game={g} onClose={handleClose} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
              {games.length} game{games.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
