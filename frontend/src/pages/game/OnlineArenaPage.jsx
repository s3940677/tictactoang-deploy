import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useOnlineArena } from './OnlineArenaPage.hooks';

const MARKER_COLORS = {
  'X': 'text-violet-400', 'O': 'text-cyan-400', '★': 'text-yellow-400',
  '♦': 'text-red-400', '♥': 'text-pink-400', '♣': 'text-emerald-400',
};

function MarkerPicker({ label, value, onChange, disabled = [], markers }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {markers.map(m => (
          <button
            key={m}
            onClick={() => !disabled.includes(m) && onChange(m)}
            disabled={disabled.includes(m)}
            className={`w-9 h-9 rounded-lg text-xl font-bold flex items-center justify-center transition-all border-2 ${
              disabled.includes(m)
                ? 'opacity-20 cursor-not-allowed border-slate-700 bg-slate-800'
                : value === m
                  ? 'border-violet-500 bg-violet-600/20 shadow shadow-violet-500/20'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-400'
            } ${MARKER_COLORS[m] || 'text-white'}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarkerSelectionModal({
  joiningRoom, p2Marker, setP2Marker, availableP2Markers,
  selectingMarker, onConfirm, onCancel, error,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="card p-8 max-w-sm w-full border-cyan-500/30 text-center">
        <div className="text-4xl mb-3">🎯</div>
        <h2 className="text-2xl font-black text-white mb-1">Choose Your Marker</h2>
        <p className="text-slate-400 text-sm mb-4">
          You're joining <span className="text-white font-semibold">{joiningRoom.player1?.username}</span>'s room.
          Pick a marker different from theirs.
        </p>

        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 mb-4 text-left space-y-1.5">
          <p className="text-xs text-slate-500">Board: <span className="text-slate-300 font-medium">{joiningRoom.boardSize}×{joiningRoom.boardSize}</span></p>
          <p className="text-xs text-slate-500">
            Opponent's marker:{' '}
            <span className={`font-bold text-base ${MARKER_COLORS[joiningRoom.player1?.marker] || 'text-white'}`}>
              {joiningRoom.player1?.marker}
            </span>
          </p>
        </div>

        <MarkerPicker
          label="Your marker"
          value={p2Marker}
          onChange={setP2Marker}
          disabled={[joiningRoom.player1?.marker]}
          markers={availableP2Markers}
        />

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <div className="flex gap-3 mt-5">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={selectingMarker}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm} loading={selectingMarker}>
            Join Game
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnlineArenaPage() {
  const {
    rooms, connected, error, showCreateForm, setShowCreateForm,
    boardSize, setBoardSize, player1Marker, setPlayer1Marker,
    creating, handleCreateRoom, handleJoinRoom,
    joiningRoom, p2Marker, setP2Marker, selectingMarker,
    handleConfirmMarker, handleCancelJoin,
    user, MARKERS, availableP2Markers,
  } = useOnlineArena();

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">Online Arena</h1>
            <p className="text-slate-400 mt-1">Play against other players in real time</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              {connected ? 'Live' : 'Connecting...'}
            </span>
            <Button onClick={() => setShowCreateForm(v => !v)}>
              {showCreateForm ? 'Cancel' : '+ Create Room'}
            </Button>
          </div>
        </div>

        <Alert type="error" message={error} className="mb-4" />

        {/* Create Room Form */}
        {showCreateForm && (
          <div className="card p-6 mb-6 animate-fade-in border-violet-500/20">
            <h2 className="text-lg font-bold text-white mb-4">Create a Room</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Board Size</p>
                <div className="flex gap-3">
                  {[10, 15].map(s => (
                    <button
                      key={s}
                      onClick={() => setBoardSize(s)}
                      className={`px-5 py-2 rounded-lg font-bold text-sm border-2 transition-all ${
                        boardSize === s
                          ? 'border-violet-500 bg-violet-600/20 text-white'
                          : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {s}×{s}
                    </button>
                  ))}
                </div>
              </div>
              <MarkerPicker
                label={`Your marker (${user?.username})`}
                value={player1Marker}
                onChange={setPlayer1Marker}
                disabled={[]}
                markers={MARKERS}
              />
              <p className="text-xs text-slate-500">Your opponent will choose their own marker when they join.</p>
              <Button onClick={handleCreateRoom} loading={creating} className="w-full" size="lg">
                Create Room
              </Button>
            </div>
          </div>
        )}

        {/* Room List */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Available Rooms ({rooms.length})
            </h2>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏟️</div>
              <p className="text-slate-400">No rooms available</p>
              <p className="text-slate-600 text-sm mt-1">Create one to start playing!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center justify-between bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xl font-black ${MARKER_COLORS[room.player1?.marker] || 'text-violet-400'}`}>
                      {room.player1?.marker || 'X'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{room.player1?.username || 'Unknown'}'s Room</p>
                      <p className="text-slate-500 text-xs">{room.boardSize}×{room.boardSize} board · Waiting for opponent</p>
                    </div>
                  </div>
                  {room.player1?.username === user?.username ? (
                    <span className="text-xs text-violet-400 font-medium">Your room</span>
                  ) : (
                    <Button size="sm" onClick={() => handleJoinRoom(room.id)}>
                      Join
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Marker selection modal for P2 */}
      {joiningRoom && (
        <MarkerSelectionModal
          joiningRoom={joiningRoom}
          p2Marker={p2Marker}
          setP2Marker={setP2Marker}
          availableP2Markers={availableP2Markers}
          selectingMarker={selectingMarker}
          onConfirm={handleConfirmMarker}
          onCancel={handleCancelJoin}
          error={error}
        />
      )}
    </div>
  );
}
