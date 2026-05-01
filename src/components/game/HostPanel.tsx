import { useState } from 'react';
import { useGame } from '../../GameContext';
import { SettingsIcon, PlayIcon, PauseIcon } from '../Icons';

export default function HostPanel() {
  const { room, startTimer, stopTimer, startVoting, setPhase, nextRound } = useGame();
  const [customTimer, setCustomTimer] = useState(60);

  if (!room) return null;

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: '16px', position: 'sticky', top: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <SettingsIcon style={{ width: '20px', height: '20px', color: '#d4af37' }} />
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Панель ведущего</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="glass-light" style={{ padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
            Текущая фаза
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
            {room.phase === 'catastrophe' ? 'Катастрофа' :
             room.phase === 'game' ? `Раунд ${room.round}` :
             room.phase === 'voting' ? 'Голосование' : 'Итоги'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>Таймер:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
            {[15, 30, 60, 120].map(t => (
              <button
                key={t}
                onClick={() => setCustomTimer(t)}
                className={customTimer === t ? 'card-gold' : 'card'}
                style={{ padding: '10px 0', fontSize: '13px', fontWeight: 600, textAlign: 'center', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {t}с
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button onClick={() => startTimer(customTimer)} className="btn btn-primary" style={{ padding: '10px', fontSize: '13px' }}>
              <PlayIcon style={{ width: '14px', height: '14px' }} /> Старт
            </button>
            <button onClick={stopTimer} className="btn btn-primary" style={{ padding: '10px', fontSize: '13px' }}>
              <PauseIcon style={{ width: '14px', height: '14px' }} /> Стоп
            </button>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setPhase('catastrophe')} className="btn btn-primary" style={{ padding: '12px', fontSize: '14px' }}>
            Катастрофа
          </button>
          <button onClick={() => setPhase('game')} className="btn btn-primary" style={{ padding: '12px', fontSize: '14px' }}>
            Игра
          </button>
          <button onClick={() => nextRound()} className="btn btn-primary" style={{ padding: '12px', fontSize: '14px' }}>
            След. раунд
          </button>
          <button onClick={() => startVoting()} className="btn btn-accent" style={{ padding: '12px', fontSize: '14px' }}>
            Голосование
          </button>
        </div>
      </div>
    </div>
  );
}
