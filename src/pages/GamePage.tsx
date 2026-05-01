import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import GameScreen from '../components/game/GameScreen';
import ResultsScreen from '../components/game/ResultsScreen';

export default function GamePage() {
  const navigate = useNavigate();
  const { room } = useGame();

  useEffect(() => {
    if (!room) {
      navigate('/');
    } else if (room.phase === 'lobby') {
      navigate('/lobby');
    }
  }, [room, navigate]);

  if (!room || room.phase === 'lobby') return null;

  const renderPhase = () => {
    if (room.phase === 'results') return <ResultsScreen />;
    // Unified flow screen for catastrophe + gameplay + voting
    return <GameScreen />;
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src="/bunker-bg.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="overlay"></div>
      </div>

      <div className="content-layer" style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="glass" style={{ padding: '14px 18px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: '#aaa', fontSize: 13 }}>{room.settings.roomName}</div>
            <div style={{ color: '#aaa', fontSize: 13 }}>
              Выживших: <span style={{ color: '#fff', fontWeight: 700 }}>{room.players.filter(p => !p.isEliminated).length}</span>
              {' / '}Мест: <span style={{ color: '#d4af37', fontWeight: 700 }}>{room.settings.bunkerCapacity}</span>
            </div>
          </div>

          <div>{renderPhase()}</div>
        </div>
      </div>
    </div>
  );
}
