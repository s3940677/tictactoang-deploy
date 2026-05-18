import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card p-5 hover:border-violet-600/40 hover:bg-slate-700/50 transition-all duration-200">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-cyan-900/20 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center relative animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-violet-300 text-sm font-medium">Online TicTacToe Platform</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            <span className="text-violet-400">Tic</span>
            <span className="text-cyan-400">Tac</span>
            <span className="text-white">Toang</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            The modern online TicTacToe arena. Challenge AI, battle friends on the same screen, and climb the leaderboard.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <>
                <Link to="/game/setup" className="btn-primary text-base py-3 px-8 rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                  🎮 Play Now
                </Link>
                <Link to="/history" className="btn-secondary text-base py-3 px-8 rounded-xl">
                  📋 View History
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base py-3 px-8 rounded-xl shadow-lg shadow-violet-500/25">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-base py-3 px-8 rounded-xl">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Board preview */}
      <div className="flex justify-center py-8 px-4">
        <div className="grid gap-1 bg-slate-800 p-3 rounded-2xl border border-slate-700 shadow-2xl shadow-slate-900/50 opacity-60"
          style={{ gridTemplateColumns: 'repeat(5, 44px)' }}>
          {['X','','O','','X','','X','','O','','O','','X','','O','','O','X','','','X','','','O',''].map((c, i) => (
            <div key={i} className="w-11 h-11 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center text-lg font-black">
              <span className={c === 'X' ? 'text-violet-400' : c === 'O' ? 'text-cyan-400' : ''}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-black text-white text-center mb-8">Everything you need</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard icon="🤖" title="AI Opponents" desc="Three difficulty levels: Easy, Medium, and Hard AI with strategic blocking." />
          <FeatureCard icon="👥" title="Local Multiplayer" desc="Play with a friend on the same device. Choose your markers and go first." />
          <FeatureCard icon="🎨" title="Customization" desc="Pick from 3 board styles, 6 unique markers, and 10×10 or 15×15 boards." />
          <FeatureCard icon="📊" title="Game History" desc="Review all past matches with search, filters, and date range queries." />
          <FeatureCard icon="▶️" title="Replay System" desc="Premium users can replay any match step-by-step with full controls." />
          <FeatureCard icon="⭐" title="Premium" desc="Unlock replays and exclusive features for just $10/month via wallet." />
        </div>
      </div>

      {/* CTA */}
      {!user && (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="card p-10 text-center bg-gradient-to-br from-violet-900/20 to-cyan-900/20 border-violet-700/30">
            <h2 className="text-3xl font-black text-white mb-3">Ready to play?</h2>
            <p className="text-slate-400 mb-6">Join thousands of players. Create your free account now.</p>
            <Link to="/register" className="btn-primary text-base py-3 px-10 rounded-xl shadow-lg shadow-violet-500/25">
              Create Free Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
