/**
 * Shared game types for Bunker Online
 */

export interface CardSlot {
  label: string;
  value: string | null; // null = hidden
  revealed: boolean;
}

export interface PlayerCards {
  profession: CardSlot;
  health: CardSlot;
  hobby: CardSlot;
  luggage: CardSlot;
  phobia: CardSlot;
  skill: CardSlot;
  biology: CardSlot;
  extra: CardSlot;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isEliminated: boolean;
  connected: boolean;
  cards: PlayerCards | null;
  // For host view only
  cardsRevealed?: PlayerCards;
}

export interface Catastrophe {
  id: string;
  name: string;
  description: string;
  duration: string;
  threat: string;
  bunkerCapacity: string;
  image?: string;
}

export interface RoomSettings {
  maxPlayers: number;
  bunkerCapacity: number;
  roundTimer: number;
  roomName: string;
  catastropheId: string;
  mode?: 'classic' | 'adult';
  hostName?: string;
}

export type GamePhase = 'lobby' | 'catastrophe' | 'game' | 'voting' | 'results';

export interface GameLog {
  time: number;
  message: string;
}

export interface RoomState {
  code: string;
  settings: RoomSettings;
  catastrophe: Catastrophe;
  players: Player[];
  phase: GamePhase;
  round: number;
  currentSpeaker: string | null;
  votes: Record<string, string>; // voterId -> targetId
  votingActive: boolean;
  eliminatedPlayers: string[];
  survivors: string[];
  timerEndAt: number | null;
  timerDuration: number | null;
  gameLog: GameLog[];
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  time: number;
}

export const CATASTROPHES_DATA = [
  {
    id: 'nuclear',
    name: 'Ядерная война',
    description: 'Ядерные державы нанесли удары. Поверхность заражена радиацией. Выжившие должны провести в бункере не менее 25 лет.',
    duration: '25 лет',
    threat: 'Радиация, мутации, голод',
    bunkerCapacity: 'Ограничено жизнеобеспечением'
  },
  {
    id: 'pandemic',
    name: 'Смертельная пандемия',
    description: 'Неизвестный вирус с летальностью 99.7% распространился по всей планете. Вакцины нет. Инкубационный период — 3 дня.',
    duration: '15-20 лет',
    threat: 'Заражение, мутации вируса, коллапс систем',
    bunkerCapacity: 'Герметичная зона для иммунных'
  },
  {
    id: 'asteroid',
    name: 'Падение астероида',
    description: 'Астероид диаметром 2 км уничтожил крупные города. Ядерная зима продлится десятилетия.',
    duration: '30 лет',
    threat: 'Ядерная зима, голод, радиация',
    bunkerCapacity: 'Максимум по запасам пищи'
  },
  {
    id: 'ai_revolt',
    name: 'Восстание ИИ',
    description: 'Искусственный интеллект вышел из-под контроля. Все сети и системы захвачены. Машины охотятся на людей.',
    duration: 'Неопределённо',
    threat: 'Дроны, хакерские атаки, отключение систем',
    bunkerCapacity: 'Без электроники — аналоговый бункер'
  },
  {
    id: 'climate',
    name: 'Климатическая катастрофа',
    description: 'Глобальное потепление достигло точки невозврата. Затопление, ураганы, непригодный воздух.',
    duration: '50+ лет',
    threat: 'Голод, войны за ресурсы, болезни',
    bunkerCapacity: 'По наличию запасов'
  },
  {
    id: 'zombie',
    name: 'Зомби-апокалипсис',
    description: 'Паразит изменяет нервную систему носителя. Заражённые агрессивны и быстры. Антидота нет.',
    duration: 'Неопределённо',
    threat: 'Укусы, паника, нехватка ресурсов',
    bunkerCapacity: 'По возможности обороны'
  }
];
