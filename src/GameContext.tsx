/**
 * GameContext - Global state management for Bunker Online
 * Manages socket connection, room state, and player actions
 */
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { socket } from './socket';
import { RoomState, ChatMessage } from './types';

interface GameContextType {
  // Connection
  connected: boolean;
  socketId: string | null;

  // Room state
  room: RoomState | null;
  isHost: boolean;
  myPlayerId: string | null;
  myPlayer: ReturnType<typeof getMyPlayer> | null;

  // Chat
  chatMessages: ChatMessage[];
  sendChat: (message: string) => void;

  // Room actions
  createRoom: (hostName: string, settings: Partial<RoomState['settings']>) => Promise<{ error?: string }>;
  joinRoom: (roomCode: string, playerName: string) => Promise<{ error?: string }>;
  reconnectRoom: (roomCode: string, playerId: string) => Promise<{ error?: string }>;

  // Host actions
  startGame: (force?: boolean) => Promise<{ error?: string }>;
  endTurn: () => Promise<{ error?: string }>;
  nextPhase: () => Promise<{ error?: string }>;
  setPhase: (phase: string) => Promise<{ error?: string }>;
  nextRound: () => Promise<{ error?: string }>;
  setSpeaker: (playerId: string) => Promise<{ error?: string }>;
  startTimer: (duration?: number) => Promise<{ error?: string }>;
  stopTimer: () => Promise<{ error?: string }>;
  startVoting: () => Promise<{ error?: string }>;
  endVoting: () => Promise<{ error?: string; eliminatedId?: string; voteCounts?: Record<string, number> }>;
  eliminatePlayer: (playerId: string) => Promise<{ error?: string }>;
  restorePlayer: (playerId: string) => Promise<{ error?: string }>;
  revealCard: (playerId: string, cardKey: string) => Promise<{ error?: string }>;
  hideCard: (playerId: string, cardKey: string) => Promise<{ error?: string }>;
  revealAllCards: (playerId: string) => Promise<{ error?: string }>;
  updateSettings: (settings: Partial<RoomState['settings']>) => Promise<{ error?: string }>;
  changeCatastrophe: (catastropheId: string) => Promise<{ error?: string }>;
  reassignCards: (playerId: string) => Promise<{ error?: string }>;
  changeCardValue: (playerId: string, cardKey: string, newValue: string) => Promise<{ error?: string }>;
  undoLastAction: () => Promise<{ error?: string }>;
  toggleHostParticipation: (include: boolean) => Promise<{ error?: string }>;
  restartGame: () => Promise<{ error?: string }>;
  kickPlayer: (playerId: string) => Promise<{ error?: string }>;

  // Player actions
  vote: (targetId: string) => Promise<{ error?: string }>;
  playerRevealCard: (cardKey: string) => Promise<{ error?: string }>;
  playerHideCard: (cardKey: string) => Promise<{ error?: string }>;
  funAction: (targetId: string, actionText: string) => Promise<{ error?: string }>;

  // Session persistence
  sessionRoomCode: string | null;
  sessionPlayerId: string | null;
  clearSession: () => void;
}

function getMyPlayer(room: RoomState | null, myPlayerId: string | null) {
  if (!room || !myPlayerId) return null;
  return room.players.find(p => p.id === myPlayerId) || null;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState<string | null>(socket.id || null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessionRoomCode, setSessionRoomCode] = useState<string | null>(
    () => sessionStorage.getItem('bunker_room_code')
  );
  const [sessionPlayerId, setSessionPlayerId] = useState<string | null>(
    () => sessionStorage.getItem('bunker_player_id')
  );
  const isHostRef = useRef(isHost);
  isHostRef.current = isHost;

  const emit = useCallback(<T,>(event: string, data: object): Promise<T> => {
    return new Promise((resolve) => {
      socket.emit(event, data, (response: T) => resolve(response));
    });
  }, []);

  // Socket event handlers
  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setSocketId(socket.id || null);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onRoomUpdated = (roomState: RoomState) => {
      setRoom(roomState);
    };

    const onRoomHostUpdated = (roomState: RoomState) => {
      if (isHostRef.current) {
        setRoom(roomState);
      }
    };

    const onChatMessage = (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-99), msg]);
    };

    const onKicked = () => {
      setRoom(null);
      setIsHost(false);
      setMyPlayerId(null);
      clearSession();
      alert('Вас выгнал ведущий из комнаты');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room_updated', onRoomUpdated);
    socket.on('room_host_updated', onRoomHostUpdated);
    socket.on('chat_message', onChatMessage);
    socket.on('kicked', onKicked);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room_updated', onRoomUpdated);
      socket.off('room_host_updated', onRoomHostUpdated);
      socket.off('chat_message', onChatMessage);
      socket.off('kicked', onKicked);
    };
  }, []);

  const saveSession = useCallback((roomCode: string, playerId: string) => {
    sessionStorage.setItem('bunker_room_code', roomCode);
    sessionStorage.setItem('bunker_player_id', playerId);
    setSessionRoomCode(roomCode);
    setSessionPlayerId(playerId);
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('bunker_room_code');
    sessionStorage.removeItem('bunker_player_id');
    setSessionRoomCode(null);
    setSessionPlayerId(null);
  }, []);

  // Room actions
  const createRoom = useCallback(async (hostName: string, settings: Partial<RoomState['settings']>) => {
    const res = await emit<{ error?: string; room?: RoomState; isHost?: boolean }>('create_room', { hostName, settings });
    if (res.error) return { error: res.error };
    setRoom(res.room!);
    setIsHost(true);
    setMyPlayerId(socket.id || null);
    saveSession(res.room!.code, socket.id || '');
    return {};
  }, [emit, saveSession]);

  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    const res = await emit<{ error?: string; room?: RoomState; isHost?: boolean }>('join_room', { roomCode, playerName });
    if (res.error) return { error: res.error };
    setRoom(res.room!);
    setIsHost(res.isHost || false);
    setMyPlayerId(socket.id || null);
    saveSession(res.room!.code, socket.id || '');
    return {};
  }, [emit, saveSession]);

  const reconnectRoom = useCallback(async (roomCode: string, playerId: string) => {
    const res = await emit<{ error?: string; room?: RoomState; isHost?: boolean }>('reconnect_room', { roomCode, playerId });
    if (res.error) return { error: res.error };
    setRoom(res.room!);
    setIsHost(res.isHost || false);
    setMyPlayerId(socket.id || null);
    saveSession(res.room!.code, socket.id || '');
    return {};
  }, [emit, saveSession]);

  // Host actions
  const startGame = useCallback(async (force?: boolean) => {
    const res = await emit<{ error?: string }>('start_game', { roomCode: room?.code, force: !!force });
    return res;
  }, [emit, room]);

  const endTurn = useCallback(async () => {
    const res = await emit<{ error?: string }>('end_turn', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const nextPhase = useCallback(async () => {
    const res = await emit<{ error?: string }>('next_phase', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const setPhase = useCallback(async (phase: string) => {
    const res = await emit<{ error?: string }>('set_phase', { roomCode: room?.code, phase });
    return res;
  }, [emit, room]);

  const nextRound = useCallback(async () => {
    const res = await emit<{ error?: string }>('next_round', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const setSpeaker = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('set_speaker', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  const startTimer = useCallback(async (duration?: number) => {
    const res = await emit<{ error?: string }>('start_timer', { roomCode: room?.code, duration });
    return res;
  }, [emit, room]);

  const stopTimer = useCallback(async () => {
    const res = await emit<{ error?: string }>('stop_timer', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const startVoting = useCallback(async () => {
    const res = await emit<{ error?: string }>('start_voting', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const endVoting = useCallback(async () => {
    const res = await emit<{ error?: string; eliminatedId?: string; voteCounts?: Record<string, number> }>('end_voting', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const eliminatePlayer = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('eliminate_player', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  const restorePlayer = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('restore_player', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  const revealCard = useCallback(async (playerId: string, cardKey: string) => {
    const res = await emit<{ error?: string }>('reveal_card', { roomCode: room?.code, playerId, cardKey });
    return res;
  }, [emit, room]);

  const hideCard = useCallback(async (playerId: string, cardKey: string) => {
    const res = await emit<{ error?: string }>('hide_card', { roomCode: room?.code, playerId, cardKey });
    return res;
  }, [emit, room]);

  const revealAllCards = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('reveal_all_cards', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  const updateSettings = useCallback(async (settings: Partial<RoomState['settings']>) => {
    const res = await emit<{ error?: string }>('update_settings', { roomCode: room?.code, settings });
    return res;
  }, [emit, room]);

  const changeCatastrophe = useCallback(async (catastropheId: string) => {
    const res = await emit<{ error?: string }>('change_catastrophe', { roomCode: room?.code, catastropheId });
    return res;
  }, [emit, room]);

  const reassignCards = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('reassign_cards', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  const changeCardValue = useCallback(async (playerId: string, cardKey: string, newValue: string) => {
    const res = await emit<{ error?: string }>('change_card_value', { roomCode: room?.code, playerId, cardKey, newValue });
    return res;
  }, [emit, room]);

  const undoLastAction = useCallback(async () => {
    const res = await emit<{ error?: string }>('undo_last_action', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const toggleHostParticipation = useCallback(async (include: boolean) => {
    const res = await emit<{ error?: string }>('toggle_host_participation', { roomCode: room?.code, include });
    return res;
  }, [emit, room]);

  const restartGame = useCallback(async () => {
    const res = await emit<{ error?: string }>('restart_game', { roomCode: room?.code });
    return res;
  }, [emit, room]);

  const kickPlayer = useCallback(async (playerId: string) => {
    const res = await emit<{ error?: string }>('kick_player', { roomCode: room?.code, playerId });
    return res;
  }, [emit, room]);

  // Player actions
  const vote = useCallback(async (targetId: string) => {
    const res = await emit<{ error?: string }>('vote', { roomCode: room?.code, targetId });
    return res;
  }, [emit, room]);

  const playerRevealCard = useCallback(async (cardKey: string) => {
    const res = await emit<{ error?: string }>('player_reveal_card', { roomCode: room?.code, cardKey });
    return res;
  }, [emit, room]);

  const playerHideCard = useCallback(async (cardKey: string) => {
    const res = await emit<{ error?: string }>('player_hide_card', { roomCode: room?.code, cardKey });
    return res;
  }, [emit, room]);

  const funAction = useCallback(async (targetId: string, actionText: string) => {
    const res = await emit<{ error?: string }>('fun_action', { roomCode: room?.code, targetId, actionText });
    return res;
  }, [emit, room]);

  const sendChat = useCallback((message: string) => {
    if (!message.trim() || !room) return;
    socket.emit('chat_message', { roomCode: room.code, message });
  }, [room]);

  const myPlayer = getMyPlayer(room, myPlayerId);

  return (
    <GameContext.Provider value={{
      connected, socketId,
      room, isHost, myPlayerId, myPlayer,
      chatMessages, sendChat,
      createRoom, joinRoom, reconnectRoom,
      startGame, endTurn, nextPhase, setPhase, nextRound, setSpeaker,
      startTimer, stopTimer, startVoting, endVoting,
      eliminatePlayer, restorePlayer, revealCard, hideCard, revealAllCards,
      updateSettings, changeCatastrophe, reassignCards, changeCardValue, undoLastAction, toggleHostParticipation, restartGame, kickPlayer,
      vote, playerRevealCard, playerHideCard, funAction,
      sessionRoomCode, sessionPlayerId, clearSession
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
