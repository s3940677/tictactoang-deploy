import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { gameService } from '../../services/game.service';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const MARKERS = [
  { symbol: 'X', label: 'X', color: 'text-violet-400' },
  { symbol: 'O', label: 'O', color: 'text-cyan-400' },
  { symbol: '★', label: 'Star', color: 'text-yellow-400' },
  { symbol: '♦', label: 'Diamond', color: 'text-red-400' },
  { symbol: '♥', label: 'Heart', color: 'text-pink-400' },
  { symbol: '♣', label: 'Club', color: 'text-emerald-400' },
];

const AI_NAMES = { EASY: 'Jeremy (Easy)', MEDIUM: 'Nexus (Medium)', HARD: 'Titan (Hard)' };
const AI_DESC  = {
  EASY:   'Plays randomly near your last move. Great for beginners.',
  MEDIUM: 'Blocks your patterns and open 4-in-a-rows. A real challenge.',
  HARD:   'Defends and attacks aggressively. Only for veterans.',
};

function OptionCard({ selected, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`border-2 rounded-xl p-4 text-center transition-all duration-150 w-full ${
        selected
          ? 'border-violet-500 bg-violet-600/15 text-white shadow-lg shadow-violet-500/20'
          : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function GameSetupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameType, setGameType]       = useState('SINGLE_PLAYER');
  const [boardSize, setBoardSize]     = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState('EASY');
  const [p1Marker, setP1Marker]       = useState('X');
  const [p2Marker, setP2Marker]       = useState('O');
  const [goFirst, setGoFirst]         = useState('player1');
  const [player2Name, setPlayer2Name] = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const handleStart = async () => {
    if (p1Marker === p2Marker) { setError('Players must have different markers'); return; }
    if (gameType === 'TWO_PLAYER' && !player2Name.trim()) { setError('Please enter Player 2 name'); return; }
    setError('');
    setLoading(true);
    try {
      const payload = {
        gameType,
        boardSize,
        player1Marker: p1Marker,
        player2Marker: p2Marker,
        ...(gameType === 'SINGLE_PLAYER' && { aiDifficulty }),
        ...(gameType === 'TWO_PLAYER' && { player2Username: player2Name.trim() }),
        firstPlayer: goFirst,
      };
      const { data, ok } = await gameService.create(payload);
      if (!ok) { setError(data?.message || 'Failed to create game'); return; }
      navigate(`/game/${data.game.id}`, { state: { game: data.game, firstAiMove: data.firstAiMove } });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableP2Markers = MARKERS.filter(m => m.symbol !== p1Marker);
  const selectedP2 = availableP2Markers.find(m => m.symbol === p2Marker) || availableP2Markers[0];
  if (selectedP2 && p2Marker === p1Marker) setP2Marker(selectedP2.symbol);

  return (
    <div className="page-container">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-black text-white">New Game</h1>
          <p className="text-slate-400 mt-1">Configure your match settings</p>
        </div>

        <Alert type="error" message={error} className="mb-5" />

        <div className="space-y-6">
          {/* Game Mode */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Game Mode</h3>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard selected={gameType === 'SINGLE_PLAYER'} onClick={() => setGameType('SINGLE_PLAYER')}>
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-semibold text-sm">vs AI</div>
                <div className="text-xs text-slate-500 mt-0.5">Single Player</div>
              </OptionCard>
              <OptionCard selected={gameType === 'TWO_PLAYER'} onClick={() => setGameType('TWO_PLAYER')}>
                <div className="text-3xl mb-2">👥</div>
                <div className="font-semibold text-sm">Local 2P</div>
                <div className="text-xs text-slate-500 mt-0.5">Same Device</div>
              </OptionCard>
            </div>
          </div>

          {/* AI Difficulty */}
          {gameType === 'SINGLE_PLAYER' && (
            <div className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Difficulty</h3>
              <div className="grid grid-cols-3 gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map(level => (
                  <OptionCard key={level} selected={aiDifficulty === level} onClick={() => setAiDifficulty(level)}>
                    <div className="text-2xl mb-1.5">
                      {level === 'EASY' ? '😊' : level === 'MEDIUM' ? '😤' : '💀'}
                    </div>
                    <div className="font-semibold text-xs">{level}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{AI_NAMES[level].split(' ')[0]}</div>
                  </OptionCard>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3 text-center">{AI_DESC[aiDifficulty]}</p>
            </div>
          )}

          {/* Player 2 name for TWO_PLAYER */}
          {gameType === 'TWO_PLAYER' && (
            <div className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Player 2</h3>
              <input
                className="input-field"
                placeholder="Enter Player 2 name"
                value={player2Name}
                onChange={e => setPlayer2Name(e.target.value)}
              />
            </div>
          )}

          {/* Board Size */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Board Size</h3>
            <div className="grid grid-cols-2 gap-3">
              {[10, 15].map(s => (
                <OptionCard key={s} selected={boardSize === s} onClick={() => setBoardSize(s)}>
                  <div className="font-black text-xl mb-1">{s}×{s}</div>
                  <div className="text-xs text-slate-500">{s === 10 ? 'Standard' : 'Large'}</div>
                </OptionCard>
              ))}
            </div>
          </div>

          {/* Markers */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Markers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-2">You ({user?.username})</p>
                <div className="grid grid-cols-3 gap-2">
                  {MARKERS.map(m => (
                    <button
                      key={m.symbol}
                      onClick={() => setP1Marker(m.symbol)}
                      className={`aspect-square rounded-lg text-2xl font-bold flex items-center justify-center transition-all ${
                        p1Marker === m.symbol
                          ? 'bg-violet-600/30 border-2 border-violet-500 shadow-md shadow-violet-500/20'
                          : 'bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500'
                      } ${m.color}`}
                    >
                      {m.symbol}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  {gameType === 'SINGLE_PLAYER' ? 'AI' : 'Player 2'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {MARKERS.map(m => (
                    <button
                      key={m.symbol}
                      onClick={() => m.symbol !== p1Marker && setP2Marker(m.symbol)}
                      disabled={m.symbol === p1Marker}
                      className={`aspect-square rounded-lg text-2xl font-bold flex items-center justify-center transition-all ${
                        m.symbol === p1Marker
                          ? 'opacity-20 cursor-not-allowed bg-slate-800 border-2 border-slate-700'
                          : p2Marker === m.symbol
                            ? 'bg-cyan-600/30 border-2 border-cyan-500 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-700/50 border-2 border-slate-600 hover:border-slate-500'
                      } ${m.symbol !== p1Marker ? m.color : 'text-slate-600'}`}
                    >
                      {m.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* First Turn */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Who Goes First?</h3>
            <div className="grid grid-cols-2 gap-3">
              <OptionCard selected={goFirst === 'player1'} onClick={() => setGoFirst('player1')}>
                <span className="text-2xl">{p1Marker}</span>
                <div className="font-semibold text-sm mt-1.5">{user?.username}</div>
                <div className="text-xs text-slate-500">You</div>
              </OptionCard>
              <OptionCard selected={goFirst === 'player2'} onClick={() => setGoFirst('player2')}>
                <span className="text-2xl">{p2Marker}</span>
                <div className="font-semibold text-sm mt-1.5">
                  {gameType === 'SINGLE_PLAYER' ? AI_NAMES[aiDifficulty].split(' ')[0] : (player2Name || 'Player 2')}
                </div>
                <div className="text-xs text-slate-500">
                  {gameType === 'SINGLE_PLAYER' ? 'AI' : 'Opponent'}
                </div>
              </OptionCard>
            </div>
          </div>

          {/* Start */}
          <Button onClick={handleStart} loading={loading} size="xl" className="w-full mt-2">
            🎮 Start Game
          </Button>
        </div>
      </div>
    </div>
  );
}
