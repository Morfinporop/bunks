import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../GameContext';
import { ChatIcon } from '../Icons';

export default function ChatPanel() {
  const { chatMessages, sendChat, myPlayerId } = useGame();
  const [message, setMessage] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendChat(message.trim());
    setMessage('');
  };

  return (
    <div className="card overflow-hidden flex flex-col" style={{ height: '500px' }}>
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-2">
        <ChatIcon className="w-5 h-5 text-gray-500" />
        <span className="text-white font-bold text-sm">Чат</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.map((msg, i) => {
          const isMe = msg.playerId === myPlayerId;
          return (
            <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="text-xs text-gray-600 mb-1">{isMe ? 'Вы' : msg.playerName}</div>
              <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                isMe ? 'bg-yellow-900/30 text-yellow-100' : 'bg-gray-800 text-gray-300'
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-gray-800 p-3 flex gap-2">
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Сообщение..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-white outline-none"
          maxLength={200}
        />
        <button type="submit" className="btn-primary px-4">→</button>
      </form>
    </div>
  );
}
