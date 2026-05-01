import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { UserIcon, PlayIcon, ArrowLeftIcon } from '../components/Icons';

export default function LobbyPage() {
  const navigate = useNavigate();
  const { room, isHost, myPlayerId, startGame, kickPlayer, clearSession, toggleHostParticipation } = useGame();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!room || room.phase !== 'lobby') {
    if (room && room.phase !== 'lobby') navigate('/game');
    return null;
  }

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = async () => {
    setLoading(true);
    const res = await startGame();
    setLoading(false);
    if (res.error) return setError(res.error);
    navigate('/game');
  };

  const handleStartForce = async () => {
    setLoading(true);
    const res = await startGame(true);
    setLoading(false);
    if (res.error) return setError(res.error);
    navigate('/game');
  };

  const handleLeave = () => {
    clearSession();
    navigate('/');
    window.location.reload();
  };

  const hostInPlayers = room.players.some((p) => p.isHost);
  const playersCount = room.players.length;
  const needed = room.settings.maxPlayers;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src="/lobby-bg.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="overlay"></div>
      </div>

      <div className="content-layer" style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontSize: '40px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>
                {room.settings.roomName}
              </h1>
              <p style={{ color: '#888', fontSize: '15px' }}>Ожидание игроков...</p>
            </div>
            <button onClick={handleLeave} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
              <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
              Выйти
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            <div className="glass" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ color: '#888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Код комнаты
              </div>
              <div style={{ fontSize: '56px', fontWeight: 900, color: '#d4af37', letterSpacing: '0.15em', marginBottom: '20px' }}>
                {room.code}
              </div>
              <button onClick={copyCode} className="btn btn-primary" style={{ width: '100%' }}>
                {copied ? 'Скопировано!' : 'Копировать код'}
              </button>
              <p style={{ color: '#666', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                Поделитесь кодом с друзьями
              </p>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: '20px' }}>
              <div style={{ color: '#888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                Параметры игры
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Игроков в комнате</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#fff' }}>
                    {playersCount} / {needed}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px' }}>Мест в бункере</div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#d4af37' }}>
                    {room.settings.bunkerCapacity}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '32px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                  {isHost ? 'Управление' : 'Статус'}
                </div>
                {isHost ? (
                  <div style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
                    Игра запускается когда зайдут все игроки: {playersCount}/{needed}
                  </div>
                ) : (
                  <div style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6' }}>
                    Ожидание ведущего...
                  </div>
                )}
              </div>

              {isHost && (
                <div style={{ display: 'grid', gap: 8, width: '100%' }}>
                  <button
                    onClick={() => toggleHostParticipation(!hostInPlayers)}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '14px', padding: '12px' }}
                  >
                    {hostInPlayers ? 'Ведущий: не игрок' : 'Ведущий: участвовать как игрок'}
                  </button>
                  <button
                    onClick={handleStart}
                    disabled={loading || playersCount < needed}
                    className="btn btn-accent"
                    style={{ width: '100%', fontSize: '17px', padding: '16px' }}
                  >
                    <PlayIcon style={{ width: '20px', height: '20px' }} />
                    {loading ? 'Запуск...' : `Начать игру (${playersCount}/${needed})`}
                  </button>
                  <button
                    onClick={handleStartForce}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '13px', padding: '10px' }}
                  >
                    Запуск для проверки (force)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="glass" style={{ padding: '32px', borderRadius: '20px', marginTop: '24px' }}>
            <div style={{ color: '#888', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>
              Игроки ({room.players.length})
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {room.players.map(player => (
                <div 
                  key={player.id} 
                  className="glass-light" 
                  style={{ 
                    padding: '20px', 
                    borderRadius: '14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    border: player.id === myPlayerId ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <UserIcon style={{ width: '36px', height: '36px', color: '#666' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      {player.name}
                      {player.id === myPlayerId && <span style={{ color: '#d4af37', marginLeft: '8px', fontSize: '13px' }}>(Вы)</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: '#888' }}>
                      {player.isHost ? 'Ведущий' : 'Игрок'}
                    </div>
                  </div>
                  {isHost && !player.isHost && (
                    <button 
                      onClick={() => kickPlayer(player.id)} 
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '13px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e74c3c'}
                      onMouseLeave={e => e.currentTarget.style.color = '#888'}
                    >
                      Выгнать
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="glass-light" style={{ marginTop: '24px', padding: '20px', borderRadius: '14px', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
