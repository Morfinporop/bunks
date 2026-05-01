/**
 * BUNKER ONLINE - Game Server with SQLite Database
 * Production-ready for Railway deployment
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 8080;

// ============================================================
// DATABASE SETUP
// ============================================================

const db = new Database('bunker.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    host_id TEXT NOT NULL,
    settings TEXT NOT NULL,
    catastrophe TEXT NOT NULL,
    phase TEXT DEFAULT 'lobby',
    round INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    room_code TEXT NOT NULL,
    name TEXT NOT NULL,
    is_host INTEGER DEFAULT 0,
    is_eliminated INTEGER DEFAULT 0,
    cards TEXT,
    connected INTEGER DEFAULT 1,
    FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS game_state (
    room_code TEXT PRIMARY KEY,
    current_speaker TEXT,
    votes TEXT,
    voting_active INTEGER DEFAULT 0,
    timer_end_at INTEGER,
    timer_duration INTEGER,
    game_log TEXT,
    FOREIGN KEY (room_code) REFERENCES rooms(code) ON DELETE CASCADE
  );
`);

// ============================================================
// GAME DATA
// ============================================================

const PROFESSIONS = [
  'Стриптизёрша', 'Порноактёр', 'Наркодилер', 'Онли-фанс модель', 'Бармен из стрип-клуба',
  'Сексолог', 'Массажистка (с хэппи-эндом)', 'Производитель самогона', 'Татуировщик',
  'Блогер 18+', 'Хакер даркнета', 'Владелец казино', 'Кальянный мастер', 'Ночной диджей',
  'Секс-шоп консультант', 'Пивовар', 'Охранник борделя', 'Эскорт', 'Гроувер (выращивает травку)',
  'Продавец оружия', 'Инструктор по танцам на пилоне', 'Фотограф ню', 'Букмекер',
  'Байкер', 'Токсиколог', 'Подпольный врач', 'Телохранитель мафии', 'Контрабандист',
  'Владелец подпольного бара', 'Косметолог (ботокс и силикон)'
];

const HEALTH = [
  'Абсолютно здоров', 'Венерическое заболевание (излечимое)', 'Зависимость от алкоголя',
  'Зависимость от наркотиков', 'Секс-зависимость', 'Импотенция', 'Беременна (3 месяца)',
  'ВИЧ-позитивен', 'Гепатит C', 'Биполярное расстройство', 'Шизофрения (лёгкая форма)',
  'Паранойя', 'Социопат', 'Нимфомания', 'Садомазохист', 'Тяжёлая депрессия',
  'Хронический алкоголизм', 'Наркозависимость (в ремиссии)', 'Силиконовая грудь (протекает)',
  'Импланты везде (ягодицы, губы)', 'Ботокс передоз', 'Половое бессилие',
  'Венерическая язва', 'Идеальное здоровье (редкость)'
];

const HOBBIES = [
  'Коллекционирование порно', 'BDSM практики', 'Свингерство', 'Групповой секс',
  'Выращивание марихуаны', 'Самогоноварение', 'Азартные игры', 'Стриптиз',
  'Танцы на пилоне', 'Курение травки', 'Дегустация виски', 'Татуировки',
  'Экстремальный секс', 'Вуайеризм', 'Эксгибиционизм', 'Ролевые игры 18+',
  'Коллекционирование секс-игрушек', 'Мастурбация (профессионально)', 'Оральный секс (мастер)',
  'Анальные практики', 'Фетиш-вечеринки', 'Оргии', 'Уличные драки',
  'Граффити', 'Хакерство'
];

const LUGGAGE = [
  'Килограмм травки', 'Ящик виски', 'Презервативы (1000 шт)', 'Секс-игрушки (набор)',
  'Тампоны (10 упаковок)', 'Виагра (годовой запас)', 'Порно-коллекция на жёстком диске',
  'Самогонный аппарат', 'Кальян и табак', 'Спортивное питание и стероиды',
  'Сигареты (10 блоков)', 'Энергетики (200 банок)', 'Покерный набор',
  'Пистолет и патроны', 'Кокаин (500г)', 'Viagra и MDMA', 'Казино-рулетка',
  'Алкогольная коллекция', 'Набор для татуировок', 'Баян (чтоб не скучать)',
  'Гитара и усилитель', 'Ничего (ну совсем ничего)', 'Поддельные документы',
  'Золотые слитки', 'Коллекция ножей', 'Дрон с камерой', 'Генератор и лампы для травки'
];

const PHOBIAS = [
  'Нет фобий', 'Арахнофобия', 'Клаустрофобия', 'Агорафобия',
  'Нектрофобия', 'Мизофобия (страх загрязнения)', 'Гемофобия (страх крови)',
  'Акрофобия (страх высоты)', 'Антропофобия (страх людей)', 'Никтофобия (страх темноты)',
  'Пирофобия (страх огня)', 'Ксенофобия', 'Аутофобия (страх одиночества)',
  'Социофобия', 'Танатофобия (страх смерти)', 'Бактериофобия',
  'Атихифобия (страх провала)', 'Трипофобия'
];

const SKILLS = [
  'Первая помощь', 'Рукопашный бой', 'Тактическое мышление', 'Переговорщик',
  'Взлом замков', 'Управление транспортом', 'Выживание в экстремальных условиях',
  'Химический синтез', 'Лидерство', 'Кулинария без ресурсов',
  'Ориентирование на местности', 'Психологическое давление', 'Медицинская диагностика',
  'Ремонт электроники', 'Стрельба', 'Садоводство в любых условиях',
  'Дипломатия', 'Пропаганда', 'Шпионаж и разведка', 'Обучение других',
  'Изготовление оружия', 'Добыча воды', 'Стратегическое планирование',
  'Анализ угроз', 'Кризисный менеджмент'
];

const BIOLOGY = [
  'Мужчина, 34 года', 'Женщина, 28 лет', 'Мужчина, 52 года', 'Женщина, 41 год',
  'Мужчина, 19 лет', 'Женщина, 65 лет', 'Мужчина, 47 лет', 'Женщина, 33 года',
  'Мужчина, 25 лет', 'Женщина, 58 лет', 'Небинарный человек, 30 лет',
  'Мужчина, 60 лет', 'Женщина, 22 года', 'Мужчина, 38 лет', 'Женщина, 45 лет'
];

const EXTRA_FACTS = [
  'Снимался в порно (известен)', 'Был в тюрьме за торговлю наркотиками',
  'Переспал с 500+ людьми', 'Имеет венерическое заболевание (скрывает)', 'Бисексуал',
  'Трансгендер', 'Педофил (в прошлом)', 'Серийный изменщик', 'Сутенёр',
  'Проститутка со стажем', 'Убил человека (не раскрыто)', 'Наркобарон в прошлом',
  'Знает где спрятан кокаин на $1млн', 'Импотент', 'Психопат (скрывает)',
  'Был геем на зоне', 'Носит чужой паспорт', 'Разыскивается полицией',
  'Проиграл дом в казино', 'Имеет любовницу/любовника', 'Изменял всем партнёрам',
  'Был в секте', 'Алкоголик анонимный', 'Нацист', 'Маньяк (в ремиссии)'
];

const CLASSIC_POOLS = {
  professions: ['Врач', 'Инженер', 'Биолог', 'Электрик', 'Фермер', 'Повар', 'Психолог', 'Механик', 'Пожарный', 'Программист'],
  health: ['Абсолютно здоров', 'Лёгкая астма', 'Близорукость', 'Гипертония 1 степени', 'Хронический гастрит', 'Идеальное здоровье'],
  hobby: ['Рыбалка', 'Шахматы', 'Садоводство', 'Кулинария', 'Рукопашный бой', 'Ремонт техники'],
  luggage: ['Аптечка', 'Швейцарский нож', 'Семена овощей', 'Набор инструментов', 'Радиоприёмник', 'Солнечная панель'],
  phobias: ['Нет фобий', 'Клаустрофобия', 'Арахнофобия', 'Социофобия', 'Никтофобия'],
  skills: ['Первая помощь', 'Лидерство', 'Выживание', 'Дипломатия', 'Ориентирование'],
  biology: ['Мужчина, 34 года', 'Женщина, 28 лет', 'Мужчина, 45 лет', 'Женщина, 39 лет'],
  extras: ['Знает 3 языка', 'Фотографическая память', 'Был в экспедициях', 'Обычный человек']
};

const CATASTROPHES = [
  {
    id: 'nuclear',
    name: 'Ядерная война',
    description: 'Ядерные державы нанесли удары. Поверхность заражена радиацией. Выжившие должны провести в бункере не менее 25 лет.',
    duration: '25 лет',
    threat: 'Радиация, мутации, голод',
    image: '/images/nuclear.jpg'
  },
  {
    id: 'pandemic',
    name: 'Смертельная пандемия',
    description: 'Неизвестный вирус с летальностью 99.7% распространился по всей планете. Вакцины нет.',
    duration: '15-20 лет',
    threat: 'Заражение, мутации вируса',
    image: '/images/pandemic.jpg'
  },
  {
    id: 'asteroid',
    name: 'Падение астероида',
    description: 'Астероид диаметром 2 км уничтожил крупные города. Ядерная зима продлится десятилетия.',
    duration: '30 лет',
    threat: 'Ядерная зима, голод',
    image: '/images/asteroid.jpg'
  },
  {
    id: 'ai_revolt',
    name: 'Восстание ИИ',
    description: 'Искусственный интеллект вышел из-под контроля. Машины охотятся на людей.',
    duration: 'Неопределённо',
    threat: 'Дроны, хакерские атаки',
    image: '/images/ai.jpg'
  },
  {
    id: 'climate',
    name: 'Климатическая катастрофа',
    description: 'Глобальное потепление достигло точки невозврата. Затопление побережий, ураганы.',
    duration: '50+ лет',
    threat: 'Голод, войны за ресурсы',
    image: '/images/climate.jpg'
  },
  {
    id: 'zombie',
    name: 'Зомби-апокалипсис',
    description: 'Паразит изменяет нервную систему носителя. Заражённые агрессивны и быстры.',
    duration: 'Неопределённо',
    threat: 'Укусы, нехватка ресурсов',
    image: '/images/zombie.jpg'
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPools(mode) {
  if (mode === 'classic') {
    return {
      professions: CLASSIC_POOLS.professions,
      health: CLASSIC_POOLS.health,
      hobby: CLASSIC_POOLS.hobby,
      luggage: CLASSIC_POOLS.luggage,
      phobias: CLASSIC_POOLS.phobias,
      skills: CLASSIC_POOLS.skills,
      biology: CLASSIC_POOLS.biology,
      extras: CLASSIC_POOLS.extras,
    };
  }
  return {
    professions: PROFESSIONS,
    health: HEALTH,
    hobby: HOBBIES,
    luggage: LUGGAGE,
    phobias: PHOBIAS,
    skills: SKILLS,
    biology: BIOLOGY,
    extras: EXTRA_FACTS,
  };
}

function generatePlayerCards(mode = 'adult') {
  const pools = getPools(mode);
  return {
    profession: { label: 'Профессия', value: pick(pools.professions), revealed: false },
    health: { label: 'Здоровье', value: pick(pools.health), revealed: false },
    hobby: { label: 'Хобби', value: pick(pools.hobby), revealed: false },
    luggage: { label: 'Багаж', value: pick(pools.luggage), revealed: false },
    phobia: { label: 'Фобия', value: pick(pools.phobias), revealed: false },
    skill: { label: 'Навык', value: pick(pools.skills), revealed: false },
    biology: { label: 'Биология', value: pick(pools.biology), revealed: false },
    extra: { label: 'Доп. факт', value: pick(pools.extras), revealed: false }
  };
}

function randomByCardKey(cardKey, mode = 'adult') {
  const pools = getPools(mode);
  if (cardKey === 'profession') return pick(pools.professions);
  if (cardKey === 'health') return pick(pools.health);
  if (cardKey === 'hobby') return pick(pools.hobby);
  if (cardKey === 'luggage') return pick(pools.luggage);
  if (cardKey === 'phobia') return pick(pools.phobias);
  if (cardKey === 'skill') return pick(pools.skills);
  if (cardKey === 'biology') return pick(pools.biology);
  if (cardKey === 'extra') return pick(pools.extras);
  return 'Случайное значение';
}

function getRoomState(roomCode) {
  const roomRow = db.prepare('SELECT * FROM rooms WHERE code = ?').get(roomCode);
  if (!roomRow) return null;

  // Keep stable player order by join sequence
  const players = db.prepare('SELECT * FROM players WHERE room_code = ? ORDER BY rowid ASC').all(roomCode);
  const gameState = db.prepare('SELECT * FROM game_state WHERE room_code = ?').get(roomCode);

  return {
    code: roomRow.code,
    hostId: roomRow.host_id,
    settings: JSON.parse(roomRow.settings),
    catastrophe: JSON.parse(roomRow.catastrophe),
    phase: roomRow.phase,
    round: roomRow.round,
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.is_host === 1,
      isEliminated: p.is_eliminated === 1,
      connected: p.connected === 1,
      cards: p.cards ? JSON.parse(p.cards) : null
    })),
    currentSpeaker: gameState?.current_speaker || null,
    votes: gameState?.votes ? JSON.parse(gameState.votes) : {},
    votingActive: gameState?.voting_active === 1,
    timerEndAt: gameState?.timer_end_at || null,
    timerDuration: gameState?.timer_duration || null,
    gameLog: gameState?.game_log ? JSON.parse(gameState.game_log) : []
  };
}

function getPublicRoomState(roomCode) {
  const room = getRoomState(roomCode);
  if (!room) return null;

  return {
    ...room,
    players: room.players.map(p => ({
      ...p,
      cards: p.cards ? Object.fromEntries(
        Object.entries(p.cards).map(([k, v]) => [k, {
          label: v.label,
          value: v.value,
          revealed: v.revealed
        }])
      ) : null
    }))
  };
}

function addLog(roomCode, message) {
  const gs = db.prepare('SELECT game_log FROM game_state WHERE room_code = ?').get(roomCode);
  let log = gs?.game_log ? JSON.parse(gs.game_log) : [];
  log.push({ time: Date.now(), message });
  if (log.length > 100) log = log.slice(-100);
  
  db.prepare(`
    INSERT OR REPLACE INTO game_state (room_code, game_log)
    VALUES (?, ?)
  `).run(roomCode, JSON.stringify(log));
}

// ============================================================
// SOCKET.IO
// ============================================================

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const chatMessages = new Map(); // roomCode -> messages[]
const undoStacks = new Map(); // roomCode -> actions[]

function finalizeVotingForRoom(roomCode) {
  const room = getRoomState(roomCode);
  if (!room) return { ok: false, error: 'Комната не найдена' };

  db.prepare('UPDATE game_state SET voting_active = 0 WHERE room_code = ?').run(roomCode);

  const voteCounts = {};
  Object.values(room.votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });

  let eliminatedId = null;
  let maxVotes = 0;
  Object.entries(voteCounts).forEach(([pid, count]) => {
    if (count > maxVotes) { maxVotes = count; eliminatedId = pid; }
  });

  if (eliminatedId) {
    db.prepare('UPDATE players SET is_eliminated = 1 WHERE id = ?').run(eliminatedId);
    const p = room.players.find(pl => pl.id === eliminatedId);
    if (p) addLog(roomCode, `${p.name} исключён из бункера (${maxVotes} голосов)`);
  }

  const updatedRoom = getRoomState(roomCode);
  const activePlayers = updatedRoom.players.filter(p => !p.isEliminated);

  if (activePlayers.length <= room.settings.bunkerCapacity) {
    db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run('results', roomCode);
    addLog(roomCode, 'Игра завершена! Выжившие определены.');
  } else {
    // New turn cycle
    db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run('game', roomCode);
    db.prepare('UPDATE game_state SET votes = ?, current_speaker = ? WHERE room_code = ?')
      .run('{}', activePlayers[0]?.id || null, roomCode);
    db.prepare('UPDATE game_state SET timer_end_at = ?, timer_duration = ? WHERE room_code = ?')
      .run(Date.now() + 120000, 120, roomCode);
    addLog(roomCode, `Новый круг обсуждения. Ход: ${activePlayers[0]?.name || '—'}`);
  }

  return { ok: true, eliminatedId, voteCounts };
}

function pushUndo(roomCode, action) {
  if (!undoStacks.has(roomCode)) undoStacks.set(roomCode, []);
  const stack = undoStacks.get(roomCode);
  stack.push(action);
  if (stack.length > 100) stack.shift();
}

function applyUndo(roomCode) {
  const stack = undoStacks.get(roomCode) || [];
  const action = stack.pop();
  if (!action) return { ok: false, message: 'Нет действий для отмены' };

  if (action.type === 'set_eliminated') {
    db.prepare('UPDATE players SET is_eliminated = ? WHERE id = ?').run(action.prev, action.playerId);
    return { ok: true, message: 'Отменено: статус исключения' };
  }

  if (action.type === 'set_card_value') {
    const row = db.prepare('SELECT cards FROM players WHERE id = ?').get(action.playerId);
    if (!row?.cards) return { ok: false, message: 'Игрок не найден' };
    const cards = JSON.parse(row.cards);
    if (!cards[action.cardKey]) return { ok: false, message: 'Карта не найдена' };
    cards[action.cardKey].value = action.prevValue;
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), action.playerId);
    return { ok: true, message: 'Отменено: значение карты' };
  }

  if (action.type === 'set_cards') {
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(action.prevCards), action.playerId);
    return { ok: true, message: 'Отменено: набор карт' };
  }

  return { ok: false, message: 'Неизвестный тип действия' };
}

io.on('connection', (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // ---- CREATE ROOM ----
  socket.on('create_room', ({ hostName, settings }, callback) => {
    try {
      if (!hostName?.trim()) return callback({ error: 'Введите ваше имя' });

      // Clean previous player record for this socket to avoid UNIQUE id conflicts
      db.prepare('DELETE FROM players WHERE id = ?').run(socket.id);

      let code;
      do { code = generateRoomCode(); } while (db.prepare('SELECT code FROM rooms WHERE code = ?').get(code));

      // Random catastrophe
      const catastrophe = pick(CATASTROPHES);
      
      // Validate maxPlayers (minimum 4)
      const maxPlayers = Math.max(4, settings?.maxPlayers || pick([6, 8, 10, 12]));
      
      // Calculate bunker capacity - ПОЛОВИНА от количества игроков (округление вниз)
      const bunkerCapacity = Math.max(1, Math.floor(maxPlayers / 2));

      const roomSettings = {
        maxPlayers,
        bunkerCapacity,
        roundTimer: settings?.roundTimer || 120,
        roomName: settings?.roomName || `Бункер #${code}`,
        catastropheId: catastrophe.id,
        hostName: hostName.trim(),
        mode: settings?.mode === 'classic' ? 'classic' : 'adult'
      };

      db.prepare(`
        INSERT INTO rooms (code, host_id, settings, catastrophe, phase, round)
        VALUES (?, ?, ?, ?, 'lobby', 0)
      `).run(code, socket.id, JSON.stringify(roomSettings), JSON.stringify(catastrophe));

      db.prepare(`
        INSERT INTO players (id, room_code, name, is_host, connected)
        VALUES (?, ?, ?, 1, 1)
      `).run(socket.id, code, hostName.trim());

      db.prepare(`
        INSERT INTO game_state (room_code, votes, game_log)
        VALUES (?, '{}', '[]')
      `).run(code);

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = socket.id;

      console.log(`[Room] Created: ${code} by ${hostName}`);
      callback({ success: true, room: getRoomState(code), isHost: true });
    } catch (e) {
      console.error('[create_room error]', e);
      callback({ error: 'Ошибка создания комнаты' });
    }
  });

  // ---- JOIN ROOM ----
  socket.on('join_room', ({ roomCode, playerName }, callback) => {
    try {
      // Clean previous player record for this socket to avoid UNIQUE id conflicts
      db.prepare('DELETE FROM players WHERE id = ?').run(socket.id);

      const code = roomCode?.toUpperCase().trim();
      const room = getRoomState(code);
      
      if (!room) return callback({ error: 'Комната не найдена' });
      if (room.phase !== 'lobby') return callback({ error: 'Игра уже началась' });
      if (room.players.length >= room.settings.maxPlayers) return callback({ error: 'Комната заполнена' });

      const existing = room.players.find(p => p.id === socket.id);
      if (!existing) {
        if (!playerName?.trim()) return callback({ error: 'Введите ваше имя' });
        
        db.prepare(`
          INSERT INTO players (id, room_code, name, is_host, connected)
          VALUES (?, ?, ?, 0, 1)
        `).run(socket.id, code, playerName.trim());

        addLog(code, `${playerName} вошёл в комнату`);
      } else {
        db.prepare('UPDATE players SET connected = 1 WHERE id = ?').run(socket.id);
      }

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = socket.id;

      io.to(code).emit('room_updated', getPublicRoomState(code));
      io.to(room.hostId).emit('room_host_updated', getRoomState(code));

      callback({ success: true, room: getPublicRoomState(code), isHost: false });
    } catch (e) {
      console.error('[join_room error]', e);
      callback({ error: 'Ошибка входа в комнату' });
    }
  });

  // ---- RECONNECT ----
  socket.on('reconnect_room', ({ roomCode, playerId }, callback) => {
    try {
      const room = getRoomState(roomCode);
      if (!room) return callback({ error: 'Комната не найдена' });

      const player = room.players.find(p => p.id === playerId);
      const isHostReconnect = room.hostId === playerId;
      if (!player && !isHostReconnect) return callback({ error: 'Игрок не найден' });

      // Update player's socket ID
      if (player) {
        db.prepare('UPDATE players SET id = ?, connected = 1 WHERE id = ? AND room_code = ?')
          .run(socket.id, playerId, roomCode);
      }

      if (isHostReconnect) {
        db.prepare('UPDATE rooms SET host_id = ? WHERE code = ?').run(socket.id, roomCode);
      }

      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.playerId = socket.id;

      const isHost = isHostReconnect;
      const updatedRoom = getRoomState(roomCode);
      
      io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
      if (isHost) io.to(socket.id).emit('room_host_updated', updatedRoom);

      callback({ success: true, room: isHost ? updatedRoom : getPublicRoomState(roomCode), isHost });
    } catch (e) {
      console.error('[reconnect_room error]', e);
      callback({ error: 'Ошибка переподключения' });
    }
  });

  // ---- GET ROOM STATE ----
  socket.on('get_room_state', ({ roomCode }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });
    const isHost = room.hostId === socket.id;
    callback({ success: true, room: isHost ? room : getPublicRoomState(roomCode), isHost });
  });

  // ============================================================
  // HOST ACTIONS
  // ============================================================

  function requireHost(roomCode, callback) {
    const room = getRoomState(roomCode);
    if (!room) { callback({ error: 'Комната не найдена' }); return null; }
    if (room.hostId !== socket.id) { callback({ error: 'Только ведущий может это сделать' }); return null; }
    return room;
  }

  // ---- START GAME ----
  socket.on('start_game', ({ roomCode, force }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    const participantsCount = room.players.length;
    if (!force && participantsCount < room.settings.maxPlayers) {
      return callback({ error: `Ожидание игроков: ${participantsCount}/${room.settings.maxPlayers}` });
    }
    if (participantsCount < 1) return callback({ error: 'Нужен минимум 1 игрок' });
    if (room.phase !== 'lobby') return callback({ error: 'Игра уже запущена' });

    // Assign cards
    room.players.forEach(p => {
      const cards = generatePlayerCards(room.settings.mode || 'adult');
      db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), p.id);
    });

    const firstPlayer = room.players.find(p => !p.isEliminated);
    db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run('game', roomCode);
    db.prepare('UPDATE game_state SET current_speaker = ?, timer_end_at = ?, timer_duration = ?, voting_active = 0, votes = ? WHERE room_code = ?')
      .run(firstPlayer?.id || null, Date.now() + 120000, 120, '{}', roomCode);
    addLog(roomCode, `Игра началась! Первый ход: ${firstPlayer?.name || '—'}. Откройте профессию и одну характеристику.`);

    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- END TURN ----
  socket.on('end_turn', ({ roomCode }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });
    if (room.phase !== 'game') return callback({ error: 'Сейчас не этап ходов' });

    const actor = room.players.find(p => p.id === socket.id);
    if (!actor) return callback({ error: 'Игрок не найден' });
    if (actor.id !== room.currentSpeaker) return callback({ error: 'Сейчас не ваш ход' });
    if (!actor.cards) return callback({ error: 'Карты не найдены' });

    const revealed = Object.values(actor.cards).filter(c => c.revealed).length;
    if (!actor.cards.profession.revealed || revealed < 2) {
      return callback({ error: 'Нужно раскрыть Профессию и минимум еще 1 характеристику' });
    }

    const active = room.players.filter(p => !p.isEliminated);
    const idx = active.findIndex(p => p.id === room.currentSpeaker);
    const isLast = idx === active.length - 1;

    if (isLast) {
      db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run('voting', roomCode);
      db.prepare('UPDATE game_state SET voting_active = 1, votes = ?, timer_end_at = NULL, timer_duration = NULL WHERE room_code = ?')
        .run('{}', roomCode);
      addLog(roomCode, 'Круг обсуждения завершен. Открыто голосование.');
    } else {
      const next = active[idx + 1];
      db.prepare('UPDATE game_state SET current_speaker = ?, timer_end_at = ?, timer_duration = ? WHERE room_code = ?')
        .run(next.id, Date.now() + 120000, 120, roomCode);
      addLog(roomCode, `Ход завершен. Следующий: ${next.name}`);
    }

    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- TOGGLE HOST PARTICIPATION ----
  socket.on('toggle_host_participation', ({ roomCode, include }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;

    const hostPlayer = room.players.find((p) => p.id === room.hostId);
    if (include) {
      if (!hostPlayer) {
        db.prepare(`
          INSERT INTO players (id, room_code, name, is_host, connected)
          VALUES (?, ?, ?, 1, 1)
        `).run(room.hostId, roomCode, room.settings.hostName || 'Ведущий');
        addLog(roomCode, 'Ведущий присоединился как игрок');
      }
    } else {
      if (hostPlayer) {
        db.prepare('DELETE FROM players WHERE id = ? AND room_code = ?').run(room.hostId, roomCode);
        addLog(roomCode, 'Ведущий перешёл в режим наблюдателя');
      }
    }

    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- SET PHASE ----
  socket.on('set_phase', ({ roomCode, phase }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;

    const validPhases = ['lobby', 'catastrophe', 'game', 'voting', 'results'];
    if (!validPhases.includes(phase)) return callback({ error: 'Неверная фаза' });

    db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run(phase, roomCode);

    if (phase === 'game' && room.round === 0) {
      db.prepare('UPDATE rooms SET round = 1 WHERE code = ?').run(roomCode);
      const activePlayers = room.players.filter(p => !p.isEliminated);
      if (activePlayers.length > 0) {
        db.prepare('UPDATE game_state SET current_speaker = ? WHERE room_code = ?')
          .run(activePlayers[0].id, roomCode);
      }
    }
    if (phase === 'voting') {
      db.prepare('UPDATE game_state SET votes = ?, voting_active = 1 WHERE room_code = ?')
        .run('{}', roomCode);
    }

    addLog(roomCode, `Переход к фазе: ${phase}`);
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- NEXT ROUND ----
  socket.on('next_round', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;

    const newRound = room.round + 1;
    db.prepare('UPDATE rooms SET round = ? WHERE code = ?').run(newRound, roomCode);

    const activePlayers = room.players.filter(p => !p.isEliminated);
    const currentIdx = activePlayers.findIndex(p => p.id === room.currentSpeaker);
    const nextSpeaker = activePlayers[(currentIdx + 1) % activePlayers.length]?.id || null;
    db.prepare('UPDATE game_state SET current_speaker = ? WHERE room_code = ?').run(nextSpeaker, roomCode);

    addLog(roomCode, `Раунд ${newRound}`);
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- SET SPEAKER ----
  socket.on('set_speaker', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    db.prepare('UPDATE game_state SET current_speaker = ? WHERE room_code = ?').run(playerId, roomCode);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- START TIMER ----
  socket.on('start_timer', ({ roomCode, duration }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const dur = duration || room.settings.roundTimer;
    const endAt = Date.now() + dur * 1000;
    
    db.prepare('UPDATE game_state SET timer_end_at = ?, timer_duration = ? WHERE room_code = ?')
      .run(endAt, dur, roomCode);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- STOP TIMER ----
  socket.on('stop_timer', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    db.prepare('UPDATE game_state SET timer_end_at = NULL, timer_duration = NULL WHERE room_code = ?')
      .run(roomCode);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- START VOTING ----
  socket.on('start_voting', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    db.prepare('UPDATE rooms SET phase = ? WHERE code = ?').run('voting', roomCode);
    db.prepare('UPDATE game_state SET votes = ?, voting_active = 1 WHERE room_code = ?')
      .run('{}', roomCode);
    
    addLog(roomCode, 'Голосование начато');
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- END VOTING ----
  socket.on('end_voting', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    const result = finalizeVotingForRoom(roomCode);
    if (!result.ok) return callback({ error: result.error || 'Ошибка подсчёта голосов' });
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true, eliminatedId: result.eliminatedId, voteCounts: result.voteCounts });
  });

  // ---- ELIMINATE PLAYER ----
  socket.on('eliminate_player', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    const prev = room.players.find(pl => pl.id === playerId)?.isEliminated ? 1 : 0;
    pushUndo(roomCode, { type: 'set_eliminated', playerId, prev });
    
    db.prepare('UPDATE players SET is_eliminated = 1 WHERE id = ?').run(playerId);
    const p = room.players.find(pl => pl.id === playerId);
    if (p) addLog(roomCode, `${p.name} исключён ведущим`);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- RESTORE PLAYER ----
  socket.on('restore_player', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    const prev = room.players.find(pl => pl.id === playerId)?.isEliminated ? 1 : 0;
    pushUndo(roomCode, { type: 'set_eliminated', playerId, prev });
    
    db.prepare('UPDATE players SET is_eliminated = 0 WHERE id = ?').run(playerId);
    const p = room.players.find(pl => pl.id === playerId);
    if (p) addLog(roomCode, `${p.name} восстановлен`);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- REVEAL CARD ----
  socket.on('reveal_card', ({ roomCode, playerId, cardKey }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const p = room.players.find(pl => pl.id === playerId);
    if (!p?.cards) return callback({ error: 'Карты не найдены' });
    
    const cards = p.cards;
    if (!cards[cardKey]) return callback({ error: 'Карта не найдена' });
    
    cards[cardKey].revealed = true;
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), playerId);
    addLog(roomCode, `${p.name} раскрыл карту: ${cards[cardKey].label}`);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- CHANGE CARD VALUE (HOST) ----
  socket.on('change_card_value', ({ roomCode, playerId, cardKey, newValue }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const p = room.players.find(pl => pl.id === playerId);
    if (!p?.cards) return callback({ error: 'Карты не найдены' });
    
    const cards = p.cards;
    if (!cards[cardKey]) return callback({ error: 'Карта не найдена' });
    
    pushUndo(roomCode, { type: 'set_card_value', playerId, cardKey, prevValue: cards[cardKey].value });
    cards[cardKey].value = newValue && String(newValue).trim().length > 0 ? newValue : randomByCardKey(cardKey, room.settings.mode || 'adult');
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), playerId);
    addLog(roomCode, `Ведущий изменил карту ${cards[cardKey].label} игрока ${p.name}`);
    
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- REVEAL ALL CARDS ----
  socket.on('reveal_all_cards', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const p = room.players.find(pl => pl.id === playerId);
    if (!p?.cards) return callback({ error: 'Карты не найдены' });
    
    const cards = p.cards;
    Object.keys(cards).forEach(k => { cards[k].revealed = true; });
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), playerId);
    addLog(roomCode, `${p.name} раскрыл все карты`);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- REASSIGN CARDS ----
  socket.on('reassign_cards', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const p = room.players.find(pl => pl.id === playerId);
    if (!p) return callback({ error: 'Игрок не найден' });
    
    pushUndo(roomCode, { type: 'set_cards', playerId, prevCards: p.cards });
    const newCards = generatePlayerCards(room.settings.mode || 'adult');
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(newCards), playerId);
    addLog(roomCode, `${p.name} получил новые карты`);
    
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- RESTART GAME ----
  socket.on('restart_game', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    db.prepare('UPDATE rooms SET phase = ?, round = 0 WHERE code = ?').run('lobby', roomCode);
    db.prepare('UPDATE players SET is_eliminated = 0, cards = NULL WHERE room_code = ?').run(roomCode);
    db.prepare('UPDATE game_state SET current_speaker = NULL, votes = ?, voting_active = 0, timer_end_at = NULL, timer_duration = NULL, game_log = ? WHERE room_code = ?')
      .run('{}', '[]', roomCode);
    
    const newCatastrophe = pick(CATASTROPHES);
    db.prepare('UPDATE rooms SET catastrophe = ? WHERE code = ?').run(JSON.stringify(newCatastrophe), roomCode);
    
    addLog(roomCode, 'Игра перезапущена');
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- KICK PLAYER ----
  socket.on('kick_player', ({ roomCode, playerId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const p = room.players.find(pl => pl.id === playerId);
    if (!p) return callback({ error: 'Игрок не найден' });
    
    db.prepare('DELETE FROM players WHERE id = ?').run(playerId);
    addLog(roomCode, `${p.name} выгнан из комнаты`);
    
    io.to(playerId).emit('kicked', { message: 'Вас выгнал ведущий' });
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- CHANGE CATASTROPHE ----
  socket.on('change_catastrophe', ({ roomCode, catastropheId }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    
    const c = CATASTROPHES.find(cat => cat.id === catastropheId);
    if (!c) return callback({ error: 'Катастрофа не найдена' });
    
    db.prepare('UPDATE rooms SET catastrophe = ? WHERE code = ?').run(JSON.stringify(c), roomCode);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- UNDO LAST ACTION ----
  socket.on('undo_last_action', ({ roomCode }, callback) => {
    const room = requireHost(roomCode, callback);
    if (!room) return;
    const res = applyUndo(roomCode);
    if (!res.ok) return callback({ error: res.message });
    addLog(roomCode, `Ведущий отменил действие: ${res.message}`);
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ============================================================
  // PLAYER ACTIONS
  // ============================================================

  // ---- VOTE ----
  socket.on('vote', ({ roomCode, targetId }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });
    if (!room.votingActive && room.phase !== 'voting') return callback({ error: 'Голосование не активно' });
    
    const voter = room.players.find(p => p.id === socket.id);
    if (!voter) return callback({ error: 'Вы не в этой комнате' });
    if (voter.isEliminated) return callback({ error: 'Вы исключены' });
    if (socket.id === targetId) return callback({ error: 'Нельзя голосовать за себя' });

    const votes = room.votes;
    votes[socket.id] = targetId;
    
    db.prepare('UPDATE game_state SET votes = ? WHERE room_code = ?').run(JSON.stringify(votes), roomCode);
    addLog(roomCode, `${voter.name} проголосовал`);

    const roomAfterVote = getRoomState(roomCode);
    const activeCount = roomAfterVote.players.filter(p => !p.isEliminated).length;
    if (Object.keys(roomAfterVote.votes).length >= activeCount) {
      const result = finalizeVotingForRoom(roomCode);
      if (!result.ok) return callback({ error: result.error || 'Ошибка подсчёта голосов' });
      io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
      io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
      return callback({ success: true, finalized: true });
    }
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- PLAYER REVEAL CARD ----
  socket.on('player_reveal_card', ({ roomCode, cardKey }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });

    if (room.phase === 'game' && room.currentSpeaker && room.currentSpeaker !== socket.id) {
      return callback({ error: 'Сейчас ход другого игрока' });
    }
    
    const p = room.players.find(pl => pl.id === socket.id);
    if (!p?.cards) return callback({ error: 'Карты не найдены' });
    
    const cards = p.cards;
    if (!cards[cardKey]) return callback({ error: 'Карта не найдена' });
    
    cards[cardKey].revealed = true;
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), socket.id);
    addLog(roomCode, `${p.name} раскрыл карту: ${cards[cardKey].label}`);
    
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- FUN ACTION ----
  socket.on('fun_action', ({ roomCode, targetId, actionText }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });
    const actor = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    if (!actor || !target) return callback({ error: 'Игрок не найден' });
    addLog(roomCode, `🎭 ${actor.name}: ${actionText} -> ${target.name}`);
    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- PLAYER HIDE CARD ----
  socket.on('player_hide_card', ({ roomCode, cardKey }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return callback({ error: 'Комната не найдена' });

    const p = room.players.find(pl => pl.id === socket.id);
    if (!p?.cards) return callback({ error: 'Карты не найдены' });

    const cards = p.cards;
    if (!cards[cardKey]) return callback({ error: 'Карта не найдена' });

    cards[cardKey].revealed = false;
    db.prepare('UPDATE players SET cards = ? WHERE id = ?').run(JSON.stringify(cards), socket.id);
    addLog(roomCode, `${p.name} скрыл карту: ${cards[cardKey].label}`);

    io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
    io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    callback({ success: true });
  });

  // ---- CHAT ----
  socket.on('chat_message', ({ roomCode, message }, callback) => {
    const room = getRoomState(roomCode);
    if (!room) return;
    const p = room.players.find(pl => pl.id === socket.id);
    if (!p) return;
    
    const msg = {
      playerId: socket.id,
      playerName: p.name,
      message: message.trim().slice(0, 200),
      time: Date.now()
    };
    
    if (!chatMessages.has(roomCode)) chatMessages.set(roomCode, []);
    const msgs = chatMessages.get(roomCode);
    msgs.push(msg);
    if (msgs.length > 100) msgs.shift();
    
    io.to(roomCode).emit('chat_message', msg);
    if (callback) callback({ success: true });
  });

  // ---- DISCONNECT ----
  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return;
    
    db.prepare('UPDATE players SET connected = 0 WHERE id = ?').run(socket.id);
    
    const room = getRoomState(roomCode);
    if (room) {
      const p = room.players.find(pl => pl.id === socket.id);
      if (p) addLog(roomCode, `${p.name} отключился`);
      
      io.to(roomCode).emit('room_updated', getPublicRoomState(roomCode));
      io.to(room.hostId).emit('room_host_updated', getRoomState(roomCode));
    }
  });
});

// ============================================================
// EXPRESS - Serve static files
// ============================================================

app.use(express.json());

app.get('/health', (req, res) => {
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  res.json({ status: 'ok', rooms: roomCount, uptime: process.uptime() });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Bunker Online running on port ${PORT}`);
  console.log(`[Server] Health: http://localhost:${PORT}/health`);
});

// Cleanup old rooms every hour
setInterval(() => {
  const threshold = Date.now() / 1000 - 3600; // 1 hour
  const result = db.prepare('DELETE FROM rooms WHERE created_at < ?').run(threshold);
  if (result.changes > 0) {
    console.log(`[Cleanup] Removed ${result.changes} old rooms`);
  }
}, 3600000);
