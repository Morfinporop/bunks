import { useGame } from '../../GameContext';
import { RadioactiveIcon, WarningIcon } from '../Icons';

export default function CatastropheScreen() {
  const { room, isHost, setPhase } = useGame();

  if (!room) return null;

  const handleNext = () => {
    setPhase('game');
  };

  const catImage = room.catastrophe.image || '/bunker-bg.jpg';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Catastrophe Card with Background Image */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', border: '2px solid rgba(212,175,55,0.3)' }}>
        {/* Background Image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <img src={catImage} alt={room.catastrophe.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.85))' }}></div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, padding: '60px 40px', textAlign: 'center' }}>
          <RadioactiveIcon style={{ width: '80px', height: '80px', color: '#d4af37', margin: '0 auto 30px' }} />
          
          <h1 style={{ fontSize: '56px', fontWeight: 900, color: '#fff', marginBottom: '16px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
            {room.catastrophe.name}
          </h1>
          
          <div style={{ width: '100px', height: '3px', background: '#d4af37', margin: '0 auto 30px' }}></div>

          <p style={{ fontSize: '20px', color: '#ddd', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto 40px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {room.catastrophe.description}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Срок изоляции
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                {room.catastrophe.duration}
              </div>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Угроза
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                {room.catastrophe.threat}
              </div>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '2px solid rgba(212,175,55,0.4)' }}>
              <div style={{ fontSize: '13px', color: '#d4af37', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Мест в бункере
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#d4af37' }}>
                {room.settings.bunkerCapacity}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(231,76,60,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <WarningIcon style={{ width: '28px', height: '28px', color: '#e74c3c', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e74c3c', marginBottom: '8px' }}>
              КРИТИЧЕСКАЯ СИТУАЦИЯ
            </div>
            <p style={{ color: '#ccc', lineHeight: '1.6' }}>
              Места в бункере ограничены. Только <strong style={{ color: '#d4af37' }}>{room.settings.bunkerCapacity}</strong> из <strong>{room.players.length}</strong> игроков смогут выжить. 
              Убедите других в своей ценности для восстановления человечества!
            </p>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>
          Участники ({room.players.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {room.players.map((player) => (
            <div key={player.id} className="glass-light" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                {player.name}
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                {player.isHost ? 'Ведущий' : 'Игрок'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      {isHost ? (
        <button onClick={handleNext} className="btn btn-accent" style={{ width: '100%', fontSize: '20px', padding: '20px' }}>
          Начать игру
        </button>
      ) : (
        <div className="glass" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: '16px' }}>Ожидание начала игры...</p>
        </div>
      )}
    </div>
  );
}
