import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { PageLoader } from '../../components/ui/LoadingSpinner';
import { useReplayPlayback } from './GameReplayPage.hooks';

export default function GameReplayPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    replay, loading, error, step, playing, currentBoard, currentMove,
    isWinCell, notation, goToStep, stepBack, stepForward, resetPlayback, goToEnd, togglePlay,
  } = useReplayPlayback(id, user);

  if (loading) return <PageLoader />;

  if (!user?.isPremium) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="card p-10 text-center max-w-md">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-black text-white mb-2">Premium Feature</h2>
          <p className="text-slate-400 mb-6">Game replay is exclusively available for Premium subscribers.</p>
          <Button onClick={() => navigate('/profile', { state: { tab: 'wallet' } })}>
            Upgrade to Premium
          </Button>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center">
        <Alert type="error" message={error} />
        <Button className="mt-4" onClick={() => navigate('/history')}>Back to History</Button>
      </div>
    </div>
  );

  if (!replay) return null;

  const size = replay.boardSize;

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div>
            <h1 className="section-title mb-0">Game Replay</h1>
            <p className="section-subtitle">{replay.player1.username} vs {replay.player2.username}</p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-5">
          {/* Board */}
          <div className="flex-1 flex flex-col items-center">
            <div className="rounded-xl overflow-auto border-2 border-slate-600 shadow-2xl shadow-slate-900/50">
              <div className="flex bg-slate-800">
                <div className="w-5 flex-shrink-0" />
                {Array.from({ length: size }, (_, c) => (
                  <div key={c} className="text-xs text-slate-500 flex items-center justify-center font-mono"
                    style={{ width: `${Math.max(28, Math.floor(520/size))}px`, height: '18px' }}>
                    {String.fromCharCode(97 + c)}
                  </div>
                ))}
              </div>
              {currentBoard.map((row, r) => (
                <div key={r} className="flex">
                  <div className="w-5 flex-shrink-0 flex items-center justify-center text-xs text-slate-500 font-mono bg-slate-800"
                    style={{ height: `${Math.max(28, Math.floor(520/size))}px` }}>
                    {size - r}
                  </div>
                  {row.map((cell, c) => {
                    const winning = isWinCell(r, c);
                    const isCurrentMove = currentMove && currentMove.row === r && currentMove.col === c;
                    const cellSize = `${Math.max(28, Math.floor(520/size))}px`;
                    return (
                      <div
                        key={c}
                        style={{ width: cellSize, height: cellSize, fontSize: `${Math.max(10, Math.floor(340/size))}px` }}
                        className={`border border-slate-600 flex items-center justify-center font-black transition-all
                          ${winning ? 'bg-amber-400 animate-win-pulse' : isCurrentMove ? 'bg-violet-600/30 ring-2 ring-violet-500' : 'bg-slate-800'}
                          ${cell === replay.player1.marker ? 'text-violet-400' : cell ? 'text-cyan-400' : ''}
                        `}
                      >
                        {cell || ''}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="mt-4 card p-4 w-full max-w-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">
                  Step {step + 1} of {replay.moves.length}
                </span>
                {currentMove && (
                  <span className="text-sm font-mono text-violet-300">
                    {currentMove.player === 'player1' ? replay.player1.username : replay.player2.username}: {notation(currentMove)}
                  </span>
                )}
              </div>
              <input
                type="range"
                min={-1}
                max={replay.moves.length - 1}
                value={step}
                onChange={e => goToStep(e.target.value)}
                className="w-full accent-violet-500 mb-3"
              />
              <div className="flex items-center justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={resetPlayback} title="Reset">⏮</Button>
                <Button variant="secondary" size="sm" onClick={stepBack} title="Back">◀</Button>
                <Button size="sm" onClick={togglePlay}>
                  {playing ? '⏸ Pause' : '▶ Play'}
                </Button>
                <Button variant="secondary" size="sm" onClick={stepForward} title="Forward">▶</Button>
                <Button variant="secondary" size="sm" onClick={goToEnd} title="End">⏭</Button>
              </div>
            </div>
          </div>

          {/* Move list */}
          <div className="xl:w-56">
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Move List</p>
              <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
                {replay.moves.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => goToStep(i)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all ${
                      i === step
                        ? 'bg-violet-600/20 border border-violet-600/30 text-white'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-slate-600 w-6 text-right">{i + 1}.</span>
                    <span className={m.player === 'player1' ? 'text-violet-400' : 'text-cyan-400'}>
                      {m.player === 'player1' ? replay.player1.marker : replay.player2.marker}
                    </span>
                    <span className="font-mono">{notation(m)}</span>
                    <span className="text-slate-600 text-xs ml-auto">
                      {m.player === 'player1' ? replay.player1.username : replay.player2.username}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Result</p>
                <p className="text-sm font-semibold text-white">
                  {replay.winner === 'draw' ? '🤝 Draw' :
                   replay.winner === 'player1' ? `🏆 ${replay.player1.username}` :
                   replay.winner === 'player2' ? `🏆 ${replay.player2.username}` : '🚫 Aborted'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
