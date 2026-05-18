import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin/players', label: '👥 Players' },
  { to: '/admin/games',   label: '🎮 Game Rooms' },
];

export default function AdminLayout({ children }) {
  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-1 mb-0 bg-slate-800/50 p-1 rounded-xl w-fit">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}
