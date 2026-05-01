import { useNavigate } from 'react-router-dom';
import { useGame } from '../../GameContext';
import { TrophyIcon } from '../Icons';

export default function ResultsScreen() {
  const navigate = useNavigate();
  const { room, isHost, restartGame, clearSession } = useGame();

  if (!room) return null;

  const survivors = room.players.filter(p => !p.isEliminated);
  const eliminated = room.players.filter(p => p.isEliminated);

  const handleRestart = async () => {
    const res = await restartGame();
    if (!res.error) navigate('/lobby');
  };

  const handleLeave = () => {
    clearSession();
    navigate('/');
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass" style={{ padding: '48px', borderRadius: '20px', textAlign: 'center' }}>
        <TrophyIcon style={{ width: '80px', height: '80px', color: '#d4af37', margin: '0 auto 24px' }} />
        <h1 style={{ fontSize: '48px', fontWeight: 900, marginBottom: '12px' }}>ИГРА ЗАВЕРШЕНА</h1>
        <p style={{ color: '#aaa', fontSize: '18px' }}>
          {survivors.length} {survivors.length === 1 ? 'игрок попал' : 'игроков попали'} в бункер
        </p>
      </div>

      {/* Catastrophe Reminder */}
      <div className="glass" style={{ padding: '24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
          <div style={{ fontSize: '40px' }}>☢️</div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {room.catastrophe.name}
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '12px' }}>
              {room.catastrophe.description}
            </p>
            <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#888' }}>Срок: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{room.catastrophe.duration}</span>
              </div>
              <div>
                <span style={{ color: '#888' }}>Мест было: </span>
                <span style={{ color: '#d4af37', fontWeight: 600 }}>{room.settings.bunkerCapacity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Survivors */}
      {survivors.length > 0 && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#2ecc71' }}>
            ВЫЖИВШИЕ ({survivors.length})
          </h2>
          <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {survivors.map((player, idx) => (
                  <tr key={player.id} style={{ 
                    borderBottom: idx < survivors.length - 1 ? '1px solid rgba(46,204,113,0.1)' : 'none',
                    background: 'rgba(46,204,113,0.05)'
                  }}>
                    <td style={{ padding: '20px', fontSize: '18px', fontWeight: 700, color: '#2ecc71' }}>
                      {idx + 1}.
                    </td>
                    <td style={{ padding: '20px', fontSize: '18px', fontWeight: 600, color: '#fff' }}>
                      {player.name}
                      {player.isHost && <span style={{ fontSize: '14px', color: '#888', marginLeft: '12px' }}>(Ведущий)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#888' }}>
            Исключены ({eliminated.length})
          </h2>
          <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {eliminated.map((player, idx) => (
                  <tr key={player.id} style={{ 
                    borderBottom: idx < eliminated.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    opacity: 0.6
                  }}>
                    <td style={{ padding: '16px', fontSize: '16px', color: '#666' }}>
                      ✗
                    </td>
                    <td style={{ padding: '16px', fontSize: '16px', color: '#888' }}>
                      {player.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {isHost && (
          <button onClick={handleRestart} className="btn btn-accent" style={{ flex: 1, fontSize: '16px', padding: '16px' }}>
            Новая игра
          </button>
        )}
        <button 
          onClick={handleLeave} 
          className="btn btn-primary" 
          style={{ flex: 1, fontSize: '16px', padding: '16px' }}
        >
          На главную
        </button>
      </div>
    </div>
  );
}
