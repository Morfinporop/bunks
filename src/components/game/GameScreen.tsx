import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../GameContext';
import { PlayerCards } from '../../types';
import { TimerIcon } from '../Icons';

const CARD_ORDER = ['profession', 'health', 'hobby', 'luggage', 'phobia', 'skill', 'biology', 'extra'] as const;
const CARD_LABELS: Record<string, string> = {
  profession: 'Профессия',
  health: 'Здоровье',
  hobby: 'Хобби / Увлечение',
  luggage: 'Крупный инвентарь',
  phobia: 'Фобия / Страх',
  skill: 'Навык',
  biology: 'Пол / Возраст',
  extra: 'Дополнительное сведение',
};

function useSeeded(code: string) {
  const seed = useMemo(() => code.split('').reduce((a, c) => a + c.charCodeAt(0), 0), [code]);
  const pick = <T,>(arr: T[], shift = 0) => arr[(seed + shift) % arr.length];
  return { seed, pick };
}

function TimerChip({ timerEndAt }: { timerEndAt: number | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);
  if (!timerEndAt) return null;
  const left = Math.max(0, Math.ceil((timerEndAt - Date.now()) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  return (
    <div className="glass" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 90, borderRadius: 12, border: '1px solid rgba(212,175,55,0.4)' }}>
      <div style={{ padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <TimerIcon style={{ width: 16, height: 16, color: left === 0 ? '#888' : '#d4af37' }} />
        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: left === 0 ? '#888' : '#d4af37' }}>{mm}:{ss}</span>
      </div>
    </div>
  );
}

function HostPanelLeft() {
  const {
    room,
    startTimer,
    stopTimer,
    startVoting,
    endVoting,
    restartGame,
    setPhase,
    reassignCards,
    revealCard,
    changeCatastrophe,
    changeCardValue,
    undoLastAction,
  } = useGame();

  const [timer, setTimer] = useState(60);
  const [diceResult, setDiceResult] = useState<string>('');
  const [targetPlayer, setTargetPlayer] = useState('all');
  const [targetCard, setTargetCard] = useState('profession');
  const [newText, setNewText] = useState('');

  if (!room) return null;

  const roll = (sides: number) => {
    const value = Math.floor(Math.random() * sides) + 1;
    setDiceResult(`d${sides}: ${value}`);
  };

  const undo = async () => {
    const res = await undoLastAction();
    if (res?.error) alert(res.error);
  };

  const applyCardChange = async () => {
    const ids = targetPlayer === 'all' ? room.players.map((p) => p.id) : [targetPlayer];
    for (const id of ids) {
      await changeCardValue(id, targetCard, newText);
    }
    setNewText('');
  };

  const randomCatastrophe = () => {
    const list = ['nuclear', 'pandemic', 'asteroid', 'ai_revolt', 'climate', 'zombie'];
    const id = list[Math.floor(Math.random() * list.length)];
    changeCatastrophe(id);
  };

  const revealProfessionsAll = async () => {
    for (const p of room.players) {
      await revealCard(p.id, 'profession');
    }
  };

  const shuffleAllCards = async () => {
    for (const p of room.players) {
      await reassignCards(p.id);
    }
  };

  return (
    <div className="glass" style={{ borderRadius: 12, padding: 12, position: 'sticky', top: 12 }}>
      <div style={{ fontSize: 12, color: '#d4af37', marginBottom: 10 }}>Панель ведущего</div>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {[15, 30, 60, 120].map((t) => (
            <button key={t} className={timer === t ? 'card-gold' : 'card'} style={{ padding: 8, fontSize: 12 }} onClick={() => setTimer(t)}>{t}с</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button className="btn btn-accent" style={{ padding: '8px 10px', fontSize: 12 }} onClick={() => startTimer(timer)}>Запустить таймер</button>
          <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={stopTimer}>Остановить таймер</button>
        </div>

        <button className="btn btn-accent" style={{ padding: '8px 10px', fontSize: 12 }} onClick={startVoting}>Открыть голосование</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={endVoting}>Закрыть голосование</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={undo}>Отменить пред. действие</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={() => setPhase('results')}>Завершить игру</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={restartGame}>Перезапустить</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={() => roll(6)}>Бросить d6</button>
          <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={() => roll(20)}>Бросить d20</button>
        </div>
        {diceResult && <div style={{ fontSize: 12, color: '#d4af37' }}>Результат: {diceResult}</div>}

        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={randomCatastrophe}>Случайный катаклизм</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={revealProfessionsAll}>Раскрыть профессии всем</button>
        <button className="btn btn-primary" style={{ padding: '8px 10px', fontSize: 12 }} onClick={shuffleAllCards}>Перемешать карты всем</button>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 8 }}>
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>Сменить характеристику</div>
          <select className="input" style={{ padding: 8, fontSize: 12, marginBottom: 6 }} value={targetPlayer} onChange={(e) => setTargetPlayer(e.target.value)}>
            <option value="all">Все игроки</option>
            {room.players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="input" style={{ padding: 8, fontSize: 12, marginBottom: 6 }} value={targetCard} onChange={(e) => setTargetCard(e.target.value)}>
            {CARD_ORDER.map((k) => <option key={k} value={k}>{CARD_LABELS[k]}</option>)}
          </select>
          <input className="input" style={{ padding: 8, fontSize: 12, marginBottom: 6 }} value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Новый текст (пусто = рандом)" />
          <button className="btn btn-accent" style={{ padding: '8px 10px', fontSize: 12, width: '100%' }} onClick={applyCardChange}>Сменить</button>
        </div>
      </div>
    </div>
  );
}

function VotingBlock() {
  const { room, myPlayerId, vote } = useGame();
  if (!room) return null;
  const votingOpen = room.votingActive || room.phase === 'voting';
  if (!votingOpen) return null;
  const active = room.players.filter((p) => !p.isEliminated);
  const voted = Object.keys(room.votes).length;
  const notVoted = active.length - voted;
  const votesByTarget: Record<string, string[]> = {};
  Object.entries(room.votes).forEach(([voterId, targetId]) => {
    const voter = room.players.find((p) => p.id === voterId);
    if (!votesByTarget[targetId]) votesByTarget[targetId] = [];
    if (voter) votesByTarget[targetId].push(voter.name);
  });

  const handleVote = async (targetId: string) => {
    const res = await vote(targetId);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 24 }}>
        <div style={{ color: '#2ecc71' }}>Проголосовало: {voted}</div>
        <div style={{ color: '#e74c3c' }}>Не проголосовало: {notVoted}</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ textAlign: 'left', padding: 12 }}>Игрок</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Голосов</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Кто голосовал</th>
            <th style={{ textAlign: 'left', padding: 12 }}>Действие</th>
          </tr>
        </thead>
        <tbody>
          {active.map((p) => {
            const forNames = votesByTarget[p.id] || [];
            const canVote = votingOpen && p.id !== myPlayerId && !(myPlayerId && myPlayerId in room.votes);
            return (
              <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: 12 }}>{p.name}</td>
                <td style={{ padding: 12, fontWeight: 700 }}>{forNames.length}</td>
                <td style={{ padding: 12, color: '#aaa' }}>{forNames.join(', ') || '-'}</td>
                <td style={{ padding: 12 }}>
                  {canVote ? (
                    <button className="btn btn-accent" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleVote(p.id)}>Голосовать</button>
                  ) : (votingOpen ? '-' : 'Ожидание')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function GameScreen() {
  const { room, isHost, myPlayerId, playerRevealCard, playerHideCard, endTurn, funAction } = useGame();
  if (!room) return null;
  const me = room.players.find((p) => p.id === myPlayerId);
  const { pick } = useSeeded(room.code);
  const INTRO_IMAGES = ['/images/nuclear.jpg', '/images/pandemic.jpg', '/images/asteroid.jpg', '/images/ai.jpg', '/images/climate.jpg', '/images/zombie.jpg'];
  const [introOpen, setIntroOpen] = useState(room.phase === 'catastrophe');
  const [introIdx, setIntroIdx] = useState(0);
  useEffect(() => {
    if (room.phase !== 'catastrophe') return;
    setIntroOpen(true);
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setIntroIdx(i % INTRO_IMAGES.length);
    }, 260);
    const done = setTimeout(() => {
      clearInterval(iv);
      setIntroOpen(false);
    }, 2600);
    return () => {
      clearInterval(iv);
      clearTimeout(done);
    };
  }, [room.phase]);
  const bunkerFeaturePool = ['Медпункт', 'Прожектор на солнечной батарее', 'Джакузи', 'Склад инструментов', 'Радиоузел', 'Прачечная'];
  const size = 120 + ((pick([1, 2, 3, 4], 3) as number) * 24);
  const years = 1 + ((pick([1, 2, 3, 4], 7) as number));
  const months = (pick([0, 3, 6, 9], 2) as number);
  const [funTarget, setFunTarget] = useState('');
  const funActions = ['Закидать говном', 'Крикнуть: ты не пройдешь в бункер', 'Устроить абсурдный допрос', 'Потребовать раскрыть фобию', 'Обвинить в симуляции'];

  const handleEndTurn = async () => {
    const res = await endTurn();
    if (res?.error) alert(res.error);
  };

  const runFunAction = async (text: string) => {
    if (!funTarget) return alert('Выберите цель для действия');
    const res = await funAction(funTarget, text);
    if (res?.error) alert(res.error);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isHost ? '280px 1fr' : '1fr', gap: 16, paddingBottom: room.timerEndAt ? 80 : 20 }}>
      {introOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: '#000' }}>
          <img
            src={INTRO_IMAGES[introIdx] || room.catastrophe.image || '/bunker-bg.jpg'}
            alt="cat-intro"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.45s ease, opacity 0.45s ease', transform: 'translate(-6%, 6%) scale(1.08)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85))' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 900 }}>{room.catastrophe.name}</div>
              <div style={{ fontSize: 20, color: '#ddd', maxWidth: 900, marginTop: 12 }}>{room.catastrophe.description}</div>
            </div>
          </div>
        </div>
      )}
      {isHost && <HostPanelLeft />}
      <div>
        <TimerChip timerEndAt={room.timerEndAt} />

        <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <img src={room.catastrophe.image || '/bunker-bg.jpg'} alt="cat" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{room.catastrophe.name}</div>
            <div style={{ color: '#ddd', fontSize: 14 }}>{room.catastrophe.description}</div>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Бункер</div>
          <div style={{ color: '#aaa', marginBottom: 8 }}>
            Построен давно. Имеются проблемы с фильтрами. У всех общая комната.
          </div>
          <div style={{ color: '#aaa' }}>В бункере присутствует: {pick(bunkerFeaturePool, 1)}, {pick(bunkerFeaturePool, 2)}, {pick(bunkerFeaturePool, 3)}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 20, color: '#ddd' }}>
            <span>Количество мест: <b style={{ color: '#d4af37' }}>{room.settings.bunkerCapacity}</b></span>
            <span>Размер: <b>{size} м²</b></span>
            <span>Время: <b>{years} года {months} месяцев</b></span>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#d4af37' }}>
            Мои характеристики {me ? `- ${me.name}` : ''}
          </div>
          {me?.cards && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(212,175,55,0.07)' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Характеристика</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Значение</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {CARD_ORDER.map((k) => {
                  const c = (me.cards as PlayerCards)[k];
                  return (
                    <tr key={k} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: 12 }}>{c.label}</td>
                      <td style={{ padding: 12 }}>{c.value || '-'}</td>
                      <td style={{ padding: 12 }}>
                        {c.revealed ? (
                          <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => playerHideCard(k)}>Скрыть</button>
                        ) : (
                          <button className="btn btn-accent" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => playerRevealCard(k)}>Раскрыть</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {room.phase === 'game' && room.currentSpeaker === myPlayerId && (
            <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button className="btn btn-accent" style={{ padding: '8px 12px', fontSize: 13 }} onClick={handleEndTurn}>
                Завершить ход
              </button>
              <span style={{ marginLeft: 10, fontSize: 12, color: '#aaa' }}>Откройте Профессию и ещё одну карту перед завершением</span>
            </div>
          )}
        </div>

        <div className="glass" style={{ borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 700 }}>Доп. возможности (веселые)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 8 }}>
            <select className="input" style={{ padding: 8, fontSize: 12 }} value={funTarget} onChange={(e) => setFunTarget(e.target.value)}>
              <option value="">Выберите игрока</option>
              {room.players.filter((p) => p.id !== myPlayerId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {funActions.map((a) => (
                <button key={a} className="btn btn-primary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => runFunAction(a)}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass" style={{ borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Все игроки ({room.players.length})</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: 10, textAlign: 'left' }}>Имя</th>
                {CARD_ORDER.map((k) => <th key={k} style={{ padding: 10, textAlign: 'left', fontSize: 12 }}>{CARD_LABELS[k]}</th>)}
              </tr>
            </thead>
            <tbody>
              {room.players.map((p, i) => (
                <tr key={p.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)', background: p.id === myPlayerId ? 'rgba(212,175,55,0.06)' : 'transparent' }}>
                  <td style={{ padding: 10, fontWeight: 600, textDecoration: p.isEliminated ? 'line-through' : 'none', textDecorationColor: '#111', color: p.isEliminated ? '#777' : '#fff' }}>
                    {p.name}{p.id === myPlayerId ? ' (вы)' : ''}
                  </td>
                  {CARD_ORDER.map((k) => {
                    const c = p.cards ? (p.cards as PlayerCards)[k] : null;
                    return <td key={k} style={{ padding: 10, color: c?.revealed ? '#fff' : '#666' }}>{c?.revealed ? c.value : '???'}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <VotingBlock />

        {room.gameLog?.length > 0 && (
          <div className="glass" style={{ borderRadius: 12, marginTop: 12, padding: 12 }}>
            <div style={{ marginBottom: 8, fontWeight: 700 }}>События</div>
            <div style={{ maxHeight: 160, overflowY: 'auto', display: 'grid', gap: 6 }}>
              {[...room.gameLog].slice(-12).reverse().map((l, i) => (
                <div key={i} style={{ fontSize: 12, color: '#aaa' }}>
                  {new Date(l.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} — {l.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
