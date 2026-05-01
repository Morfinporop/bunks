import { useGame } from '../../GameContext';
import { VoteIcon } from '../Icons';

export default function VotingScreen() {
  const { room, isHost, myPlayerId, vote, endVoting } = useGame();

  if (!room) return null;

  const activePlayers = room.players.filter(p => !p.isEliminated);
  const hasVoted = myPlayerId ? myPlayerId in room.votes : false;
  const totalVoted = Object.keys(room.votes).length;
  const totalPlayers = activePlayers.length;
  const notVoted = totalPlayers - totalVoted;

  const handleVote = async (targetId: string) => {
    if (hasVoted || !room.votingActive) return;
    await vote(targetId);
  };

  const handleEndVoting = async () => {
    if (confirm(`Завершить голосование? Проголосовало: ${totalVoted}/${totalPlayers}`)) {
      await endVoting();
    }
  };

  // Подсчет голосов для каждого игрока
  const voteCounts: Record<string, number> = {};
  const whoVotedFor: Record<string, string[]> = {};
  
  Object.entries(room.votes).forEach(([voterId, targetId]) => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    if (!whoVotedFor[targetId]) whoVotedFor[targetId] = [];
    const voter = room.players.find(p => p.id === voterId);
    if (voter) whoVotedFor[targetId].push(voter.name);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass" style={{ padding: '32px', borderRadius: '16px', textAlign: 'center' }}>
        <VoteIcon style={{ width: '56px', height: '56px', color: '#d4af37', margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>ГОЛОСОВАНИЕ</h2>
        <p style={{ color: '#aaa', fontSize: '16px', marginBottom: '20px' }}>
          Выберите игрока для исключения из бункера
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Проголосовало</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#2ecc71' }}>{totalVoted}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Не проголосовало</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#e74c3c' }}>{notVoted}</div>
          </div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Всего игроков</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>{totalPlayers}</div>
          </div>
        </div>
      </div>

      {/* Voting Table */}
      <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#aaa', width: '30%' }}>
                КАНДИДАТ
              </th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#aaa', width: '15%' }}>
                ГОЛОСОВ
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: '#aaa', width: '40%' }}>
                КТО ПРОГОЛОСОВАЛ
              </th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#aaa', width: '15%' }}>
                ДЕЙСТВИЕ
              </th>
            </tr>
          </thead>
          <tbody>
            {activePlayers.map((player, idx) => {
              const isMyVoteTarget = room.votes[myPlayerId || ''] === player.id;
              const isSelf = player.id === myPlayerId;
              const canVote = room.votingActive && !hasVoted && !isSelf;
              const voteCount = voteCounts[player.id] || 0;
              const voters = whoVotedFor[player.id] || [];

              return (
                <tr key={player.id} style={{ 
                  borderBottom: idx < activePlayers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: isMyVoteTarget ? 'rgba(212,175,55,0.1)' : 'transparent'
                }}>
                  <td style={{ padding: '16px', fontSize: '16px', color: '#fff', fontWeight: 600 }}>
                    {player.name}
                    {isSelf && <span style={{ fontSize: '13px', color: '#d4af37', marginLeft: '8px' }}>(ВЫ)</span>}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '24px', fontWeight: 900, color: voteCount > 0 ? '#e74c3c' : '#555' }}>
                    {voteCount}
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#aaa' }}>
                    {voters.length > 0 ? voters.join(', ') : '—'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {isMyVoteTarget ? (
                      <span style={{ fontSize: '13px', color: '#d4af37', fontWeight: 700 }}>✓ Ваш голос</span>
                    ) : canVote ? (
                      <button 
                        onClick={() => handleVote(player.id)}
                        className="btn btn-accent"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        Голосовать
                      </button>
                    ) : isSelf ? (
                      <span style={{ fontSize: '12px', color: '#666' }}>Нельзя</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#666' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Host Controls */}
      {isHost && (
        <button 
          onClick={handleEndVoting} 
          className="btn btn-accent" 
          style={{ width: '100%', fontSize: '18px', padding: '18px' }}
        >
          Завершить голосование и исключить игрока
        </button>
      )}

      {/* Player Status */}
      {!isHost && hasVoted && (
        <div className="glass" style={{ padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#2ecc71', fontSize: '16px', fontWeight: 600 }}>
            ✓ Ваш голос принят. Ожидание завершения голосования...
          </p>
        </div>
      )}
    </div>
  );
}
