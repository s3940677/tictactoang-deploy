import { useChatMessages } from './ChatBox.hooks';

export default function ChatBox({ gameId, currentUsername }) {
  const { messages, input, setInput, sendMessage, handleKeyDown, bottomRef } = useChatMessages(gameId);

  return (
    <div className="card p-4 flex flex-col h-64">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Chat</p>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-slate-600 text-xs text-center mt-4">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, i) => {
            if (msg.isSystem || msg.username === 'System') {
              return (
                <div key={i} className="flex justify-center my-1">
                  <span className="text-xs italic text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }
            const isMe = msg.username === currentUsername;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-slate-500 mb-0.5">{msg.username}</span>
                <div className={`px-3 py-1.5 rounded-xl text-sm max-w-[85%] break-words ${
                  isMe
                    ? 'bg-violet-600/30 text-violet-100 rounded-tr-sm'
                    : 'bg-slate-700/60 text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center bg-slate-900/60 border border-slate-600 rounded-lg overflow-hidden focus-within:border-violet-500 transition-colors">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="px-3 py-2 text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors border-l border-slate-700 flex-shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  );
}
