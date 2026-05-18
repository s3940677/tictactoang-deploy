import { useState } from 'react';
import { useAdminPlayers } from './AdminPlayersPage.hooks';
import { getAvatarUrl } from '../../config/api.config';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import AdminLayout from '../../components/layout/AdminLayout';
import { PageLoader } from '../../components/ui/LoadingSpinner';

function PlayerRow({ player, onToggle }) {
  const [loading, setLoading] = useState(false);
  const avatarSrc = getAvatarUrl(player.avatar);

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(player.id, player.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE');
    setLoading(false);
  };

  return (
    <tr className="hover:bg-slate-700/30 transition-colors border-b border-slate-700/40 last:border-0">
      <td className="table-cell">
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {player.username[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-white font-medium text-sm">{player.username}</p>
            <p className="text-slate-500 text-xs">{player.country}</p>
          </div>
        </div>
      </td>
      <td className="table-cell text-slate-400 text-xs">{player.email}</td>
      <td className="table-cell">
        {player.isPremium ? (
          <span className="badge-premium">⭐ Premium</span>
        ) : (
          <span className="inline-flex items-center bg-slate-700/50 text-slate-500 text-xs font-medium px-2 py-0.5 rounded-full border border-slate-600">Free</span>
        )}
      </td>
      <td className="table-cell">
        {player.status === 'ACTIVE' ? (
          <span className="badge-active">● Active</span>
        ) : (
          <span className="badge-banned">● Banned</span>
        )}
      </td>
      <td className="table-cell">
        <Button
          variant={player.status === 'ACTIVE' ? 'danger' : 'success'}
          size="sm"
          loading={loading}
          onClick={handleToggle}
        >
          {player.status === 'ACTIVE' ? 'Ban' : 'Unban'}
        </Button>
      </td>
    </tr>
  );
}

export default function AdminPlayersPage() {
  const { players, loading, search, setSearch, alert, filtered, stats, handleToggle } = useAdminPlayers();

  return (
    <AdminLayout>
    <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="section-title">Player Management</h1>
          <p className="section-subtitle">Manage all registered accounts</p>
        </div>

        {alert && <Alert type={alert.type} message={alert.msg} className="mb-4" />}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Players', value: stats.total, color: 'text-violet-400' },
            { label: 'Active', value: stats.active, color: 'text-emerald-400' },
            { label: 'Banned', value: stats.banned, color: 'text-red-400' },
            { label: 'Premium', value: stats.premium, color: 'text-yellow-400' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card p-4 mb-4">
          <input
            className="input-field text-sm"
            placeholder="Search by username or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
                    <th className="table-header">Player</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Subscription</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="table-cell text-center py-10 text-slate-500">
                        {search ? 'No players match your search' : 'No players found'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => (
                      <PlayerRow key={p.id} player={p} onToggle={handleToggle} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
              Showing {filtered.length} of {players.length} players
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
