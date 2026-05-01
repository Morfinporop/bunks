import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../GameContext';
import { BunkerIcon, PlayIcon, ArrowRightIcon } from '../components/Icons';

export default function HomePage() {
  const navigate = useNavigate();
  const { createRoom, joinRoom, connected } = useGame();
  const [view, setView] = useState<'main' | 'create' | 'join'>('main');
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hostName, setHostName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [mode, setMode] = useState<'classic' | 'adult'>('classic');
  const [joinCode, setJoinCode] = useState('');
  const [joinName, setJoinName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return setError('Нет подключения');
    if (!hostName.trim()) return setError('Введите имя');
    setLoading(true);
    setError('');
    const res = await createRoom(hostName.trim(), { roomName: roomName.trim() || `Комната ${hostName}`, maxPlayers, mode });
    setLoading(false);
    if (res.error) return setError(res.error);
    navigate('/lobby');
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return setError('Нет подключения');
    if (!joinCode.trim()) return setError('Введите код');
    if (!joinName.trim()) return setError('Введите имя');
    setLoading(true);
    setError('');
    const res = await joinRoom(joinCode.trim().toUpperCase(), joinName.trim());
    setLoading(false);
    if (res.error) return setError(res.error);
    navigate('/lobby');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src="/bunker-bg.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="overlay"></div>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }} onClick={() => setShowRules(false)}>
          <div className="glass" style={{ borderRadius: '24px', padding: '60px 50px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h1 style={{ fontSize: '48px', fontWeight: 900, textAlign: 'center', marginBottom: '40px' }}>ПРАВИЛА ИГРЫ</h1>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', color: '#ccc', fontSize: '16px', lineHeight: '1.7' }}>
              <section>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '15px' }}>Сюжет</h2>
                <p>Произошла глобальная катастрофа. Человечество на грани вымирания. Есть бункер, но мест ограничено. Вы должны убедить других, что достойны выжить.</p>
              </section>

              <section>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '15px' }}>Характеристики</h2>
                <p style={{ marginBottom: '15px' }}>Каждый игрок получает 8 случайных характеристик:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '14px' }}>
                  {['Профессия', 'Здоровье', 'Хобби', 'Багаж', 'Фобия', 'Навык', 'Биология', 'Доп. факт'].map((item, i) => (
                    <div key={i} className="glass-light" style={{ padding: '15px', borderRadius: '10px', textAlign: 'center' }}>{item}</div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '15px' }}>Как играть</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[
                    { title: '1. Обсуждение', text: 'Ведущий даёт время. Игроки рассказывают о себе.' },
                    { title: '2. Раскрытие', text: 'Минимум: 1 профессия + 2 характеристики за раунд.' },
                    { title: '3. Аргументация', text: 'Объясните, почему вы ценны для бункера.' },
                    { title: '4. Голосование', text: 'Все голосуют за исключение одного игрока.' }
                  ].map((step, i) => (
                    <div key={i} className="glass-light" style={{ padding: '20px', borderRadius: '12px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{step.title}</h3>
                      <p style={{ fontSize: '14px', color: '#aaa' }}>{step.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '15px' }}>Победа</h2>
                <p>Игра продолжается, пока количество выживших не сравняется с количеством мест в бункере.</p>
              </section>
            </div>

            <button onClick={() => setShowRules(false)} className="btn btn-accent" style={{ width: '100%', marginTop: '40px', fontSize: '18px', padding: '18px 32px' }}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="content-layer fade-in" style={{ width: '100%', maxWidth: '480px' }}>
        {view === 'main' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <BunkerIcon style={{ width: '100px', height: '100px', color: '#d4af37', margin: '0 auto 30px' }} />
              <h1 style={{ fontSize: '72px', fontWeight: 900, marginBottom: '15px', lineHeight: 1 }}>БУНКЕР</h1>
              <p style={{ color: '#888', fontSize: '12px', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Онлайн игра на выживание</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button onClick={() => setView('create')} disabled={!connected} className="btn btn-accent" style={{ width: '100%', fontSize: '18px', padding: '20px 32px' }}>
                <PlayIcon style={{ width: '24px', height: '24px' }} />
                <span>Создать комнату</span>
              </button>
              
              <button onClick={() => setView('join')} disabled={!connected} className="btn btn-primary" style={{ width: '100%', fontSize: '18px', padding: '20px 32px' }}>
                <ArrowRightIcon style={{ width: '24px', height: '24px' }} />
                <span>Войти в комнату</span>
              </button>

              <button onClick={() => setShowRules(true)} style={{ width: '100%', padding: '16px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', letterSpacing: '0.2em', transition: 'color 0.3s' }} onMouseEnter={e => e.currentTarget.style.color = '#d4af37'} onMouseLeave={e => e.currentTarget.style.color = '#666'}>
                ПРАВИЛА ИГРЫ
              </button>

              {!connected && <p style={{ textAlign: 'center', color: '#e74c3c', fontSize: '14px', marginTop: '15px' }}>Подключение к серверу...</p>}
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="glass" style={{ borderRadius: '24px', padding: '35px' }}>
            <button onClick={() => setView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '25px', padding: '5px 0', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
              <ArrowRightIcon style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
              <span>Назад</span>
            </button>

            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '30px' }}>Создать комнату</h2>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Ваше имя</label>
                <input value={hostName} onChange={e => setHostName(e.target.value)} placeholder="Ведущий" className="input" style={{ fontSize: '16px' }} maxLength={30} autoFocus />
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Название комнаты</label>
                <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Моя комната" className="input" maxLength={40} />
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Количество игроков</label>
                <select value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))} className="input" style={{ fontSize: '16px' }}>
                  <option value={4}>4 игрока</option>
                  <option value={5}>5 игроков</option>
                  <option value={6}>6 игроков</option>
                  <option value={8}>8 игроков</option>
                  <option value={10}>10 игроков</option>
                  <option value={12}>12 игроков</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Режим</label>
                <select value={mode} onChange={e => setMode(e.target.value as 'classic' | 'adult')} className="input" style={{ fontSize: '16px' }}>
                  <option value="classic">Классика</option>
                  <option value="adult">18+</option>
                </select>
              </div>

              <div className="glass-light" style={{ padding: '18px', borderRadius: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#aaa' }}>Мест в бункере:</span>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>30-50% (случайно)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#aaa' }}>Катастрофа:</span>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>Случайно</span>
                </div>
              </div>

              {error && <div className="glass-light" style={{ padding: '15px', borderRadius: '10px', color: '#e74c3c', fontSize: '14px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>{error}</div>}

              <button type="submit" disabled={loading || !connected} className="btn btn-accent" style={{ width: '100%', fontSize: '17px', padding: '18px 32px' }}>
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </form>
          </div>
        )}

        {view === 'join' && (
          <div className="glass" style={{ borderRadius: '24px', padding: '35px' }}>
            <button onClick={() => setView('main')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '25px', padding: '5px 0', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
              <ArrowRightIcon style={{ width: '16px', height: '16px', transform: 'rotate(180deg)' }} />
              <span>Назад</span>
            </button>

            <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '30px' }}>Войти в комнату</h2>

            <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Код комнаты</label>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" className="input" style={{ fontSize: '32px', textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700 }} maxLength={6} autoFocus />
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>Ваше имя</label>
                <input value={joinName} onChange={e => setJoinName(e.target.value)} placeholder="Игрок" className="input" style={{ fontSize: '16px' }} maxLength={30} />
              </div>

              {error && <div className="glass-light" style={{ padding: '15px', borderRadius: '10px', color: '#e74c3c', fontSize: '14px', border: '1px solid rgba(231, 76, 60, 0.2)' }}>{error}</div>}

              <button type="submit" disabled={loading || !connected} className="btn btn-accent" style={{ width: '100%', fontSize: '17px', padding: '18px 32px' }}>
                {loading ? 'Вход...' : 'Войти'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
